"""SQLite persistence (DATA-001, SEC-001).
Stores players, match history, annotations, rosters, vacancies, data sources, and recommendations.
"""
import json, os, sqlite3, uuid
from pathlib import Path
from .catalog import GAMES, normalize_game_name
from .scoring import derive_history_metrics, trend_label

def db_path():
    return os.environ.get("SCOUTGRID_DB", str(Path(__file__).resolve().parents[2] / "data" / "scoutgrid.db"))

def connect():
    Path(db_path()).parent.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(db_path())
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA foreign_keys=ON")
    return c

SCHEMA = """
CREATE TABLE IF NOT EXISTS games(
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users(
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  organization TEXT NOT NULL,
  salt TEXT NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS data_sources(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file_sha256 TEXT,
  uploaded_by TEXT,
  uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS players(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  game TEXT NOT NULL REFERENCES games(code),
  role TEXT NOT NULL,
  secondary_roles TEXT NOT NULL DEFAULT '[]',
  matches_played INTEGER NOT NULL CHECK(matches_played>=0),
  metrics TEXT NOT NULL,
  provenance TEXT NOT NULL,
  synthetic INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL,
  availability TEXT DEFAULT 'available',
  language TEXT DEFAULT 'en',
  utc_offset INTEGER DEFAULT 0,
  UNIQUE(game, name)
);

CREATE TABLE IF NOT EXISTS match_history(
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  idx INTEGER NOT NULL,
  rating REAL NOT NULL,
  PRIMARY KEY(player_id, idx)
);

CREATE TABLE IF NOT EXISTS annotations(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  igl_rating INTEGER NOT NULL CHECK(igl_rating >= 1 AND igl_rating <= 5),
  annotator TEXT NOT NULL,
  date TEXT NOT NULL,
  note TEXT
);

CREATE TABLE IF NOT EXISTS matches(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  match_date TEXT NOT NULL,
  tournament TEXT NOT NULL,
  map_name TEXT NOT NULL,
  opponent TEXT NOT NULL,
  score TEXT NOT NULL,
  result TEXT NOT NULL,
  rating REAL NOT NULL,
  combat_stat REAL NOT NULL,
  kills INTEGER NOT NULL,
  deaths INTEGER NOT NULL,
  assists INTEGER NOT NULL,
  clutches_won INTEGER DEFAULT 0,
  first_bloods INTEGER DEFAULT 0,
  shotcall_impact REAL DEFAULT 0,
  situational_event TEXT
);

CREATE TABLE IF NOT EXISTS rosters(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  game TEXT NOT NULL REFERENCES games(code),
  target_profile TEXT DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS roster_members(
  roster_id INTEGER NOT NULL REFERENCES rosters(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL UNIQUE REFERENCES players(id),
  slot_role TEXT NOT NULL,
  PRIMARY KEY(roster_id, player_id)
);

CREATE TABLE IF NOT EXISTS vacancies(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  roster_id INTEGER NOT NULL REFERENCES rosters(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  priority TEXT DEFAULT 'high',
  requirements TEXT DEFAULT '{}',
  status TEXT DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations(
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications(
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

CREATE TABLE IF NOT EXISTS revoked_tokens(
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  revoked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_resets(
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watchlist_entries(
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'Shortlisted',
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, player_id)
);
"""

def init(conn):
    conn.executescript(SCHEMA)
    for code, g in GAMES.items():
        conn.execute("INSERT OR IGNORE INTO games(code,name) VALUES(?,?)", (code, g["name"]))
    
    # Initialize default users in database
    default_users_data = [
        ("USR-001", "maya", "Maya Lin", "ROLE_GM", "Logic Legend Esports", "d4a8e6f1a9b2c3d4", "cb2411e72e0bf32a5dfae70b80ba8d2bcfbf5fec0db6a54101e4ecba0bb51fc9"),
        ("USR-002", "dev", "Dev Sharma", "ROLE_COACH", "Logic Legend Esports", "e1f2a3b4c5d6e7f8", "3e9b068da6c1e309cb936ea4aaae7e35bcfbeab9f6f6630f9a5d45d8b2d4fef6"),
        ("USR-003", "arjun", "Arjun Patel", "ROLE_SCOUT", "Logic Legend Esports", "a9b8c7d6e5f4a3b2", "310344d2d46e3e1be22a6113b5a19ef47e452145bfeae21262d989f6b9ce0552"),
    ]
    for uid, uname, name, role, org, salt, pw_hash in default_users_data:
        conn.execute(
            "INSERT OR IGNORE INTO users(id, username, name, role, organization, salt, password_hash) VALUES(?,?,?,?,?,?,?)",
            (uid, uname, name, role, org, salt, pw_hash)
        )
    
    # Seed initial realistic notifications for Maya (GM) if none exist
    notif_count = conn.execute("SELECT COUNT(*) FROM notifications WHERE user_id='USR-001'").fetchone()[0]
    if notif_count == 0:
        sample_notifs = [
            ("NTF-001", "USR-001", "vacancy", "Sentinels Vacancy Created", "Priority Controller gap opened for VCT Americas Split 2.", "roster", "1", 0, "2024-10-24 10:30:00"),
            ("NTF-002", "USR-001", "scouting", "Scouting Recommendation Ready", "Mirage ranked #1 for Sentinels Controller vacancy (74.8 Fit, High confidence).", "player", "VAL-002", 0, "2024-10-24 11:15:00"),
            ("NTF-003", "USR-001", "analysis", "Decoy Frag Profile Warning", "Voltz flagged as Statistical Decoy (49.3 Fit, 30/100 Utility rating).", "player", "VAL-003", 0, "2024-10-24 12:00:00"),
            ("NTF-004", "USR-001", "synergy", "Fnatic CS2 Lineup Synced", "Roster coordination index updated to 84.5% synergy across 5 roles.", "roster", "2", 1, "2024-10-23 18:20:00"),
        ]
        conn.executemany(
            "INSERT OR IGNORE INTO notifications(id, user_id, type, title, message, resource_type, resource_id, is_read, created_at) VALUES(?,?,?,?,?,?,?,?,?)",
            sample_notifs
        )
    conn.commit()

def load_players(conn, game=None):
    norm_game = normalize_game_name(game) if game else None
    q = "SELECT * FROM players" + (" WHERE game=? OR game=?" if norm_game else "") + " ORDER BY id"
    params = (norm_game, norm_game.upper()) if norm_game else ()
    rows = conn.execute(q, params).fetchall()

    hist = {}
    for h in conn.execute("SELECT player_id, rating FROM match_history ORDER BY player_id, idx"):
        hist.setdefault(h["player_id"], []).append(h["rating"])

    annots = {}
    for a in conn.execute("SELECT player_id, igl_rating, annotator, date, note FROM annotations"):
        annots.setdefault(a["player_id"], []).append(dict(a))

    rostered = {r["player_id"]: (r["roster_id"], r["slot_role"]) for r in conn.execute("SELECT * FROM roster_members")}
    out = []
    for r in rows:
        m, pv = json.loads(r["metrics"]), json.loads(r["provenance"])
        h = hist.get(r["id"], [])
        sd, slope = derive_history_metrics(h)
        if sd is not None and "rating_stdev" not in m:
            m["rating_stdev"], pv["rating_stdev"] = sd, "derived"

        p_annots = annots.get(r["id"], [])
        igl_ratings = [a["igl_rating"] for a in p_annots]
        igl_score = round(sum(igl_ratings) / len(igl_ratings) * 20.0, 1) if len(igl_ratings) >= 2 else None

        avail = r["availability"] if "availability" in r.keys() else "available"
        lang = r["language"] if "language" in r.keys() else "en"
        utc = r["utc_offset"] if "utc_offset" in r.keys() else 0

        out.append({
            "id": r["id"],
            "name": r["name"],
            "game": r["game"],
            "role": r["role"],
            "secondary_roles": json.loads(r["secondary_roles"]) if r["secondary_roles"] else [],
            "matches_played": r["matches_played"],
            "rounds_played": r["matches_played"],  # rounds_played alias
            "metrics": m,
            "provenance": pv,
            "history": h,
            "trend_slope": slope,
            "trend": trend_label(slope),
            "synthetic": bool(r["synthetic"]),
            "source": r["source"],
            "availability": avail,
            "language": lang,
            "utc_offset": utc,
            "annotations": p_annots,
            "igl_score": igl_score,
            "roster_id": rostered.get(r["id"], (None, None))[0],
            "slot_role": rostered.get(r["id"], (None, None))[1],
        })
    return out

def load_player_matches(conn, player_id=None, limit=20):
    if player_id:
        rows = conn.execute(
            "SELECT * FROM matches WHERE player_id=? ORDER BY id DESC LIMIT ?",
            (player_id, limit)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM matches ORDER BY id DESC LIMIT ?",
            (limit,)
        ).fetchall()
    return [dict(r) for r in rows]

# ---------- Notification Helpers ----------
def create_notification(conn, user_id, notif_type, title, message, resource_type=None, resource_id=None):
    notif_id = f"NTF-{uuid.uuid4().hex[:8]}"
    conn.execute(
        "INSERT INTO notifications(id, user_id, type, title, message, resource_type, resource_id, is_read) VALUES(?,?,?,?,?,?,?,0)",
        (notif_id, user_id, notif_type, title, message, resource_type, str(resource_id) if resource_id else None)
    )
    conn.commit()
    return notif_id

def list_notifications(conn, user_id, limit=50, offset=0):
    rows = conn.execute(
        "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        (user_id, limit, offset)
    ).fetchall()
    return [dict(r) for r in rows]

def get_unread_count(conn, user_id):
    row = conn.execute(
        "SELECT COUNT(*) FROM notifications WHERE user_id=? AND is_read=0",
        (user_id,)
    ).fetchone()
    return row[0] if row else 0

def mark_notification_read(conn, notif_id, user_id):
    cur = conn.execute(
        "UPDATE notifications SET is_read=1, read_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?",
        (notif_id, user_id)
    )
    conn.commit()
    return cur.rowcount > 0

def mark_all_notifications_read(conn, user_id):
    cur = conn.execute(
        "UPDATE notifications SET is_read=1, read_at=CURRENT_TIMESTAMP WHERE user_id=? AND is_read=0",
        (user_id,)
    )
    conn.commit()
    return cur.rowcount

# ---------- User & Auth Helpers ----------
def get_user_by_id(conn, user_id):
    row = conn.execute("SELECT id, username, name, role, organization, salt, password_hash FROM users WHERE id=?", (user_id,)).fetchone()
    return dict(row) if row else None

def get_user_by_username(conn, username):
    row = conn.execute("SELECT id, username, name, role, organization, salt, password_hash FROM users WHERE LOWER(username)=LOWER(?)", (username.strip(),)).fetchone()
    return dict(row) if row else None

def create_user(conn, user_id, username, name, role, organization, salt, password_hash):
    conn.execute(
        "INSERT INTO users(id, username, name, role, organization, salt, password_hash) VALUES(?,?,?,?,?,?,?)",
        (user_id, username.strip(), name.strip(), role, organization.strip(), salt, password_hash)
    )
    conn.commit()
    return get_user_by_id(conn, user_id)

def revoke_token(conn, token_hash, user_id):
    conn.execute(
        "INSERT OR IGNORE INTO revoked_tokens(token_hash, user_id) VALUES(?,?)",
        (token_hash, user_id)
    )
    conn.commit()

def is_token_revoked(conn, token_hash):
    row = conn.execute("SELECT 1 FROM revoked_tokens WHERE token_hash=?", (token_hash,)).fetchone()
    return row is not None

def create_password_reset(conn, token, user_id, expires_at):
    conn.execute(
        "INSERT INTO password_resets(token, user_id, expires_at, used) VALUES(?,?,?,0)",
        (token, user_id, expires_at)
    )
    conn.commit()

def get_password_reset(conn, token):
    row = conn.execute("SELECT * FROM password_resets WHERE token=? AND used=0", (token,)).fetchone()
    return dict(row) if row else None

def use_password_reset(conn, token, new_hash, new_salt):
    reset = get_password_reset(conn, token)
    if not reset:
        return False
    conn.execute("UPDATE password_resets SET used=1 WHERE token=?", (token,))
    conn.execute("UPDATE users SET password_hash=?, salt=? WHERE id=?", (new_hash, new_salt, reset["user_id"]))
    conn.commit()
    return True

# ---------- Watchlist Helpers ----------
def list_watchlist(conn, user_id):
    rows = conn.execute(
        """SELECT w.id, w.user_id, w.player_id, w.stage, w.notes, w.created_at, w.updated_at,
                  p.name, p.game, p.role, p.matches_played, p.availability
           FROM watchlist_entries w
           JOIN players p ON w.player_id = p.id
           WHERE w.user_id = ?
           ORDER BY w.updated_at DESC""",
        (user_id,)
    ).fetchall()
    return [dict(r) for r in rows]

def add_to_watchlist(conn, user_id, player_id, stage='Shortlisted', notes=''):
    entry_id = f"WL-{uuid.uuid4().hex[:8]}"
    conn.execute(
        """INSERT INTO watchlist_entries(id, user_id, player_id, stage, notes, updated_at)
           VALUES(?,?,?,?,?, CURRENT_TIMESTAMP)
           ON CONFLICT(user_id, player_id) DO UPDATE SET stage=excluded.stage, notes=excluded.notes, updated_at=CURRENT_TIMESTAMP""",
        (entry_id, user_id, player_id, stage, notes)
    )
    conn.commit()
    return entry_id

def update_watchlist_stage(conn, entry_id, user_id, stage, notes=None):
    if notes is not None:
        cur = conn.execute(
            "UPDATE watchlist_entries SET stage=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?",
            (stage, notes, entry_id, user_id)
        )
    else:
        cur = conn.execute(
            "UPDATE watchlist_entries SET stage=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?",
            (stage, entry_id, user_id)
        )
    conn.commit()
    return cur.rowcount > 0

def remove_from_watchlist(conn, entry_id, user_id):
    cur = conn.execute("DELETE FROM watchlist_entries WHERE id=? AND user_id=?", (entry_id, user_id))
    conn.commit()
    return cur.rowcount > 0


