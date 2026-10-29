# 03: Migrate Plants behind MasterCrud

**What to build:** Plants — the byte-identical twin of Sectors — served entirely by the
module behind the unchanged `IPlantService`: the same six wire verbs with the same
envelopes, default order, 404/400/409 copy ("Plant is referenced by security observations
and cannot be deleted"). The Plants adapter contributes entity set, `name asc`, Id+Name
projection, validation rule, conflict copy. The Plants clone service body and
hand-written controller actions are deleted.

**Blocked by:** 02 (module + shared controller base must exist; Sectors proves the shape).

**Status:** ready-for-agent

- [ ] `IPlantService` signature, DI registration, routes, status codes, and bodies unchanged
- [ ] Plants sweep (list, flat feed, get-by-id, create, update, delete, 404/400/409 pins) green under `scripts/with-api.sh`
- [ ] Plants clone service body and hand-written controller actions deleted; adapter config-scale, no module special cases
- [ ] MSW fixtures re-captured byte-identical; frontend suites green with zero frontend changes
