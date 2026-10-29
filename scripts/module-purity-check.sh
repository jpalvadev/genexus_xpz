#!/usr/bin/env bash
# ADR-0004 purity pin: the MasterCrud module body stays catalog-agnostic — code
# lines in Genexus/Common/MasterCrud/*.cs must not name a catalog. XML doc
# comments may name catalogs (they carry the adapter examples), so // comment
# text is stripped before the scan. Wired in CI (scripts job).
# Run from the repo root: scripts/module-purity-check.sh
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FAILS=0
for f in "$ROOT"/Genexus/Common/MasterCrud/*.cs; do
  if hits=$(sed 's|//.*||' "$f" | grep -nE 'Sector|Plant|Contractor|Combo'); then
    printf '%s\n' "$hits"
    echo "purity FAIL: ${f#"$ROOT"/} names a catalog in code"
    FAILS=$((FAILS + 1))
  fi
done
echo "module-purity: $FAILS failures"
exit $((FAILS > 0))
