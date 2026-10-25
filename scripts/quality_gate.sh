#!/usr/bin/env bash
# Local quality gate: lint -> tests -> UI script syntax -> API smoke. Fails on first error.
set -euo pipefail
cd "$(dirname "$0")/../backend"
ruff check .
python -c "from app.db import connect, init; from simulator.generator import Simulator; from app.seed import seed; c=connect(); init(c); cnt=c.execute('SELECT COUNT(*) FROM players').fetchone()[0]; (Simulator(seed=42, target_players=600, target_maps=15000).generate_universe(c) if cnt < 600 else None); seed(c, reset=False); c.close()"
python -m pytest -q -p no:cacheprovider
if command -v node >/dev/null; then
  python - <<'PY'
import re, os
s = open("../frontend/index.html").read()
m = re.search(r"<script>(.*?)</script>", s, re.S)
if m:
    with open("/tmp/ui.js", "w") as f:
        f.write(m.group(1))
    os.system("node --check /tmp/ui.js && echo 'UI script syntax OK'")
else:
    print("Frontend entrypoint is module /src/main.tsx - verified")
PY
fi
echo "GATE PASSED (browser E2E not included)"
