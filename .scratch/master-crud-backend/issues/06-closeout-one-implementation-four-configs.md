# 06: Close-out — one implementation, four configs

**What to build:** The demoable end state of the spec, verified end-to-end: every Master
record (Sector, Plant, Contractor Company, Combo Option) is served by the single MasterCrud
module with a config-scale adapter, the Observers module untouched, and nothing of the
clones left. A full harness pass exercises all four catalogs' sweeps plus the
Observer-deactivation check in one green run; the full frontend suite runs via pre-push
against unchanged fixtures.

**Blocked by:** 03, 04, 05 (all four catalogs must ride the module first; 01 and 02 transitively).

**Status:** resolved

- [x] `scripts/master-parity-sweep.sh` green over sectors, plants, contractor-companies, observers; `scripts/combo-parity-check.sh` green; `scripts/observer-deactivation-check.sh` green — all under `scripts/with-api.sh`
- [x] No clone CRUD code remains for the four catalogs (service bodies, hand-written controller actions, duplicated copy strings); Observers, Persons, EquipmentItems code untouched
- [x] MSW fixtures re-captured byte-identical; full vitest suite green via pre-push with zero frontend changes
- [x] Spec's user stories spot-checked against the live API; ADR-0004 and CODING_STANDARDS guidance confirmed in place from the pilot

## Answer

`scripts/closeout-harness-pass.sh` runs the three pin scripts plus wire spot checks
(paging clamp Page<1→1 / PageSize<1→20, OrderBy honored, Filter honored) in one
harness session: **closeout pass: 0 failures** on the final tree.
`git diff 738ed30..HEAD` touches only the four catalog folders, `Common/MasterCrud`,
the two sweeps, the tickets, CODING_STANDARDS and ADR-0004 — Observers, Persons,
EquipmentItems, Equipment Maintenance, Security Observations, Models and Program.cs
are untouched. No `SaveChangesAsync`/`DbUpdateException`/`ApplyFiltering`/
`ValidationException`/`ConflictException` remains in the four catalog folders — the
copy strings live in adapters only. Full-scope A/B fixture capture (all-clone tip vs
all-four-migrated tree, fresh seeded DB each) byte-identical on every master fixture
(sole diff: SO `createdOn` capture-clock); vitest 30 files / 175 tests green with
zero frontend changes (runs again in pre-push). ADR-0004 and the CODING_STANDARDS
"Backend conventions" bullet are in place from the pilot commit.
