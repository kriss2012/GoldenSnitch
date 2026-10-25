"""SQLite persistence (DATA-001, SEC-001).
Stores players, match history, annotations, rosters, vacancies, data sources, and recommendations.
"""
import json, os, sqlite3, uuid
from pathlib import Path
from .catalog import GAMES, normalize_game_name
from .scoring import derive_history_metrics, trend_label

def db_path():
    env_val = os.environ.get("SCOUTGRID_DB")
    if not env_val:
        return str(Path(__file__).resolve().parents[2] / "data" / "scoutgrid.db")
    p = Path(env_val)
    if p.is_absolute():
        return str(p)
    return str(Path(__file__).resolve().parents[2] / p)

def connect():
    Path(db_path()).parent.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(db_path(), timeout=15.0)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA foreign_keys=ON")
    c.execute("PRAGMA journal_mode=WAL")
    c.execute("PRAGMA synchronous=NORMAL")
    c.execute("PRAGMA cache_size=-64000")
    c.execute("PRAGMA temp_store=MEMORY")

    # Auto-initialize schema if new or empty database
    try:
        tables = {r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()}
        if "users" not in tables or "players" not in tables:
            init(c)
        if not os.environ.get("SCOUTGRID_DB"):
            p_cnt = c.execute("SELECT COUNT(*) FROM players").fetchone()[0]
            if p_cnt < 600:
                try:
                    from simulator.generator import Simulator
                    from .seed import seed
                    sim = Simulator(seed=42, target_players=600, target_maps=15000)
                    sim.generate_universe(c)
                    seed(c, reset=False)
                except Exception:
                    pass
    except Exception:
        pass

    return c

SCHEMA = """
CREATE TABLE IF NOT EXISTS games(
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users(
  id TEXT PRIMARY KEY,
  org TEXT NOT NULL DEFAULT 'Logic Legend Esports',
  organization TEXT NOT NULL DEFAULT 'Logic Legend Esports',
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'ROLE_SCOUT',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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

CREATE TABLE IF NOT EXISTS external_providers(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  supported_games TEXT NOT NULL,
  base_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy',
  rate_limit_rpm INTEGER DEFAULT 60,
  last_health_check TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_identities(
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  external_id TEXT NOT NULL,
  handle_at_source TEXT NOT NULL,
  verified INTEGER NOT NULL DEFAULT 0,
  freshness_status TEXT NOT NULL DEFAULT 'current',
  last_synced_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  raw_metadata TEXT DEFAULT '{}',
  UNIQUE(provider_name, external_id)
);
CREATE INDEX IF NOT EXISTS idx_player_identities_player ON player_identities(player_id);

CREATE TABLE IF NOT EXISTS public_profiles(
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL UNIQUE REFERENCES players(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  is_public INTEGER NOT NULL DEFAULT 1,
  bio TEXT DEFAULT '',
  social_links TEXT DEFAULT '{}',
  verified_badge INTEGER NOT NULL DEFAULT 0,
  claimed_by_user_id TEXT REFERENCES users(id),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_public_profiles_slug ON public_profiles(slug);

CREATE TABLE IF NOT EXISTS profile_claims(
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  verification_method TEXT NOT NULL,
  verification_code TEXT,
  evidence_text TEXT DEFAULT '',
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TEXT,
  rejection_reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_profile_claims_user ON profile_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_claims_status ON profile_claims(status);

CREATE TABLE IF NOT EXISTS organizations(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  tag TEXT NOT NULL,
  logo_url TEXT,
  description TEXT DEFAULT '',
  owner_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization_members(
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'scout',
  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS organization_invitations(
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'scout',
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shared_reports(
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  candidate_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  roster_id INTEGER REFERENCES rosters(id),
  share_token TEXT NOT NULL UNIQUE,
  is_public INTEGER NOT NULL DEFAULT 1,
  is_revoked INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER,
  created_by TEXT NOT NULL REFERENCES users(id),
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_shared_reports_token ON shared_reports(share_token);

CREATE TABLE IF NOT EXISTS data_correction_requests(
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_correction_requests_player ON data_correction_requests(player_id);
CREATE INDEX IF NOT EXISTS idx_correction_requests_status ON data_correction_requests(status);
CREATE INDEX IF NOT EXISTS idx_players_game_role ON players(game, role);
CREATE INDEX IF NOT EXISTS idx_players_game_id ON players(game, id);
CREATE INDEX IF NOT EXISTS idx_matches_player_date ON matches(player_id, id DESC);
CREATE INDEX IF NOT EXISTS idx_match_history_player ON match_history(player_id, idx);
CREATE INDEX IF NOT EXISTS idx_roster_members_roster ON roster_members(roster_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_lookup ON organization_members(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_annotations_player ON annotations(player_id);
"""


def init(conn):
    conn.executescript(SCHEMA)
    from .db_core_schema import init_core_schema
    init_core_schema(conn)
    for code, g in GAMES.items():
        conn.execute("INSERT OR IGNORE INTO games(code,name) VALUES(?,?)", (code, g["name"]))
    
    # Dynamic column migrations for users table
    try:
        cols = {row[1] for row in conn.execute("PRAGMA table_info(users)").fetchall()}
        if "email" not in cols:
            conn.execute("ALTER TABLE users ADD COLUMN email TEXT")
        if "org" not in cols:
            conn.execute("ALTER TABLE users ADD COLUMN org TEXT NOT NULL DEFAULT 'Logic Legend Esports'")
        if "active" not in cols:
            conn.execute("ALTER TABLE users ADD COLUMN active INTEGER NOT NULL DEFAULT 1")
        if "created_at" not in cols:
            conn.execute("ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT ''")
    except Exception:
        pass

    # Base system user accounts for foreign key consistency (generic role titles)
    from .auth import hash_password as legacy_hash
    base_users = [
        ("USR-001", "Logic Legend Esports", "Logic Legend Esports", "General Manager", "gm@goldensnitch.gg", "maya", legacy_hash("admin123", "d4a8e6f1a9b2c3d4")[0], "d4a8e6f1a9b2c3d4", "ROLE_GM", 1),
        ("USR-002", "Logic Legend Esports", "Logic Legend Esports", "Head Coach", "coach@goldensnitch.gg", "dev", legacy_hash("coach123", "e1f2a3b4c5d6e7f8")[0], "e1f2a3b4c5d6e7f8", "ROLE_COACH", 1),
        ("USR-003", "Logic Legend Esports", "Logic Legend Esports", "Talent Scout", "scout@goldensnitch.gg", "arjun", legacy_hash("scout123", "a9b8c7d6e5f4a3b2")[0], "a9b8c7d6e5f4a3b2", "ROLE_SCOUT", 1),
    ]
    for uid, org, organization, name, email, uname, pw_hash, salt, role, active in base_users:
        conn.execute(
            "INSERT OR IGNORE INTO users(id, org, organization, name, email, username, password_hash, salt, role, active) VALUES(?,?,?,?,?,?,?,?,?,?)",
            (uid, org, organization, name, email, uname, pw_hash, salt, role, active)
        )
    
    # Seed initial realistic notifications for Maya (GM) if none exist
    from datetime import datetime, timezone, timedelta
    now_utc = datetime.now(timezone.utc)
    t1 = (now_utc - timedelta(minutes=45)).strftime("%Y-%m-%d %H:%M:%S")
    t2 = (now_utc - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S")
    t3 = (now_utc - timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S")
    t4 = (now_utc - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")

    notif_count = conn.execute("SELECT COUNT(*) FROM notifications WHERE user_id='USR-001'").fetchone()[0]
    if notif_count == 0:
        sample_notifs = [
            ("NTF-001", "USR-001", "vacancy", "Sentinels Vacancy Created", "Priority Controller gap opened for VCT Americas Split 2.", "roster", "1", 0, t1),
            ("NTF-002", "USR-001", "scouting", "Scouting Recommendation Ready", "Mirage ranked #1 for Sentinels Controller vacancy (74.8 Fit, High confidence).", "player", "VAL-002", 0, t2),
            ("NTF-003", "USR-001", "analysis", "Decoy Frag Profile Warning", "Voltz flagged as Statistical Decoy (49.3 Fit, 30/100 Utility rating).", "player", "VAL-003", 0, t3),
            ("NTF-004", "USR-001", "synergy", "Fnatic CS2 Lineup Synced", "Roster coordination index updated to 84.5% synergy across 5 roles.", "roster", "2", 1, t4),
        ]
        conn.executemany(
            "INSERT OR IGNORE INTO notifications(id, user_id, type, title, message, resource_type, resource_id, is_read, created_at) VALUES(?,?,?,?,?,?,?,?,?)",
            sample_notifs
        )
    else:
        # Heal stale or glitched dates on initial notifications
        try:
            conn.execute("UPDATE notifications SET created_at = ? WHERE id='NTF-001' AND (created_at LIKE '2024-%' OR created_at < datetime('now', '-14 days'))", (t1,))
            conn.execute("UPDATE notifications SET created_at = ? WHERE id='NTF-002' AND (created_at LIKE '2024-%' OR created_at < datetime('now', '-14 days'))", (t2,))
            conn.execute("UPDATE notifications SET created_at = ? WHERE id='NTF-003' AND (created_at LIKE '2024-%' OR created_at < datetime('now', '-14 days'))", (t3,))
            conn.execute("UPDATE notifications SET created_at = ? WHERE id='NTF-004' AND (created_at LIKE '2024-%' OR created_at < datetime('now', '-14 days'))", (t4,))
        except Exception:
            pass

    # Seed official external data providers
    providers = [
        ("henrik_valorant", "HenrikDev Valorant API", json.dumps(["valorant"]), "https://api.henrikdev.xyz/valorant", "healthy", 60),
        ("steam_cs2", "Valve Steam CS2 API", json.dumps(["cs2"]), "https://api.steampowered.com/ISteamUserStats", "healthy", 100),
        ("pandascore", "PandaScore Esports API", json.dumps(["valorant", "cs2", "lol"]), "https://api.pandascore.co", "healthy", 30),
        ("liquipedia", "Liquipedia Open Archives", json.dumps(["valorant", "cs2", "lol", "dota2"]), "https://liquipedia.net/api", "healthy", 20),
    ]
    conn.executemany(
        "INSERT OR IGNORE INTO external_providers(id, name, supported_games, base_url, status, rate_limit_rpm) VALUES(?,?,?,?,?,?)",
        providers
    )

    # Seed default organization (Sentinels Operations)
    conn.execute(
        "INSERT OR IGNORE INTO organizations(id, name, slug, tag, description, owner_id) VALUES(?,?,?,?,?,?)",
        ("ORG-001", "Sentinels Operations", "sentinels", "SEN", "Championship multi-title esports organization competing in VCT Americas.", "USR-001")
    )
    # Seed organization members
    conn.execute("INSERT OR IGNORE INTO organization_members(id, organization_id, user_id, role) VALUES('MEM-001', 'ORG-001', 'USR-001', 'owner')")
    conn.execute("INSERT OR IGNORE INTO organization_members(id, organization_id, user_id, role) VALUES('MEM-002', 'ORG-001', 'USR-002', 'coach')")
    conn.execute("INSERT OR IGNORE INTO organization_members(id, organization_id, user_id, role) VALUES('MEM-003', 'ORG-001', 'USR-003', 'scout')")

    # Seed public profiles & external identities if benchmark players exist in players table
    if conn.execute("SELECT id FROM players WHERE id='VAL-002'").fetchone():
        public_seeds = [
            ("PUB-001", "VAL-002", "mirage", 1, "Elite VCT Controller & Certified In-Game Leader. Proven smoke timings and high mid-round tactical adaptability.", json.dumps({"twitter": "@mirage_val", "tracker": "mirage#VCT"}), 1),
            ("PUB-002", "VAL-003", "voltz", 1, "High combat impact entry & controller hybrid. Frag specialist with aggressive first-contact dueling.", json.dumps({"twitter": "@voltz_fps", "tracker": "voltz#NA1"}), 0),
            ("PUB-003", "VAL-001", "tenz", 1, "World champion VCT Americas Duelist. Elite mechanical precision and fast rotation anchoring.", json.dumps({"twitter": "@tenzofficial", "twitch": "tenz"}), 1),
        ]
        conn.executemany(
            "INSERT OR IGNORE INTO public_profiles(id, player_id, slug, is_public, bio, social_links, verified_badge) VALUES(?,?,?,?,?,?,?)",
            public_seeds
        )

        identities = [
            ("IDN-001", "VAL-002", "henrik_valorant", "riot_puuid_mirage_sentinels_002", "Mirage#VCT", 1, "current"),
            ("IDN-002", "VAL-003", "henrik_valorant", "riot_puuid_voltz_na1_003", "Voltz#NA1", 0, "current"),
            ("IDN-003", "VAL-001", "henrik_valorant", "riot_puuid_tenz_sentinels_001", "TenZ#NA1", 1, "current"),
        ]
        conn.executemany(
            "INSERT OR IGNORE INTO player_identities(id, player_id, provider_name, external_id, handle_at_source, verified, freshness_status) VALUES(?,?,?,?,?,?,?)",
            identities
        )

    conn.commit()

def load_players(conn, game=None):
    norm_game = normalize_game_name(game) if game else None
    if norm_game:
        q = "SELECT * FROM players WHERE game=? OR game=? OR id LIKE ? ORDER BY id"
        params = (norm_game, norm_game.upper(), f"ply_{norm_game}_%")
    else:
        q = "SELECT * FROM players ORDER BY id"
        params = ()
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
        try:
            m = json.loads(r["metrics"]) if isinstance(r["metrics"], str) else (r["metrics"] or {})
        except Exception:
            m = {}
        try:
            pv = json.loads(r["provenance"]) if isinstance(r["provenance"], str) else (r["provenance"] or {})
        except Exception:
            pv = {"source": r["provenance"]} if r["provenance"] else {}
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
            """SELECT m.*, p.name AS player_name, p.role AS player_role, p.game AS player_game
               FROM matches m
               LEFT JOIN players p ON m.player_id = p.id
               WHERE m.player_id=?
               ORDER BY m.id DESC LIMIT ?""",
            (player_id, limit)
        ).fetchall()
    else:
        rows = conn.execute(
            """SELECT m.*, p.name AS player_name, p.role AS player_role, p.game AS player_game
               FROM matches m
               LEFT JOIN players p ON m.player_id = p.id
               ORDER BY m.id DESC LIMIT ?""",
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

def create_user(conn, user_id, *args, **kwargs):
    if len(args) == 6:
        username, name, role, organization, salt, password_hash = args
        email = f"{username.strip()}@goldensnitch.gg" if "@" not in username else username.strip()
        org = organization.strip()
    elif len(args) >= 4:
        org = args[0].strip()
        organization = org
        name = args[1].strip()
        email = args[2].strip()
        username = email.split("@")[0]
        password_hash = args[3]
        salt = kwargs.get("salt", "")
        role = args[4] if len(args) > 4 else kwargs.get("role", "ROLE_SCOUT")
    else:
        username = kwargs.get("username", kwargs.get("email", "")).split("@")[0]
        name = kwargs.get("name", "")
        role = kwargs.get("role", "ROLE_SCOUT")
        org = kwargs.get("org", kwargs.get("organization", "Logic Legend Esports"))
        organization = org
        salt = kwargs.get("salt", "")
        password_hash = kwargs.get("password_hash", "")
        email = kwargs.get("email", f"{username}@goldensnitch.gg")

    clean_email = email.strip().lower() if email else ""
    clean_username = username.strip().lower() if username else clean_email.split("@")[0]

    conn.execute(
        "INSERT INTO users(id, username, name, role, organization, org, email, salt, password_hash, active) VALUES(?,?,?,?,?,?,?,?,?,1)",
        (user_id, clean_username, name.strip(), role, organization, org, clean_email, salt, password_hash)
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

# ---------- Public Profiles & Sharing Helpers (PRD-PUB-001) ----------
def get_public_profile(conn, slug_or_id):
    row = conn.execute(
        """SELECT pub.*, p.name, p.name as handle, p.game, p.role, p.matches_played, p.metrics,
                  p.provenance, p.availability, p.language, u.name as claimed_by_name
           FROM public_profiles pub
           JOIN players p ON pub.player_id = p.id
           LEFT JOIN users u ON pub.claimed_by_user_id = u.id
           WHERE (pub.slug = ? OR pub.player_id = ?) AND pub.is_public = 1""",
        (slug_or_id, slug_or_id)
    ).fetchone()
    if not row:
        return None
    d = dict(row)
    d["metrics"] = json.loads(d["metrics"])
    d["provenance"] = json.loads(d["provenance"])
    d["social_links"] = json.loads(d["social_links"]) if d.get("social_links") else {}
    return d

def upsert_public_profile(conn, player_id, slug, is_public=1, bio="", social_links=None):
    links_json = json.dumps(social_links or {})
    pub_id = f"PUB-{uuid.uuid4().hex[:8]}"
    conn.execute(
        """INSERT INTO public_profiles(id, player_id, slug, is_public, bio, social_links, updated_at)
           VALUES(?,?,?,?,?,?, CURRENT_TIMESTAMP)
           ON CONFLICT(player_id) DO UPDATE SET
             slug=excluded.slug,
             is_public=excluded.is_public,
             bio=excluded.bio,
             social_links=excluded.social_links,
             updated_at=CURRENT_TIMESTAMP""",
        (pub_id, player_id, slug, is_public, bio, links_json)
    )
    conn.commit()
    return get_public_profile(conn, slug)

# ---------- Profile Claims & Ownership Helpers (PRD-CLAIM-001) ----------
def create_profile_claim(conn, player_id, user_id, verification_method, verification_code, evidence_text=""):
    claim_id = f"CLM-{uuid.uuid4().hex[:8]}"
    conn.execute(
        """INSERT INTO profile_claims(id, player_id, user_id, status, verification_method, verification_code, evidence_text)
           VALUES(?,?,?,'pending',?,?,?)""",
        (claim_id, player_id, user_id, verification_method, verification_code, evidence_text)
    )
    conn.commit()
    return claim_id

def list_profile_claims(conn, user_id=None, status=None):
    query = """SELECT c.*, p.name as player_handle, p.game, u.name as applicant_name, u.username as applicant_username
               FROM profile_claims c
               JOIN players p ON c.player_id = p.id
               JOIN users u ON c.user_id = u.id WHERE 1=1"""
    params = []
    if user_id:
        query += " AND c.user_id = ?"
        params.append(user_id)
    if status:
        query += " AND c.status = ?"
        params.append(status)
    query += " ORDER BY c.created_at DESC"
    rows = conn.execute(query, params).fetchall()
    return [dict(r) for r in rows]

def review_profile_claim(conn, claim_id, reviewer_id, status, rejection_reason=None):
    conn.execute(
        """UPDATE profile_claims
           SET status=?, reviewed_by=?, reviewed_at=CURRENT_TIMESTAMP, rejection_reason=?
           WHERE id=?""",
        (status, reviewer_id, rejection_reason, claim_id)
    )
    if status == "approved":
        claim = conn.execute("SELECT player_id, user_id FROM profile_claims WHERE id=?", (claim_id,)).fetchone()
        if claim:
            conn.execute(
                """UPDATE public_profiles
                   SET claimed_by_user_id=?, verified_badge=1, updated_at=CURRENT_TIMESTAMP
                   WHERE player_id=?""",
                (claim["user_id"], claim["player_id"])
            )
    conn.commit()
    return True

# ---------- Organization & Team Operations (PRD-ORG-001) ----------
def create_organization(conn, name, slug, tag, owner_id, description=""):
    org_id = f"ORG-{uuid.uuid4().hex[:8]}"
    conn.execute(
        "INSERT INTO organizations(id, name, slug, tag, description, owner_id) VALUES(?,?,?,?,?,?)",
        (org_id, name.strip(), slug.strip().lower(), tag.strip().upper(), description.strip(), owner_id)
    )
    # Add creator as owner member
    mem_id = f"MEM-{uuid.uuid4().hex[:8]}"
    conn.execute(
        "INSERT INTO organization_members(id, organization_id, user_id, role) VALUES(?,?,?, 'owner')",
        (mem_id, org_id, owner_id)
    )
    conn.commit()
    return get_organization(conn, org_id)

def get_organization(conn, org_id_or_slug):
    org = conn.execute(
        "SELECT * FROM organizations WHERE id=? OR slug=?",
        (org_id_or_slug, org_id_or_slug)
    ).fetchone()
    if not org:
        return None
    d = dict(org)
    # Fetch members
    members = conn.execute(
        """SELECT m.id as membership_id, m.role, m.joined_at, u.id as user_id, u.name, u.username
           FROM organization_members m
           JOIN users u ON m.user_id = u.id
           WHERE m.organization_id = ?
           ORDER BY m.joined_at ASC""",
        (d["id"],)
    ).fetchall()
    d["members"] = [dict(m) for m in members]
    return d

def list_user_organizations(conn, user_id):
    rows = conn.execute(
        """SELECT o.*, m.role as user_role
           FROM organizations o
           JOIN organization_members m ON o.id = m.organization_id
           WHERE m.user_id = ?
           ORDER BY o.created_at DESC""",
        (user_id,)
    ).fetchall()
    return [dict(r) for r in rows]

def add_organization_member(conn, org_id, user_id, role="scout"):
    mem_id = f"MEM-{uuid.uuid4().hex[:8]}"
    conn.execute(
        """INSERT INTO organization_members(id, organization_id, user_id, role)
           VALUES(?,?,?,?)
           ON CONFLICT(organization_id, user_id) DO UPDATE SET role=excluded.role""",
        (mem_id, org_id, user_id, role)
    )
    conn.commit()
    return True

def create_invitation(conn, org_id, email, role, token, expires_at):
    inv_id = f"INV-{uuid.uuid4().hex[:8]}"
    conn.execute(
        "INSERT INTO organization_invitations(id, organization_id, email, role, token, expires_at) VALUES(?,?,?,?,?,?)",
        (inv_id, org_id, email.strip().lower(), role, token, expires_at)
    )
    conn.commit()
    return inv_id

def get_invitation(conn, token):
    row = conn.execute(
        """SELECT inv.*, o.name as organization_name
           FROM organization_invitations inv
           JOIN organizations o ON inv.organization_id = o.id
           WHERE inv.token=? AND inv.status='pending'""",
        (token,)
    ).fetchone()
    return dict(row) if row else None

def accept_invitation(conn, token, user_id):
    inv = get_invitation(conn, token)
    if not inv:
        return False
    conn.execute("UPDATE organization_invitations SET status='accepted' WHERE token=?", (token,))
    add_organization_member(conn, inv["organization_id"], user_id, role=inv["role"])
    conn.commit()
    return True

# ---------- Shared Scouting Reports (PRD-REP-001) ----------
def create_shared_report(conn, title, candidate_id, roster_id, share_token, is_public=1, expires_at=None, created_by="USR-001", payload=""):
    rep_id = f"REP-{uuid.uuid4().hex[:8]}"
    conn.execute(
        """INSERT INTO shared_reports(id, title, candidate_id, roster_id, share_token, is_public, expires_at, created_by, payload)
           VALUES(?,?,?,?,?,?,?,?,?)""",
        (rep_id, title, candidate_id, roster_id, share_token, is_public, expires_at, created_by, payload)
    )
    conn.commit()
    return rep_id

def get_shared_report(conn, share_token):
    row = conn.execute(
        """SELECT r.*, p.name as candidate_name, p.game, p.role as candidate_role, u.name as author_name
           FROM shared_reports r
           JOIN players p ON r.candidate_id = p.id
           JOIN users u ON r.created_by = u.id
           WHERE r.share_token=? AND r.is_revoked=0""",
        (share_token,)
    ).fetchone()
    if not row:
        return None
    d = dict(row)
    d["payload"] = json.loads(d["payload"]) if d.get("payload") else {}
    return d

def revoke_shared_report(conn, share_token, user_id):
    cur = conn.execute(
        "UPDATE shared_reports SET is_revoked=1 WHERE share_token=? AND created_by=?",
        (share_token, user_id)
    )
    conn.commit()
    return cur.rowcount > 0

# ---------- Data Correction & Dispute Workflows (PRD-DISP-001) ----------
def create_correction_request(conn, player_id, user_id, issue_type, description, evidence_url=""):
    req_id = f"COR-{uuid.uuid4().hex[:8]}"
    conn.execute(
        """INSERT INTO data_correction_requests(id, player_id, user_id, issue_type, description, evidence_url, status)
           VALUES(?,?,?,?,?,?,'pending')""",
        (req_id, player_id, user_id, issue_type, description.strip(), evidence_url.strip())
    )
    conn.commit()
    return req_id

def list_correction_requests(conn, status=None, player_id=None):
    query = """SELECT r.*, p.name as player_handle, p.game
               FROM data_correction_requests r
               JOIN players p ON r.player_id = p.id WHERE 1=1"""
    params = []
    if status:
        query += " AND r.status = ?"
        params.append(status)
    if player_id:
        query += " AND r.player_id = ?"
        params.append(player_id)
    query += " ORDER BY r.created_at DESC"
    rows = conn.execute(query, params).fetchall()
    return [dict(row) for row in rows]

def resolve_correction_request(conn, request_id, reviewer_id, status):
    cur = conn.execute(
        """UPDATE data_correction_requests
           SET status=?, reviewed_by=?, reviewed_at=CURRENT_TIMESTAMP
           WHERE id=?""",
        (status, reviewer_id, request_id)
    )
    conn.commit()
    return cur.rowcount > 0

# ---------- User Data Rights, Export & Account Management (SEC-004) ----------
def change_user_password(conn, user_id, password_hash, salt):
    cur = conn.execute(
        "UPDATE users SET password_hash=?, salt=? WHERE id=?",
        (password_hash, salt, user_id)
    )
    conn.commit()
    return cur.rowcount > 0

def export_user_data(conn, user_id):
    user_row = conn.execute("SELECT id, username, name, role, organization FROM users WHERE id=?", (user_id,)).fetchone()
    if not user_row:
        return None
    user_data = dict(user_row)
    
    # Fetch watchlist
    watchlist_rows = conn.execute(
        """SELECT w.id, w.player_id, p.name as player_name, p.game, w.stage, w.notes, w.created_at
           FROM watchlist_entries w JOIN players p ON w.player_id = p.id
           WHERE w.user_id = ?""",
        (user_id,)
    ).fetchall()
    user_data["watchlist"] = [dict(r) for r in watchlist_rows]

    # Fetch annotations
    anno_rows = conn.execute(
        "SELECT * FROM annotations WHERE annotator LIKE ?",
        (f"%{user_data['name']}%",)
    ).fetchall()
    user_data["scouting_annotations"] = [dict(r) for r in anno_rows]

    # Fetch submitted claims
    claim_rows = conn.execute(
        "SELECT * FROM profile_claims WHERE user_id = ?",
        (user_id,)
    ).fetchall()
    user_data["profile_claims"] = [dict(r) for r in claim_rows]

    # Fetch dispute/correction requests
    corr_rows = conn.execute(
        "SELECT * FROM data_correction_requests WHERE user_id = ?",
        (user_id,)
    ).fetchall()
    user_data["correction_requests"] = [dict(r) for r in corr_rows]

    return user_data

def delete_user_account(conn, user_id):
    # Anonymize or remove user while maintaining relational integrity
    conn.execute("DELETE FROM notifications WHERE user_id=?", (user_id,))
    conn.execute("DELETE FROM watchlist_entries WHERE user_id=?", (user_id,))
    conn.execute("DELETE FROM organization_members WHERE user_id=?", (user_id,))
    cur = conn.execute("DELETE FROM users WHERE id=?", (user_id,))
    conn.commit()
    return cur.rowcount > 0

def get_user(conn, user_id: str):
    row = conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    if not row:
        return None
    d = dict(row)
    d["org"] = d.get("org") or d.get("organization") or "Logic Legend Esports"
    d["email"] = d.get("email") or f"{d.get('username', 'user')}@goldensnitch.gg"
    return d

def get_user_by_email(conn, email: str):
    if not email:
        return None
    clean = email.strip().lower()
    row = conn.execute(
        "SELECT * FROM users WHERE LOWER(email)=? OR LOWER(username)=?",
        (clean, clean)
    ).fetchone()
    if not row:
        return None
    d = dict(row)
    d["org"] = d.get("org") or d.get("organization") or "Logic Legend Esports"
    d["email"] = d.get("email") or f"{d.get('username', 'user')}@goldensnitch.gg"
    return d






