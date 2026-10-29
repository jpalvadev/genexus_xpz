#!/usr/bin/env bash
# Live-API parity sweep for the Master record module (ticket 07 acceptance).
# Exercises exactly the calls createMasterRecordModule makes against the
# running backend, so the factory's wire contract is checked against reality,
# not just MSW. Run it under the harness: scripts/with-api.sh scripts/master-parity-sweep.sh
#
# Usage: scripts/master-parity-sweep.sh [resource ...]   (default: the four gridify masters)
set -u
BASE="http://localhost:5281/api/v1"
RESOURCES="${*:-sectors plants contractor-companies observers}"
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

# Flat-feed OrderBy field per master (configs declare each catalog's order).
order_for() {
  case "$1" in
    observers) echo 'fullName%20asc' ;;
    *) echo 'name%20asc' ;;
  esac
}

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
      BODY="{\"legajo\":99999,\"fullName\":\"Parity Sweep\",\"objective\":\"Parity sweep record — delete me\",\"post\":1,\"active\":true,\"plantIds\":[]}"
      BODY2="{\"legajo\":99999,\"fullName\":\"Parity Sweep Renamed\",\"objective\":\"Parity sweep record — delete me\",\"post\":2,\"active\":false,\"plantIds\":[]}"
      ;;
    *)
      BODY='{"name":"Parity Sweep Record"}'
      BODY2='{"name":"Parity Sweep Renamed"}'
      ;;
  esac
  check "create" 201 POST "$BASE/$R" "$BODY"
  NEW_ID=$(python3 -c 'import json; print(json.load(open("/tmp/opencode/sweep-body.json"))["id"])')
  # Update → 204 No Content (the factory's update ignores the response body),
  # then delete the record we created (keeps the DB clean).
  check "update ($NEW_ID)" 204 PUT "$BASE/$R/$NEW_ID" "$BODY2"
  check "delete ($NEW_ID)" 204 DELETE "$BASE/$R/$NEW_ID"
done

echo "sweep: $FAILS failures"
exit $((FAILS > 0))
