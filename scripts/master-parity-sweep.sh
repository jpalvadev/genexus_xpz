#!/usr/bin/env bash
# Live-API parity sweep for the Master record module (ticket 07 acceptance) plus the
# shared-semantics pins the MasterCrud module takes over (master-crud ticket 01).
# Exercises exactly the calls createMasterRecordModule makes against the running
# backend, so the factory's wire contract is checked against reality, not just MSW,
# and the CRUD semantics every master shares (404/400/409 copy, paging) are pinned
# once per catalog before any backend code moves.
# Run it under the harness: scripts/with-api.sh scripts/master-parity-sweep.sh
#
# Usage: scripts/master-parity-sweep.sh [resource ...]   (default: the four gridify masters)
set -u
BASE="http://localhost:5281/api/v1"
RESOURCES="${*:-sectors plants contractor-companies observers}"
BODY=/tmp/opencode/sweep-body.json
FAILS=0
TODAY=$(date +%F)
LEGAJO=99995 # Observer legajo for the in-script FK-conflict observation (free of the deactivation check's 99998)

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

id_from_body() { python3 -c 'import sys,json; print(json.load(open(sys.argv[1]))["id"])' "$BODY"; }

# Flat-feed OrderBy field per master (configs declare each catalog's order).
order_for() {
  case "$1" in
    observers) echo 'fullName%20asc' ;;
    *) echo 'name%20asc' ;;
  esac
}

# Conflict copy per master (verbatim backend copy strings).
conflict_copy_for() {
  case "$1" in
    sectors) echo 'El sector está referenciado por observaciones de seguridad y no puede eliminarse' ;;
    plants) echo 'Plant is referenced by security observations and cannot be deleted' ;;
    contractor-companies) echo 'ContractorCompany is referenced by security observations and cannot be deleted' ;;
  esac
}

# Blank-name validation copy per master (verbatim backend copy strings).
validation_copy_for() {
  case "$1" in
    sectors) echo 'Nombre es obligatorio' ;;
    *) echo 'Name is required' ;;
  esac
}

# The shared-semantics pins (ticket 01) run over the MasterCrud-migrated gridify
# masters only; Observers keeps its own pins (observer-deactivation-check.sh).
is_shared_master() {
  case "$1" in
    sectors | plants | contractor-companies) return 0 ;;
    *) return 1 ;;
  esac
}

# Sweep fixtures: an SO must reference real records, and the sweep creates all of
# them in-script (no pre-existing data assumptions). Cleaned up FK-order at the end.
create() { # method url body -> echoes new id (fails the script on non-2xx)
  local method="$1" url="$2" body="$3" code
  code=$(curl -s -o "$BODY" -w '%{http_code}' -X "$method" -H 'Content-Type: application/json' -d "$body" "$url")
  if [ "$code" != 201 ]; then
    echo "FAIL fixture create ($method $url) expected=201 got=$code body=$(head -c 200 "$BODY")"
    FAILS=$((FAILS + 1)); echo ""
  else
    id_from_body
  fi
}

echo "== sweep fixtures (in-script, cleaned up at the end)"
FIX_PLANT=$(create POST "$BASE/plants" '{"name":"Parity Sweep Plant"}')
FIX_SECTOR=$(create POST "$BASE/sectors" '{"name":"Parity Sweep Sector"}')
FIX_COMPANY=$(create POST "$BASE/contractor-companies" '{"name":"Parity Sweep Company"}')
FIX_OBSERVER=$(create POST "$BASE/observers" "{\"legajo\":$LEGAJO,\"fullName\":\"Parity Sweep Observer\",\"objective\":\"Parity sweep fixture - delete me\",\"post\":1,\"active\":true,\"plantIds\":[]}")

for R in $RESOURCES; do
  echo "== $R"
  ORDER=$(order_for "$R")
  # Gridify list (count+data envelope) — page 1 exactly as GridifyTablePage asks.
  check "list gridify" 200 GET "$BASE/$R?Page=1&PageSize=10"
  # Flat feed (getAll: Page 1, PageSize 1000, config order) — SO-form dropdowns.
  check "flat feed" 200 GET "$BASE/$R?Page=1&PageSize=1000&OrderBy=$ORDER"
  # Single record for the loader (take a real id from the feed).
  ID=$(curl -s "$BASE/$R?Page=1&PageSize=1" | python3 -c 'import sys,json; print(json.load(sys.stdin)["data"][0]["id"])')
  check "get by id ($ID)" 200 GET "$BASE/$R/$ID"
  # Create → 201 with a record body (observers carry their full request shape).
  case "$R" in
    observers)
      RQ="{\"legajo\":99999,\"fullName\":\"Parity Sweep\",\"objective\":\"Parity sweep record — delete me\",\"post\":1,\"active\":true,\"plantIds\":[]}"
      RQ2="{\"legajo\":99999,\"fullName\":\"Parity Sweep Renamed\",\"objective\":\"Parity sweep record — delete me\",\"post\":2,\"active\":false,\"plantIds\":[]}"
      REQ_BLANK='{"name":""}'
      REQ_REF='{"name":""}'
      ;;
    *)
      RQ='{"name":"Parity Sweep Record"}'
      RQ2='{"name":"Parity Sweep Renamed"}'
      REQ_BLANK='{"name":""}'
      REQ_REF='{"name":"Parity Sweep Referenced"}'
      ;;
  esac
  check "create" 201 POST "$BASE/$R" "$RQ"
  NEW_ID=$(id_from_body)
  # Update → 204 No Content (the factory's update ignores the response body),
  # then delete the record we created (keeps the DB clean).
  check "update ($NEW_ID)" 204 PUT "$BASE/$R/$NEW_ID" "$RQ2"
  check "delete ($NEW_ID)" 204 DELETE "$BASE/$R/$NEW_ID"

  if ! is_shared_master "$R"; then
    continue
  fi

  # Shared semantics the MasterCrud module owns (ticket 01 pins):
  # 404 get-by-id copy.
  case "$R" in
    sectors) NOT_FOUND="Sector no encontrado" ;;
    plants) NOT_FOUND="Plant not found" ;;
    contractor-companies) NOT_FOUND="ContractorCompany not found" ;;
  esac
  check "not-found copy" 404 GET "$BASE/$R/999999"
  copy "not-found copy" "$NOT_FOUND"
  # 400 validation copy (blank required field).
  check "blank-name 400" 400 POST "$BASE/$R" "$REQ_BLANK"
  copy "blank-name 400" "$(validation_copy_for "$R")"
  # 409 FK-conflict: delete a record a fresh in-script Security Observation references.
  CONF_COPY=$(conflict_copy_for "$R")
  REF_ID=$(create POST "$BASE/$R" "$REQ_REF")
  case "$R" in
    sectors) SO_PLANT=$FIX_PLANT; SO_SECTOR=$REF_ID; SO_COMPANY=$FIX_COMPANY ;;
    plants) SO_PLANT=$REF_ID; SO_SECTOR=$FIX_SECTOR; SO_COMPANY=$FIX_COMPANY ;;
    *) SO_PLANT=$FIX_PLANT; SO_SECTOR=$FIX_SECTOR; SO_COMPANY=$REF_ID ;;
  esac
  R_DEL="$BASE/$R/$REF_ID"
  SO_ID=$(create POST "$BASE/security-observations" "{\"observationDate\":\"$TODAY\",\"task\":\"Parity Sweep FK pin\",\"lugar\":\"planta\",\"plantId\":$SO_PLANT,\"sectorId\":$SO_SECTOR,\"contractorCompanyId\":$SO_COMPANY,\"observers\":[{\"observerId\":$FIX_OBSERVER}],\"aprReviewed\":true,\"taskRealized\":true,\"requiresAtrReview\":false,\"trcRisk\":true,\"impactRiskControlled\":true,\"handInjuryMeasures\":false,\"injuryMeasures\":true,\"toolsReviewed\":true,\"mobileEquipmentReviewed\":false,\"energyReviewed\":true,\"ladderReviewed\":false,\"electricalEquipmentCircuitBreaker\":true,\"controlesCriticos\":\"parity sweep\",\"gestionRiesgo\":[\"Daily Risk Talk (DRT)\"],\"protocolosMortales\":[\"Working at Height\"],\"clasificacionObservacion\":[\"Safe Condition\"],\"relacionObservacion\":[\"Related to Task\"],\"resumenObservacion\":\"parity sweep\",\"detalleAI\":\"parity sweep\",\"descripcionAC\":\"parity sweep\"}")
  check "conflict delete ($REF_ID)" 409 DELETE "$R_DEL"
  copy "conflict delete ($REF_ID)" "$CONF_COPY"
  # Cleanup in FK order: Observation first, then the referenced record.
  check "cleanup observation ($SO_ID)" 204 DELETE "$BASE/security-observations/$SO_ID"
  check "cleanup reference ($REF_ID)" 204 DELETE "$R_DEL"
done

echo "== sweep fixture cleanup (FK order: observation already deleted, then masters, then observer)"
check "cleanup company ($FIX_COMPANY)" 204 DELETE "$BASE/contractor-companies/$FIX_COMPANY"
check "cleanup sector ($FIX_SECTOR)" 204 DELETE "$BASE/sectors/$FIX_SECTOR"
check "cleanup plant ($FIX_PLANT)" 204 DELETE "$BASE/plants/$FIX_PLANT"
check "cleanup observer ($FIX_OBSERVER)" 204 DELETE "$BASE/observers/$FIX_OBSERVER"

echo "sweep: $FAILS failures"
exit $((FAILS > 0))
