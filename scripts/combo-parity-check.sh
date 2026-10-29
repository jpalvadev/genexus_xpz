#!/usr/bin/env bash
# Live-API parity checks for Combo Options — the flat-catalogue wire (no
# gridify params, GET by comboKey) that master-parity-sweep.sh's gridify
# masters don't exercise, plus the shared-semantics pins (master-crud ticket
# 01): the exact flat catalogue order (comboKey → order → id), the
# comboKey-scoped lookup feed, and the 404/400 copy strings.
# Run under the harness:
#   scripts/with-api.sh "$PWD/scripts/combo-parity-check.sh"
set -u
BASE="http://localhost:5281/api/v1"
BODY=/tmp/opencode/sweep-body.json
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

copy() { # label expected_message — asserts ErrorResponse.message of the last check's body
  local label="$1" expected="$2" msg
  msg=$(python3 -c 'import sys,json; print(json.load(open(sys.argv[1])).get("message",""))' "$BODY" 2>/dev/null)
  if [ "$msg" = "$expected" ]; then
    echo "PASS $label (\"$msg\")"
  else
    echo "FAIL $label expected=\"$expected\" got=\"$msg\" body=$(head -c 200 "$BODY")"
    FAILS=$((FAILS + 1))
  fi
}

ordered() { # label python-expression [extra args...] — assert over the last check's body
  local label="$1" expr="$2"; shift 2
  if python3 -c "import sys,json
rows=json.load(open(sys.argv[1]))
sys.exit(0 if ($expr) else 1)" "$BODY" "$@" 2>/dev/null; then
    echo "PASS $label"
  else
    echo "FAIL $label body=$(head -c 200 "$BODY")"
    FAILS=$((FAILS + 1))
  fi
}

echo "== combo-options"
# Flat catalogue: plain GET without gridify, response is a bare array.
check "flat GET" 200 GET "$BASE/combo-options"
ID=$(python3 -c 'import json; print(json.load(open("/tmp/opencode/sweep-body.json"))[0]["id"])')
KEY=$(python3 -c 'import json; print(json.load(open("/tmp/opencode/sweep-body.json"))[0]["comboKey"])')
# Flat catalogue order pin: comboKey → order → id (the adapter's flat order).
ordered "flat order comboKey->order->id" "[(c['comboKey'],c['order'],c['id']) for c in rows]==sorted((c['comboKey'],c['order'],c['id']) for c in rows)"
# Items of one combo set (extraService.getByKey) and the edit loader (getById).
check "getByKey($KEY)" 200 GET "$BASE/combo-options/$KEY"
# Lookup-feed pins: non-empty and scoped to the requested comboKey.
ordered "getByKey scoped to $KEY" "rows and all(c['comboKey']==sys.argv[2] for c in rows)" "$KEY"
# By-key order pin: order → id.
ordered "getByKey order->id" "[(c['order'],c['id']) for c in rows]==sorted((c['order'],c['id']) for c in rows)"
check "getById($ID)" 200 GET "$BASE/combo-options/$ID"
# Shared semantics the MasterCrud module owns (ticket 01 pins):
# 404 get-by-id copy.
check "not-found copy" 404 GET "$BASE/combo-options/999999"
copy "not-found copy" "Combo option not found"
# 400 validation copies: blank ComboKey, then blank Label.
check "blank-comboKey 400" 400 POST "$BASE/combo-options" '{"comboKey":"","label":"Parity Sweep","order":0}'
copy "blank-comboKey 400" "ComboKey is required"
check "blank-label 400" 400 POST "$BASE/combo-options" '{"comboKey":"paritySweep","label":"","order":0}'
copy "blank-label 400" "Label is required"
# Create → 201, update → 204, delete → 204 on the record we created.
check "create" 201 POST "$BASE/combo-options" '{"comboKey":"gestionRiesgo","label":"Parity Sweep","order":0}'
NEW=$(python3 -c 'import json; print(json.load(open("/tmp/opencode/sweep-body.json"))["id"])')
check "update ($NEW)" 204 PUT "$BASE/combo-options/$NEW" '{"comboKey":"gestionRiesgo","label":"Parity Sweep 2","order":1}'
check "delete ($NEW)" 204 DELETE "$BASE/combo-options/$NEW"

echo "combo sweep: $FAILS failures"
exit $((FAILS > 0))
