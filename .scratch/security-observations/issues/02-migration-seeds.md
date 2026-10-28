# 02 — Initial migration & demo seeds

Status: resolved

- Local tool manifest with `dotnet-ef`; create + apply the initial EF migration.
- `HasData` seeds: 4 Plants (English names, legacy subtype labels baked in, e.g.
  "North Plant (RNV)"), 4 Sectors, 3 Contractor Companies, 4 Observers (Legajo, Post,
  Active, Objective) with plant assignments, ComboOptions for the 4 combo keys
  (invented English labels), 3 Persons, 3 EquipmentItems, 2 EquipmentMaintenances.
- SQLite file `itrion.db` generated; API returns seeded rows.
