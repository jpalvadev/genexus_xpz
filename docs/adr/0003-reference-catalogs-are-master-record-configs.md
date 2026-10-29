# Reference catalogs are Master record configs, not clones

ADR-0001 made the EquipmentMaintenances reference module "the structural contract every new
module copies". For the five reference catalogs (Sectors, Plants, Observers, Contractor
Companies, Combo Options) that contract produced five copy-pasted clones: identical
service/grid/form/action-cell/views, differing only in copy strings, columns and a handful of
quirks (flat catalogue, extra query keys, `lookup`/`getByKey`, a plants feed on the Observer
form). Every fix had to be applied five times.

**Decision**: a reference catalog is a config. `createMasterRecordModule`
(`frontend/src/master-records/`) is now the structural contract for Master records (GLOSSARY:
"Master record"): one `<entity>.config.*` file declares resource, route, query keys, copy
strings, columns, zod schema, fields and request mappings; the factory produces the service,
grid, form and pages. The interface stays CRUD-only — catalog-specific queries compose through
`extraService`, and the flat-catalogue grid is a `list` mode, not a factory special case.
Equipment Maintenance and Security Observations stay hand-rolled: their wires are not CRUD-only
(SO carries lookup feeds, combos and export; Equipment Maintenance is the live example feature
ADR-0001 keeps alive), so they are outside this contract.

**Consequences**: catalog behavior (gridify wiring, delete naming, mutation toasts, paging)
lives in one deep module with one test suite (`masterRecordModule.test.tsx`) instead of five;
a new catalog costs a config plus thin route files; the clone files under
`src/modules/<catalog>/` are deleted. The wire contract is unchanged — same routes, same
fixtures, verified against the live API by `scripts/master-parity-sweep.sh`.
