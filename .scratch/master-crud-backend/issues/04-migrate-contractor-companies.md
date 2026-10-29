# 04: Migrate Contractor Companies behind MasterCrud

**What to build:** Contractor Companies — the third name-only twin — served entirely by
the module behind the unchanged `IContractorCompanyService`: the same six wire verbs with
the same envelopes, default order, and 404/400/409 copy ("ContractorCompany is referenced
by security observations and cannot be deleted"). The adapter contributes entity set,
`name asc`, Id+Name projection, validation rule, conflict copy. The clone service body and
hand-written controller actions are deleted.

**Blocked by:** 02 (module + shared controller base must exist).

**Status:** resolved

- [x] `IContractorCompanyService` signature, DI registration, routes, status codes, and bodies unchanged
- [x] Contractor-companies sweep (list, flat feed, get-by-id, create, update, delete, 404/400/409 pins) green under `scripts/with-api.sh`
- [x] Clone service body and hand-written controller actions deleted; adapter config-scale, no module special cases
- [x] MSW fixtures re-captured byte-identical; frontend suites green with zero frontend changes

## Answer

Contractor Companies crosses the unchanged `IContractorCompanyService` seam onto
`MasterCrud` through a config-scale adapter (`db.ContractorCompanies`, `name asc`,
Id+Name projection, "Name is required", "ContractorCompany is referenced by security
observations and cannot be deleted"); controller keeps route + typed binding on the
shared base. Sweep green under the harness (all pins incl. the 409 copy via an
in-script SO with `contractorCompanyId` set); same full-scope A/B fixture proof
byte-identical; 201 `Location` verified identical in shape; vitest green, zero
frontend changes.
