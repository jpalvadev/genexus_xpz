# 04 — Master data & combo APIs

Status: ready-for-agent

Full CRUD per module, equipment-style (Gridify grid + GetById + Create + Update +
Delete), no permissions:

- `api/v1/observers` — Legajo unique (400 "Legajo already exists" on conflict), FullName,
  Objective, Post, Active, plant assignment list.
- `api/v1/plants`, `api/v1/sectors`, `api/v1/contractor-companies` — name-only entities.
- `api/v1/combo-options/{comboKey}` — `{ id, label }` ordered list for the 4 combo keys.
