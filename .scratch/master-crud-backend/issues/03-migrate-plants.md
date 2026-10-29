# 03: Migrate Plants behind MasterCrud

**What to build:** Plants — the byte-identical twin of Sectors — served entirely by the
module behind the unchanged `IPlantService`: the same six wire verbs with the same
envelopes, default order, 404/400/409 copy ("Plant is referenced by security observations
and cannot be deleted"). The Plants adapter contributes entity set, `name asc`, Id+Name
projection, validation rule, conflict copy. The Plants clone service body and
hand-written controller actions are deleted.

**Blocked by:** 02 (module + shared controller base must exist; Sectors proves the shape).

**Status:** resolved

- [x] `IPlantService` signature, DI registration, routes, status codes, and bodies unchanged
- [x] Plants sweep (list, flat feed, get-by-id, create, update, delete, 404/400/409 pins) green under `scripts/with-api.sh`
- [x] Plants clone service body and hand-written controller actions deleted; adapter config-scale, no module special cases
- [x] MSW fixtures re-captured byte-identical; frontend suites green with zero frontend changes

## Answer

Plants crosses the unchanged `IPlantService` seam onto `MasterCrud` through a
config-scale adapter (`db.Plants`, `name asc`, Id+Name projection, "Name is required",
"Plant is referenced by security observations and cannot be deleted"); the controller
keeps route + typed binding on `MasterCrudControllerBase`. Sweep green under the
harness (all pins incl. the 409 copy on an in-script SO reference); full-scope A/B
fixture capture (all-clone master tip vs all-four-migrated tree, fresh seeded DB each)
byte-identical on every master fixture; 201 `Location` verified identical in shape;
vitest 30 files / 175 tests green with zero frontend changes.
