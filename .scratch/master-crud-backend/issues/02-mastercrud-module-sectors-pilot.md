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

**Status:** ready-for-agent

- [ ] `ISectorService` signature, DI registration, routes, status codes, and bodies unchanged — verified by the expanded sweep (ticket 01's pins) running green under `scripts/with-api.sh`
- [ ] Sectors adapter is config-scale (entity set, order, projection, validation copy, conflict copy); module body has no per-entity `if`
- [ ] Sectors clone service body and hand-written controller actions deleted
- [ ] MSW fixtures re-captured via `scripts/capture-fixtures.py` byte-identical
- [ ] Frontend suites (Master record module suite, catalog smokes, Security Observation form) green with zero frontend changes
- [ ] ADR-0004 recorded (backend master CRUD is a MasterCrud adapter; exclusions: Observers, Persons, EquipmentItems, Equipment Maintenance, Security Observations) and CODING_STANDARDS guidance updated ("a backend master catalog is an adapter, not a clone")
