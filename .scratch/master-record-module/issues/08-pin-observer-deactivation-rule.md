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

**Status:** ready-for-agent

- [ ] `scripts/observer-deactivation-check.sh` exercises create → name-in-observation → deactivate → assert observation intact + picker hides
- [ ] Script cleans up the records it creates
- [ ] Green under `scripts/with-api.sh`; pointed at from AGENTS.md scripts list or the smoke test it complements
