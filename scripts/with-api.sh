#!/usr/bin/env bash
# Start the API, wait for the port, run a command against it, then stop the API.
# Usage (from anywhere): scripts/with-api.sh <command...>
# Gotcha: the API process runs with Genexus/ as CWD, so any helper script that
# writes with a RELATIVE path will write into Genexus/ (e.g. itrion.db landed
# there once). Path helpers in this folder write relative to the repo root.
set -u
export PATH="$HOME/.dotnet:$PATH" DOTNET_CLI_TELEMETRY_OPTOUT=1 DOTNET_NOLOGO=1 DOTNET_ROOT="$HOME/.dotnet"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT=5281
cd "$ROOT/Genexus" || exit 1
setsid nohup dotnet run --launch-profile http > /tmp/opencode/api.log 2>&1 < /dev/null &
API=$!

for _ in $(seq 1 90); do
  if curl -s -o /dev/null --max-time 2 "http://localhost:$PORT/api/v1/equipment-maintenances"; then
    break
  fi
  sleep 1
done

RC=0
"$@" || RC=$?

PID=$(ss -lptn "sport = :$PORT" 2>/dev/null | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2)
[ -n "${PID:-}" ] && kill "$PID" 2>/dev/null
pkill -P "$API" 2>/dev/null
exit $RC
