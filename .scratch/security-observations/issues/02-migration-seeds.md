# 02 — Initial migration & demo seeds

Status: resolved

- Local tool manifest with `dotnet-ef`; create + apply the initial EF migration.
- `HasData` seeds: 4 Plants (English names, legacy subtype labels baked in, e.g.
  "North Plant (RNV)"), 4 Sectors, 3 Contractor Companies, 4 Observers (Legajo, Post,
  Active, Objective) with plant assignments, ComboOptions for the 4 combo keys
  (invented English labels), 3 Persons, 3 EquipmentItems, 2 EquipmentMaintenances.
- SQLite file `itrion.db` generated; API returns seeded rows.

## Answer

Done on `integration/security-observations`, commit `73951ed`.

- `Genexus/dotnet-tools.json` pins `dotnet-ef` 10.0.14 (matches the EF Core 10.0.14 packages);
  `dotnet tool restore` then `dotnet ef migrations add InitialCreate` →
  `Migrations/20261028041117_InitialCreate.cs`; `dotnet ef database update` created
  `Genexus/itrion.db` (git-ignored, like all `*.db`).
- Seeds live in `Models/SeedData.cs`, called from `OnModelCreating`: 4 Plants (legacy subtypes
  baked into the label: "North Plant (RNV)", "South Plant (PLS)", "Central Plant (TSS)",
  "Dock Plant (VQG)"), 4 Sectors, 3 Contractor Companies, 4 Observers + 6 plant assignments
  (one Observer seeded Inactive so the Active-only dropdown is visible), 18 ComboOptions across
  the 4 combo keys (`gestionRiesgo`, `protocolosMortales`, `clasificacionObservacion`,
  `relacionObservacion`), 3 Persons, 3 EquipmentItems, 2 EquipmentMaintenances.
- Deliberate omission: no Security Observations are seeded. The Observation Date window is
  relative to today, so baked-in observation dates would age out of the editable window and
  every seeded row would be rejected on its first edit.
- Verified against the running API (`dotnet run --launch-profile http`, dev profile migrates on
  start-up): `GET /api/v1/equipment-maintenances` →
  `{"count":2,"data":[{...Conveyor Line A...},{...Forklift 12...}]}`.
