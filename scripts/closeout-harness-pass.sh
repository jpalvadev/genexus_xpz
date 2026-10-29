#!/usr/bin/env bash
# Close-out harness pass: the fixture recapture, the four live pin scripts and
# wire spot checks the sweeps don't cover (paging clamp Page<1->1, PageSize<1->20,
# OrderBy honored, Filter honored) — the whole live harness in ONE API boot.
# Run under the harness (absolute path — with-api.sh runs commands from Genexus/):
#   scripts/with-api.sh "$PWD/scripts/closeout-harness-pass.sh"   (from repo root)
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE="http://localhost:5281/api/v1"
BODY=/tmp/opencode/closeout-body.json
FAILS=0

check() { # label expected method url [json]
  local label="$1" expected="$2" method="$3" url="$4" body="${5:-}"
  local code
  if [ -n "$body" ]; then
    code=$(curl -s -o "$BODY" -w '%{http_code}' -X "$method" -H 'Content-Type: application/json' -d "$body" "$url")
  else
    code=$(curl -s -o "$BODY" -w '%{http_code}' -X "$method" "$url")
  fi
  if [ "$code" = "$expected" ]; then
    echo "PASS $label ($code)"
  else
    echo "FAIL $label expected=$expected got=$code body=$(head -c 200 "$BODY")"
    FAILS=$((FAILS + 1))
  fi
}

assert() { # label python-expression [extra args...] over last body
  local label="$1" expr="$2"; shift 2
  if python3 -c "import sys,json
d=json.load(open(sys.argv[1]))
sys.exit(0 if ($expr) else 1)" "$BODY" "$@"; then
    echo "PASS $label"
  else
    echo "FAIL $label body=$(head -c 200 "$BODY")"
    FAILS=$((FAILS + 1))
  fi
}

echo "== fixture recapture"
python3 "$ROOT/scripts/capture-fixtures.py" || FAILS=$((FAILS + 1))

echo "== pin scripts"
"$ROOT/scripts/master-parity-sweep.sh" || FAILS=$((FAILS + 1))
"$ROOT/scripts/combo-parity-check.sh" || FAILS=$((FAILS + 1))
"$ROOT/scripts/observer-deactivation-check.sh" || FAILS=$((FAILS + 1))
"$ROOT/scripts/spanish-visible-copy-check.sh" || FAILS=$((FAILS + 1))

echo "== wire spot checks (clamp, order, filter)"
check "clamp page/size" 200 GET "$BASE/sectors?Page=0&PageSize=0"
assert "clamp size<=20" "len(d['data'])<=20 and d['count']==len(d['data'])"
check "order desc" 200 GET "$BASE/plants?Page=1&PageSize=1000&OrderBy=name%20desc"
assert "order desc honored" "[p['name'] for p in d['data']]==sorted((p['name'] for p in d['data']),reverse=True)"
check "spot record" 201 POST "$BASE/sectors" '{"name":"SpotCheck77"}'
SID=$(python3 -c 'import sys,json; print(json.load(open(sys.argv[1]))["id"])' "$BODY")
check "filter honored" 200 GET "$BASE/sectors?Page=1&PageSize=10&Filter=name=SpotCheck77"
assert "filter scoped" "len(d['data'])==1 and d['data'][0]['id']==int(sys.argv[2])" "$SID"
check "cleanup spot record ($SID)" 204 DELETE "$BASE/sectors/$SID"

echo "closeout pass: $FAILS failures"
exit $((FAILS > 0))
