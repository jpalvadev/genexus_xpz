# 06 — Security Observations frontend module

Status: resolved

`src/modules/securityObservations/` mirroring `equipmentMaintenances`:
types / service / hooks / columns / form / views (table, create, edit, view-by-id) +
routes `securityObservations` (`index`, `new`, `$id`, `$id/edit`).

- Grid: Id, Observation Date, Plant, Sector, Task, Company, Observers (joined names),
  Created On; default sort Created On desc; full-text search on Id, Task, Place, Sector,
  Company; Excel export button.
- Form: GenericForm with observer multi-select (Active only, label "FullName — Legajo",
  max 10, min 1), date min/max = today−7 / today+1, Safety Review checkbox groups,
  4 × FormMultiSelect backed by `combo-options/{key}`, narrative textareas; required
  validation mirroring the backend.

## Answer

Backend module complete (CRUD + Gridify nested filters + `WithDefaultSort createdOn desc`
+ export-excel) plus frontend module `securityObservations`:

- Types + zod schema mirroring backend rule messages/order (`securityObservationSchema`),
  mapping helpers (persisted labels ↔ combo option ids; observers ids).
- Service + `useSecurityObservationsQuery` (page/size/`OrderBy`/`Filters` plural via
  `buildGridifyParams`); export endpoint returning blob.
- Table view: server pagination, sortable headers, per-column filter boxes for the
  ticket's searchable fields (id, observationDate, plant.name, sector.name, task, lugar,
  company.name, createdOn), export-excel button (active only when rows present),
  delete confirm, edit/create routes, "Seguridad" nav group with Shield icon.
- Form: plant/sector/company Selects, observers MultiSelect backed by server-side
  `GET /observers` lookup (`active eq true,fullName=*term`, label `FullName — Legajo`),
  four combo MultiSelects backed by `GET /combo-options/{key}`, date window
  today−7…today+1 enforced in zod with the backend's message, 12 Safety Review
  checkboxes (null = unanswered → "Every Safety Review answer is required"),
  textareas + AC labels, combo minimum-one-label and observers 1–10 + duplicate
  messages identical to backend.
- Master modules created for observers/plants/sectors/contractor-companies/combo-options
  (`types/` + `services/` with alias files, lookup on observers, `getAll` via gridify
  paging, `getByKey` for combo); 4 routes under `/securityObservations` + route tree.

Gridify bug fixed on the way: `SecurityObservationService` used the default mapper for
gridify parsing, so any mapped expression (`sector.name=…`, custom `id` contains map,
nested `OrderBy`) threw. Added `CreateMapper()` (bootstrapper mapper +
`SecurityObservationGridifyConfig.Configure`) used by `GetAllAsync`/`ExportAsync`.

Verification:
- `dotnet build` 0 warnings/0 errors; ops + master smoke suite 33/33; dedicated Gridify
  smoke 9/9 (nested sector/plant/company filters, `||` OR, AND task+date, `id=*n`,
  `OrderBy plant.name asc`, `OrderBy createdOn desc`, export-excel 200) + create 201 /
  delete 204.
- Frontend gates green: `vite build` (route tree regenerated), `tsc -b` exit 0,
  `vitest run` 133/133 (existing suites untouched).
- MSW integration smoke for the form is scheduled for ticket 08.

Caveat: with `mode=update`, TanStack form `useAppForm` initializes `fieldConfig` from
mount props; the combo MultiSelects resolve saved labels to ids via the catalogue
query, so the edit form renders once masters load (Loading gate) — labels display
correctly on edit.
