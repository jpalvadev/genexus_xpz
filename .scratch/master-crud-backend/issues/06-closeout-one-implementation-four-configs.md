# 06: Close-out — one implementation, four configs

**What to build:** The demoable end state of the spec, verified end-to-end: every Master
record (Sector, Plant, Contractor Company, Combo Option) is served by the single MasterCrud
module with a config-scale adapter, the Observers module untouched, and nothing of the
clones left. A full harness pass exercises all four catalogs' sweeps plus the
Observer-deactivation check in one green run; the full frontend suite runs via pre-push
against unchanged fixtures.

**Blocked by:** 03, 04, 05 (all four catalogs must ride the module first; 01 and 02 transitively).

**Status:** ready-for-agent

- [ ] `scripts/master-parity-sweep.sh` green over sectors, plants, contractor-companies, observers; `scripts/combo-parity-check.sh` green; `scripts/observer-deactivation-check.sh` green — all under `scripts/with-api.sh`
- [ ] No clone CRUD code remains for the four catalogs (service bodies, hand-written controller actions, duplicated copy strings); Observers, Persons, EquipmentItems code untouched
- [ ] MSW fixtures re-captured byte-identical; full vitest suite green via pre-push with zero frontend changes
- [ ] Spec's user stories spot-checked against the live API; ADR-0004 and CODING_STANDARDS guidance confirmed in place from the pilot
