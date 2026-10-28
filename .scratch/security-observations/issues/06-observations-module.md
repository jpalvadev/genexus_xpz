# 06 — Security Observations frontend module

Status: ready-for-agent

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
