# 07 — Master data frontend modules

Status: resolved

`observers`, `plants`, `sectors`, `contractorCompanies` modules — same 4-route skeleton
(GenericTable + GenericForm):

- Observers: Legajo (int), FullName, Objective, Post select (Gerente/Jefe/Supervisor),
  Active checkbox, Plants multi-select.
- Plants / Sectors / Contractor Companies: name-only forms.

## Answer

CRUD UI for the five master datasets on top of the ticket-06 services, following the
equipmentMaintenances/persons conventions (GenericTable + GenericForm + TanStack routes):

- `modules/plants`, `modules/sectors`, `modules/contractorCompanies`: list pages (server
  pagination, sortable headers, per-column filter boxes, Limpiar filtros), create/update
  forms (single required `name` field, zod mirror "Name is required"), action cells with
  edit link + delete confirm dialog.
- `modules/observers`: list (Legajo/Nombre/Cargo/Activo columns) + full form — legajo
  (numeric, regex mirror), FullName required, Objective textarea required, Cargo select
  (Gerente/Jefe/Supervisor = ObserverPost 1/2/3), Activo checkbox, Plantas MultiSelect
  fed by `plantService.getAll`. Requests use the real `ObserverRequest` shape
  `{legajo, fullName, objective, post, active, plantIds}`.
- `modules/comboOptions`: flat-catalogue list (client-side pagination/sorting since
  `GET /combo-options` is not gridified) + form with Combo Key select (the four known
  keys), Label (required) and Order.
- Routes `/_layout/{plants,sectors,contractorCompanies,observers,comboOptions}/
  {index,new,$id/edit}` (loader+pending pattern), route tree regenerated; nav "Seguridad
  → Catálogos" submenu with the five entries.

Two real defects found and fixed on the way (they were latent in ticket-06 code):
1. Master controllers bind the gridify filter as **`Filter` (singular)** — `Filters`
   (plural) is silently ignored (this is why the legacy equipment service sends
   `Filter`). The five master services now send `gridifyQuery` directly (Page/PageSize/
   OrderBy/Filter), matching the controllers; plural `Filters` remains only for
   security-observations, which binds plural.
2. `active eq true` is not valid Gridify syntax (500 GridifyFilteringException); the
   observers lookup now sends `active=true` (verified live: count 3 of 4 seeded).

Master rule texts observed live (probes): plants/sectors/companies validate only required
name ("Name is required" 400), observers: "FullName is required", "Legajo already exists",
Objective required (model binding), Post accepts any int (client form restricts to the
enum), combos accept any key/label server-side (client form restricts to known keys and
required label). Forms mirror exactly what the backend enforces.

Verification: `tsc -b` exit 0; `vite build` green (route tree regenerated);
`vitest run` 133/133; live master UI smoke 6/6 (singular Filter contains, fullName
contains, active=true, legajo desc ordering + paging, company list, plants OrderBy
name desc).
