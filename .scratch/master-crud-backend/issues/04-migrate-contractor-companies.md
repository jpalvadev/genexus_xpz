# 04: Migrate Contractor Companies behind MasterCrud

**What to build:** Contractor Companies — the third name-only twin — served entirely by
the module behind the unchanged `IContractorCompanyService`: the same six wire verbs with
the same envelopes, default order, and 404/400/409 copy ("ContractorCompany is referenced
by security observations and cannot be deleted"). The adapter contributes entity set,
`name asc`, Id+Name projection, validation rule, conflict copy. The clone service body and
hand-written controller actions are deleted.

**Blocked by:** 02 (module + shared controller base must exist).

**Status:** ready-for-agent

- [ ] `IContractorCompanyService` signature, DI registration, routes, status codes, and bodies unchanged
- [ ] Contractor-companies sweep (list, flat feed, get-by-id, create, update, delete, 404/400/409 pins) green under `scripts/with-api.sh`
- [ ] Clone service body and hand-written controller actions deleted; adapter config-scale, no module special cases
- [ ] MSW fixtures re-captured byte-identical; frontend suites green with zero frontend changes
