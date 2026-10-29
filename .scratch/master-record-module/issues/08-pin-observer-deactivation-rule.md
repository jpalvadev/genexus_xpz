# 08: Pin the Observer-deactivation rule with a live check

**What to build:** The GLOSSARY/ADR-0002 rule "deactivating an Observer hides it from
the Security Observation picker while Observations naming it stay intact (no cascades)"
gets a regression pin. The picker half is already pinned by the observers smoke test
(lookup sends `active=true`); the "Observations stay intact" half is backend data
behavior with no check. Add a live-API script (`scripts/observer-deactivation-check.sh`,
run under `scripts/with-api.sh`): create an Observer, create a Security Observation
naming it, deactivate the Observer (PUT active=false), then assert the Observation is
still returned with its observer reference intact and the de-activated Observer is
absent from the picker feed (active filter). Clean up both records at the end. Spanish
copy verbatim; no frontend code changes.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] `scripts/observer-deactivation-check.sh` exercises create → name-in-observation → deactivate → assert observation intact + picker hides
- [x] Script cleans up the records it creates
- [x] Green under `scripts/with-api.sh`; pointed at from AGENTS.md scripts list or the smoke test it complements

## Answer (2026-10-29)

**Done — `scripts/observer-deactivation-check.sh`**, in the parity-sweep house style
(`check()` status-code harness, python3 body asserts), run under the harness:
`scripts/with-api.sh "$PWD/scripts/observer-deactivation-check.sh"`.

Flow (all against the live API, legajo 99998 so it never collides with the parity sweep's
99999): create active Observer (201, visible in the picker feed as `lookup` sends it:
`active=true`, `fullName asc`) → create Security Observation naming it (201, the form's
exact payload shape, `contractorCompanyId: null`, date = today inside the window) →
PUT observer `active:false` (204) → assert observation detail 200 **with its observer
reference intact** (same id + fullName in `observers[]`; the join row is untouched —
no cascade, ADR-0002) → assert the observer is **absent** from the active-filtered
picker feed → cleanup: delete Observation (204) then Observer (204), the order the
non-cascading FK requires.

**Green**: 9 PASS / 0 failures on the live API.

**Pointers**: AGENTS.md harness-scripts list names the script; its header comment names
`observers.smoke.test.tsx` as the picker-half pin it complements. No frontend code
changes; full serial `vitest run` + `tsc -b` gates green.
