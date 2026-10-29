#!/usr/bin/env bash
# Live-API parity checks for Combo Options — the flat-catalogue wire (no
# gridify params, GET by comboKey) that master-parity-sweep.sh's gridify
# masters don't exercise. Run under the harness:
#   scripts/with-api.sh "$PWD/scripts/combo-parity-check.sh"
set -u
BASE="http://localhost:5281/api/v1"
FAILS=0

check() { # label expected method url [json]
  local label="$1" expected="$2" method="$3" url="$4" body="${5:-}"
  local code
  if [ -n "$body" ]; then
    code=$(curl -s -o /tmp/opencode/sweep-body.json -w '%{http_code}' -X "$method" -H 'Content-Type: application/json' -d "$body" "$url")
  else
    code=$(curl -s -o /tmp/opencode/sweep-body.json -w '%{http_code}' -X "$method" "$url")
  fi
  if [ "$code" = "$expected" ]; then
    echo "PASS $label ($code)"
  else
    echo "FAIL $label expected=$expected got=$code body=$(head -c 200 /tmp/opencode/sweep-body.json)"
    FAILS=$((FAILS + 1))
  fi
}

echo "== combo-options"
# Flat catalogue: plain GET without gridify, response is a bare array.
check "flat GET" 200 GET "$BASE/combo-options"
ID=$(python3 -c 'import json; print(json.load(open("/tmp/opencode/sweep-body.json"))[0]["id"])')
KEY=$(python3 -c 'import json; print(json.load(open("/tmp/opencode/sweep-body.json"))[0]["comboKey"])')
# Items of one combo set (extraService.getByKey) and the edit loader (getById).
check "getByKey($KEY)" 200 GET "$BASE/combo-options/$KEY"
check "getById($ID)" 200 GET "$BASE/combo-options/$ID"
# Create → 201, update → 204, delete → 204 on the record we created.
check "create" 201 POST "$BASE/combo-options" '{"comboKey":"gestionRiesgo","label":"Parity Sweep","order":0}'
NEW=$(python3 -c 'import json; print(json.load(open("/tmp/opencode/sweep-body.json"))["id"])')
check "update ($NEW)" 204 PUT "$BASE/combo-options/$NEW" '{"comboKey":"gestionRiesgo","label":"Parity Sweep 2","order":1}'
check "delete ($NEW)" 204 DELETE "$BASE/combo-options/$NEW"

echo "combo sweep: $FAILS failures"
exit $((FAILS > 0))
