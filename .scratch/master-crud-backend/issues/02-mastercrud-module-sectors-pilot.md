# 02: MasterCrud module + Sectors pilot

**What to build:** Sectors is served entirely by the new deep module behind the unchanged
`ISectorService`: listing with paging clamp (page < 1 → 1, page size < 1 → 20), Gridify
filter/order with the adapter's default order (`name asc`), count + skip/take envelope,
get-by-id 404 copy, create 201 with `Location`, update/delete 404s, delete of a referenced
sector 409 with the verbatim conflict copy, blank name 400 with the verbatim copy. The
module owns all of that semantics; the Sectors adapter contributes only entity set,
default order, Id+Name projection, validation rule, and conflict copy. The six controller
actions move to a shared controller base; the Sectors controller keeps only its route and
typed binding. The module is sited outside the per-catalog feature folders — it is not a
catalog — and contains no per-entity special cases. Sectors' clone service body and
hand-written controller actions are deleted, not deprecated.

**Blocked by:** 01 (the shared-semantics pins are the behavior contract this pilot must satisfy).

**Status:** resolved

- [x] `ISectorService` signature, DI registration, routes, status codes, and bodies unchanged — verified by the expanded sweep (ticket 01's pins) running green under `scripts/with-api.sh`
- [x] Sectors adapter is config-scale (entity set, order, projection, validation copy, conflict copy); module body has no per-entity `if`
- [x] Sectors clone service body and hand-written controller actions deleted
- [x] MSW fixtures re-captured via `scripts/capture-fixtures.py` byte-identical
- [x] Frontend suites (Master record module suite, catalog smokes, Security Observation form) green with zero frontend changes
- [x] ADR-0004 recorded (backend master CRUD is a MasterCrud adapter; exclusions: Observers, Persons, EquipmentItems, Equipment Maintenance, Security Observations) and CODING_STANDARDS guidance updated ("a backend master catalog is an adapter, not a clone")

## Answer

`Genexus/Common/MasterCrud/` now holds the module: `MasterCrud<TEntity, TRequest,
TResponse>` (paging clamp, gridify filter/order + adapter default order, count +
skip/take envelope, as-no-tracking reads / tracked writes, NotFound contract,
DbUpdateException → 409 with adapter copy, validation hook → 400, flat/key feeds as
adapter-declared extras — no per-entity branch) and `MasterCrudControllerBase` (the six
verbs' status codes, 404 `ErrorResponse` copy, `CreatedAtAction` location, NoContent
bodies, once). Sectors crosses the unchanged `ISectorService` seam through a
config-scale adapter in `SectorService` (7-line config + 5 delegating one-liners);
`SectorsController` keeps route + typed binding only. Proof: ticket-01 sweep green
under `scripts/with-api.sh`; A/B fixture capture (pre-move vs post-move code, each
from a fresh seeded DB, same day) — all 9 fixtures byte-identical, the only diff the
two Security Observation `createdOn` capture-clock timestamps; full vitest suite
(30 files, 175 tests) green with zero frontend changes. ADR-0004 + CODING_STANDARDS
"Backend conventions" recorded in this pilot.
