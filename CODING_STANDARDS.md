# Coding standards

Read at review time. Judgement calls only — anything mechanical is already a gate
(`.githooks/pre-commit`: `tsc -b` + eslint).

## Frontend conventions

- **Module shape**: `src/modules/<module>/` with `<entity>.service.ts` (+ `<plural>.service.ts` alias for master modules), `<entity>.type.ts` for types, components under `components/`.
- **A reference catalog is a config, never a clone** (ADR-0003): master modules (Sectors, Plants,
  Observers, Contractor Companies, Combo Options) are one `<entity>.config.*` file handed to
  `createMasterRecordModule` in `frontend/src/master-records/` — resource, copy strings, columns,
  schema and fields as data. The factory produces service/grid/form/pages; catalog-specific
  queries (`lookup`, `getByKey`) compose through the config's `extraService`, and gridify-vs-flat
  list wiring is the config's `list` mode. Don't hand-roll a second CRUD clone; Equipment
  Maintenance and Security Observations keep their hand-rolled views (their wire is not CRUD-only).
- **Types are type aliases, not interfaces** — response/entity types use `type X = {...}`.
- **Forms**: TanStack `useAppForm` from the shared GenericForm; dropdown options are supplied via `FieldConfig.children` JSX. API calls go through the axios `apiClient` from `@/api/apiClient` (no auth headers).
- **Gridify binding**: list controllers bind the filter parameter as `Filter` (singular) — the convention across master modules and equipment. Binding `Filters` (plural, via `buildGridifyParams`) is the documented exception in `frontend/src/utils/gridifyFilter.ts` (see the header comment).
- **Rule messages are English** end to end: backend validator messages arrive verbatim in the UI; translating them at the frontend is a violation.
- **Date windows**: business windows (e.g. observation date `[today−7, today+1]`) are enforced by the backend validator; the form mirrors them in its zod schema. Divergence between the two is a finding.

## Test conventions

- **Contract tests read live-captured fixtures** (`frontend/src/test/fixtures/`, recaptured via `scripts/capture-fixtures.py`), asserted with zod parsers typed against the TS types; a type drift fails the build, not just the review.
- **MSW handlers mirror live response shapes exactly** — master CRUD goes through the `crudMasterHandlers` factory in `frontend/src/test/msw/handlers.ts`; a new master module adds a factory call, not a copy-paste block. Combo endpoints return flat arrays, list endpoints `{count, data}` (+ `total-records-count` header).
- **Forms tests mock services via `vi.mock`**: the mocked module must spread `importOriginal` and override only the feed methods — routes and sibling modules import the module's *other* named exports (pages, service), and a mock missing them fails collection with "No X export is defined on the mock". The router mock additionally adds `useCanGoBack: () => true`. MultiSelect items are cmdk `role=option`, not checkboxes.
