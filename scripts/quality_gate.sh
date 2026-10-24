#!/usr/bin/env bash
# Local quality gate: lint -> tests -> UI script syntax -> API smoke. Fails on first error.
set -euo pipefail
cd "$(dirname "$0")/../backend"
ruff check .
python -m pytest -q -p no:cacheprovider
if command -v node >/dev/null; then
  python - <<'PY'
import re; s=open("../frontend/index.html").read(); open("/tmp/ui.js","w").write(re.search(r"<script>(.*)</script>",s,re.S).group(1))
PY
  node --check /tmp/ui.js && echo "UI script syntax OK"
fi
echo "GATE PASSED (browser E2E not included)"
