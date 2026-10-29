#!/usr/bin/env bash
# Regression pin for the GLOSSARY.md "Active" rule (ADR-0002): deactivating an
# Observer hides it from the Security Observation picker, while Observations
# naming it stay intact (no cascades).
#
# The picker half is pinned frontend-side by observers.smoke.test.tsx (the
# lookup sends active=true); the "Observations stay intact" half is backend
# data behavior, pinned here against the live API. Run under the harness:
#   scripts/with-api.sh scripts/observer-deactivation-check.sh
set -u
BASE="http://localhost:5281/api/v1"
TODAY=$(date +%F)
LEGAJO=99998
NAME="Deactivation Check"
BODY=/tmp/opencode/observer-check-body.json
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

# The picker feed exactly as observers.config.tsx lookup() sends it.
picker() { echo "$BASE/observers?Page=1&PageSize=1000&OrderBy=fullName%20asc&Filter=active=true"; }

named() { # url observerId -> yes/no: is that id in the gridify feed?
  curl -s "$1" | python3 -c 'import sys,json; oid=int(sys.argv[1]); print("yes" if any(o["id"]==oid for o in json.load(sys.stdin)["data"]) else "no")' "$2"
}

# Real master ids for the observation body (this script creates no masters).
PLANT=$(curl -s "$BASE/plants?Page=1&PageSize=1" | python3 -c 'import sys,json; print(json.load(sys.stdin)["data"][0]["id"])')
SECTOR=$(curl -s "$BASE/sectors?Page=1&PageSize=1" | python3 -c 'import sys,json; print(json.load(sys.stdin)["data"][0]["id"])')

echo "== observer deactivation rule (GLOSSARY 'Active', ADR-0002)"

# 1. Active Observer -> 201, and it shows up in the picker.
check "create observer" 201 POST "$BASE/observers" \
  "{\"legajo\":$LEGAJO,\"fullName\":\"$NAME\",\"objective\":\"Deactivation check record - delete me\",\"post\":1,\"active\":true,\"plantIds\":[]}"
OBSERVER=$(python3 -c "import json; print(json.load(open('$BODY'))['id'])")
if [ "$(named "$(picker)" "$OBSERVER")" = yes ]; then
  echo "PASS observer $OBSERVER visible in picker while active"
else
  echo "FAIL observer $OBSERVER missing from picker while active"
  FAILS=$((FAILS + 1))
fi

# 2. A Security Observation naming that Observer -> 201 (the picker writes
#    observers: [{observerId}], the form's exact payload shape).
check "create observation naming observer $OBSERVER" 201 POST "$BASE/security-observations" \
  "{\"observationDate\":\"$TODAY\",\"task\":\"Deactivation check\",\"lugar\":\"planta\",\"plantId\":$PLANT,\"sectorId\":$SECTOR,\"contractorCompanyId\":null,\"observers\":[{\"observerId\":$OBSERVER}],\"aprReviewed\":true,\"taskRealized\":true,\"requiresAtrReview\":false,\"trcRisk\":true,\"impactRiskControlled\":true,\"handInjuryMeasures\":false,\"injuryMeasures\":true,\"toolsReviewed\":true,\"mobileEquipmentReviewed\":false,\"energyReviewed\":true,\"ladderReviewed\":false,\"electricalEquipmentCircuitBreaker\":true,\"controlesCriticos\":\"deactivation check\",\"gestionRiesgo\":[\"deactivation check label\"],\"protocolosMortales\":[\"deactivation check label\"],\"clasificacionObservacion\":[\"deactivation check label\"],\"relacionObservacion\":[\"deactivation check label\"],\"resumenObservacion\":\"deactivation check\",\"detalleAI\":\"deactivation check\",\"descripcionAC\":\"deactivation check\"}"
SO=$(python3 -c "import json; print(json.load(open('$BODY'))['id'])")

# 3. Deactivate: PUT with the full body the Master record module update sends,
#    active flipped to false.
check "deactivate observer ($OBSERVER)" 204 PUT "$BASE/observers/$OBSERVER" \
  "{\"legajo\":$LEGAJO,\"fullName\":\"$NAME\",\"objective\":\"Deactivation check record - delete me\",\"post\":1,\"active\":false,\"plantIds\":[]}"

# 4. The Observation stays intact: detail 200 and its observer reference keeps
#    resolving to the same Observer (join row untouched, no cascade).
check "observation $SO detail after deactivation" 200 GET "$BASE/security-observations/$SO"
if python3 -c 'import json,sys
o=json.load(open(sys.argv[2]))
named=[x for x in o["observers"] if x["id"]==int(sys.argv[1])]
sys.exit(0 if len(named)==1 and named[0]["fullName"]==sys.argv[3] else 1)' "$OBSERVER" "$BODY" "$NAME"; then
  echo "PASS observation $SO intact: observer $OBSERVER ($NAME) still named"
else
  echo "FAIL observation $SO lost its observer reference"
  FAILS=$((FAILS + 1))
fi

# 5. The de-activated Observer is gone from the picker feed.
if [ "$(named "$(picker)" "$OBSERVER")" = no ]; then
  echo "PASS observer $OBSERVER hidden from picker after deactivation"
else
  echo "FAIL observer $OBSERVER still in picker after deactivation"
  FAILS=$((FAILS + 1))
fi

# Cleanup: Observation first, Observer second — the FK is never cascaded
# (ADR-0002), so the Observer cannot be deleted while an Observation names it.
check "cleanup observation ($SO)" 204 DELETE "$BASE/security-observations/$SO"
check "cleanup observer ($OBSERVER)" 204 DELETE "$BASE/observers/$OBSERVER"

echo "observer deactivation check: $FAILS failures"
exit $((FAILS > 0))
