Status: ready-for-agent

# Master record module — collapse the five catalog clones

Deepen the frontend's master-data family: one **Master record module** (a factory behind a
single config interface) replaces the five copy-pasted clones for Observer, Plant, Sector,
Contractor Company, and Combo Option. Domain language: `GLOSSARY.md`; architecture
vocabulary: module / interface / depth / seam / adapter / leverage / locality.

## Problem Statement

Today a reference catalog is built by copying the previous catalog. Plants, Sectors, and
Contractor Companies diff to nothing but names; five modules each carry their own service,
table page, action cell, form, and three views (~1,760 lines across 27 view files, plus
seven one-line re-export shims). Every fix must land five times, bugs hide in the drift
between copies (delete-toast copy already differs), and the delete dialog/toast wording is
buried inside each action cell. A new catalog means another clone, not a config.

## Solution

One deep module: `createMasterRecordModule(config)` — a small interface in
(`resource`, `nameField`, `listOrder`, structured `labels`, `columns`, `schema`, `fields`,
`initialValues`, optional `extraService`), a lot of behavior out: the produced
`{ service, TablePage, ActionCell, CreatePage, UpdatePage, Form }`. Each of the five
catalogs becomes a config; its module folder keeps only `config + columns + types` and
every clone file is deleted. Equipment Maintenance and Security Observations stay
hand-rolled — the factory serves reference catalogs only.

## User Stories

1. As a developer adding a new reference catalog, I want to declare a config, so that I never copy a module again.
2. As a developer fixing CRUD wiring, I want the fix to land in one factory, so that all five catalogs get it in the same commit.
3. As a developer reviewing a catalog PR, I want the diff to be config lines, so that I can see the entire change at a glance.
4. As a developer hunting a table bug, I want one place where pagination/sorting/filter wiring lives, so that bugs concentrate where I can fix them once.
5. As a developer, I want delete-dialog and toast copy in the config's structured labels, so that wording is data, not code scattered in action cells.
6. As a developer, I want the delete dialog to name the record via `nameField`, so that Observer (fullName) and Combo Option (label) read correctly.
7. As a developer, I want the produced service exposed under the same names the app already imports (`sectorService`, `observerService`, …), so that consumer logic never changes — only import lines move.
8. As a developer, I want Observers' picker feed (`lookup`) and Combo Options' `getByKey` declared through one named extension point, so that catalog-specific queries stay module-local and the factory stays CRUD-only.
9. As a developer, I want the form wrapper's mutation/toast/navigation glue produced by the factory, so that the five hand-written form wrappers disappear.
10. As a developer, I want route loaders to stay in route files, so that TanStack Router codegen keeps working unchanged.
11. As a developer, I want each catalog's zod schema and `FieldConfig[]` passed straight to `GenericForm`, so that a catalog that can't express itself in that language stays hand-rolled and honest.
12. As a developer, I want the existing MSW `crudMasterHandlers` adapter to be the factory's test surface, so that prod HTTP and tests cross the same seam.
13. As a tester, I want one deep test suite for the factory, so that CRUD behavior is verified once, not five times.
14. As a tester, I want a thin smoke test per catalog, so that labels, columns, resource path, and default order are pinned per config.
15. As a tester, I want the migration to be behavior-preserving — verbatim copy, same wire contracts, same MSW fixtures, so that any parity diff is a real bug.
16. As a SHYMA user, I want every master-data grid to keep behaving exactly as today (paging, sorting, filters, delete confirmations), so that nothing I learned is invalidated.
17. As a SHYMA user, I want the Security Observation form's Observer picker, Plant/Sector/Company dropdowns, and multi-select combo feeds to keep working untouched, so that my record-keeping is unaffected.
18. As a maintainer, I want the seven one-line re-export shims gone, so that an import leads straight to an implementation.
19. As a maintainer, I want `GLOSSARY.md` to define "Master record," so that the domain names this concept instead of "master data / catálogos."
20. As a future agent, I want `CODING_STANDARDS.md` to say "a reference catalog is a config," so that I build it that way first time.
21. As a future agent, I want an ADR recording that Equipment Maintenance and Security Observations deliberately stay hand-rolled, so that I don't re-suggest folding them into the factory.
22. As a release gate, I want the pilot verified against the live API harness, so that the factory's wire behavior matches the backend as shipped.

## Implementation Decisions

- **New module**: a Master record module factory, sited outside the per-feature module
  tree (it is not a catalog itself), exported as `createMasterRecordModule` — named after
  the new glossary term.
- **Interface (config), from the grilling tree — encodes the shape precisely:**

  ```ts
  createMasterRecordModule({
      resource: 'sectors',                 // wire path, react-query key, route segment
      nameField: 'name',                   // display field: 'name' | 'fullName' | 'label'
      listOrder: 'name asc',               // getAll default order
      labels: {
          title: 'Sectores',               // grid heading
          singular: 'Sector',              // delete dialog noun
          create: 'Nuevo Sector',
          toastDeleted: 'sector eliminado/a',
      },
      columns: SECTOR_COLUMNS,
      schema: sectorSchema,                // zod
      fields: sectorFields,                // FieldConfig[], straight into GenericForm
      initialValues: { name: '' },
      extraService: (base) => base,        // optional; the one named composition point
  })  // → { service, TablePage, ActionCell, CreatePage, UpdatePage, Form }
  ```

- **Depth**: the factory produces all six shallow pieces; a catalog folder reduces to
  `config + columns + types`. The 27 clone view files, 5 service files, 5 action cells,
  5 form wrappers, and 7 re-export shims are deleted, not deprecated.
- **Seam discipline**: the factory's interface is CRUD-only. Observers' `lookup` and Combo
  Options' `getByKey` compose through `extraService`. Combo Options' quirks (comboKey as a
  select from the static combo-keys list, numeric order) are expressed in `FieldConfig`,
  not as factory special cases.
- **Consumers**: produced services are exported under existing names; Security Observation
  form, route files, and tests change import lines only. Route loaders (getById on edit
  routes) stay in route files; the produced UpdatePage stays presentational.
- **Gridify hooks** (`useGridifyParams`, `useFilters`, `tableSortMapper`, `useDebounce`)
  become the factory's internal implementation; hook interfaces don't change.
- **Migration**: one catalog per PR, Sectors pilot first, verified against the live-API
  harness; behavior-preserving — Spanish copy moves into labels verbatim, copy edits are
  separate commits.
- **Docs side effects, in the pilot PR**: add **Master record** to `GLOSSARY.md`
  (_Avoid_: master data, catalog, reference data, lookup table); update the new-module
  guidance in `CODING_STANDARDS.md`; record ADR-0003 — the "structural contract" of
  ADR-0001 for reference catalogs is now the Master record module's config interface;
  Equipment Maintenance (ADR-0001's reference) and Security Observations (real depth:
  rules, Observers join, export) stay hand-rolled.
- **No backend change, no schema change, no wire-contract change.**

## Testing Decisions

- **One seam**: tests cross the existing HTTP seam realized by MSW — prod adapter is the
  live API, test adapter is the existing `crudMasterHandlers` factory. Two adapters make
  it a real seam; no new seams are introduced.
- **The factory is tested through its produced interface**: render the produced TablePage /
  Create / Update pages and exercise CRUD against MSW — pagination, sorting, filter reset,
  create/update mutation with toast, delete confirmation naming the record. The config
  object is not unit-tested past its interface.
- **Per-catalog smoke tests** cross the same seam: render, assert heading, columns, create
  button label, resource path hit, default order.
- **Good tests assert external behavior** (what a user sees, what request crosses the
  wire), never config internals or hook call orders.
- **Prior art**: `GenericTable.test.tsx`, `useGridifyParams.test.ts`,
  `SecurityObservationForm.test.tsx` (render + MSW + test-utils), and the MSW
  `crudMasterHandlers` factory itself — the factory's shape was proven in the test
  adapter first.
- **Gates** (repo pre-commit/pre-push): `tsc -b`, `eslint --max-warnings=0` on staged TS
  files, `vitest run` serially; pilot additionally verified via `scripts/with-api.sh`
  against the live API.

## Out of Scope

- Backend master services/controllers (the report's Candidate 2 — same move, no interface
  change, a natural follow-up).
- Equipment Maintenance and Security Observations modules (staying hand-rolled per
  ADR-0001/ADR-0003).
- Gridify table-page wiring as its own deepening (Candidate 5) — absorbed as factory
  internals, not redesigned.
- Safety Review rules mirrored in two languages (Candidate 4) and Gridify-syntax leakage
  in UI code (Candidate 6), except as dissolved by the factory.
- Spanish copy fixes, new catalogs, MSW handler-shape changes, route-structure changes,
  auth (none — ADR-0001), and dead MSW handler cleanup (independent deletion, its own
  ticket).

## Further Notes

The seam was decided by the architecture review (`architecture-review-20261028.html`,
candidate 1) and a grilling loop; all fifteen tree decisions are recorded above and in
this spec — the config shape, `nameField`, route-loader placement, export-name stability,
factory location/name, no-factory-specials rule, extension point, verbatim-copy rule, and
docs side effects. `crudMasterHandlers` in the MSW adapter is the existence proof that the
five catalogs share one shape; this spec makes the production code as deep as the test
harness already is.
