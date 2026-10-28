# 04 — Master data & combo APIs

Status: resolved

Full CRUD per module, equipment-style (Gridify grid + GetById + Create + Update +
Delete), no permissions:

- `api/v1/observers` — Legajo unique (400 "Legajo already exists" on conflict), FullName,
  Objective, Post, Active, plant assignment list.
- `api/v1/plants`, `api/v1/sectors`, `api/v1/contractor-companies` — name-only entities.
- `api/v1/combo-options/{comboKey}` — `{ id, label }` ordered list for the 4 combo keys.

## Answer

All five master-data modules are live, equipment-style, no permissions, 0 warnings/0 errors.

- `api/v1/observers` — Gridify grid (`?page/pageSize/filter/orderBy`, default `legajo asc`),
  GetById, Create, Update, Delete. Legajo unique on create AND update → 400
  `"Legajo already exists"`. Carries `fullName`, `objective`, `post` (1 Gerente / 2 Jefe /
  3 Supervisor), `active`, and `plantIds` (assignment rows are replaced wholesale on every
  write; unknown plant id → 400). Deleting an observer referenced by an observation → 409.
- `api/v1/plants`, `api/v1/sectors`, `api/v1/contractor-companies` — same shape,
  `name`-only records (`{ id, name }`), `name=*x` prefix filter, blank name → 400,
  referenced rows protected with 409 on delete.
- `api/v1/combo-options/{comboKey}` → `[{ id, comboKey, label, order }, …]` ordered by
  `order, id` for the 4 seeded keys; `GET /combo-options` (all, for the admin grid) plus
  full CRUD. Labels live on observations as text, so combo deletes are never blocked.
- Plumbing: `Common/ApiExceptions.cs` (`ValidationException`/`ConflictException`) +
  `Common/ApiExceptionMiddleware.cs` translating them to 400/409 `ErrorResponse`;
  services registered in `Program.cs`.
- Verified with `/tmp/opencode/smoke-master.py`: 75/75 checks (CRUD on all five modules,
  Legajo conflict on create/update, self-update with same Legajo OK, Gridify filter/order
  round-trips, seeded inactive observer 1004, 409 guards on plants/observers).
