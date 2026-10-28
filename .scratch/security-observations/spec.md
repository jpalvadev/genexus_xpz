# Security Observations (SHYMA) — MVP spec

Migrate the SHYMA security-observation logic from `RenovaApp_All_2023_2.xml` into the
existing MVP: .NET 10 vertical-feature backend (`Genexus/`, namespace `Itrion.Api`) +
React/Vite frontend (`frontend/`). Single-user local app: **no auth anywhere** (deleted,
not stubbed), no workflows ("no chart surface"), SQLite. Domain language: `GLOSSARY.md`.

## Data model (SQLite, EF Core migrations)

- `SecurityObservation` (PK int Id): ObservationDate `DateOnly`, CreatedOn `DateTime`
  (server-set on insert, immutable), Task/Lugar/ControlesCriticos/ResumenObservacion/
  DetalleAI/DescripcionAC text, FK Sector (required), FK Plant (required),
  FK ContractorCompany (optional). All FKs `Restrict` — retiring a reference never
  retires observations.
- `SecurityObservationObserver` join table (ObservationId, ObserverId), 1–10 enforced in
  handlers.
- Safety Review answers: nullable `bool` (null = unanswered). Free text: ControlesCriticos.
- Multi-selects stored as JSON array of labels: GestionRiesgo, ProtocolosMortales,
  ClasificacionObservacion, RelacionObservacion.
- Master data: `Observer` (Legajo unique, FullName, Objective, Post enum
  Gerente/Jefe/Supervisor, Active, plant assignments), `Plant`, `Sector`,
  `ContractorCompany`, `ComboOption (ComboKey, Label, Order)` seeded with invented labels.
- Reference module kept: `Person`, `EquipmentItem`, `EquipmentMaintenance`.

## Rules (from GeneXus `CheckRequiredFields`, English messages)

Required: ObservationDate, Task, Plant, Sector, Place, ≥1 observer, every Safety Review
answer, ≥1 label on each of the 4 multi-selects, Summary, Detailed Action, Immediate
Action. Observers ≤ 10. ObservationDate within [today−7, today+1]. Backend enforces;
frontend mirrors for UX.

## APIs (`/api/v1/...`, Gridify paging/filter/sort, no permissions)

`security-observations` GET, GET/{id}, POST, PUT/{id}, DELETE/{id}, GET/export-excel;
`observers`, `plants`, `sectors`, `contractor-companies` full CRUD;
`combo-options/{comboKey}` lookup.

## Frontend

No auth: strip JWT/401/tenant interceptors from `apiClient`, delete `Authorized`,
`useAuthUser`, `usePermission`, `UserMenu`, MSW auth handlers; routes top-level under a
shared `AppShell` layout. Five modules mirroring `equipmentMaintenances`
(GenericForm/GenericTable, 4 routes each): `securityObservations`, `observers`,
`plants`, `sectors`, `contractorCompanies`. Excel export on the observations table only.
Frontend tests mirrored (MSW, form test, contract schemas); no backend test project.

## Decisions log (grilling Q-numbers)

In-place repair keeping the reference module (Q1–Q2); full CRUD 5 modules, export for
observations, no charts (Q3, Q14); normalized observer join (Q4); backend-enforced
validation, English messages (Q5); invented English combo labels seeded in `ComboOption`
(Q6, Q16); JSON label arrays (Q7); English naming (Q8); migration-based SQLite with
HasData demo seeds incl. equipment rows (Q9, Q11, Q23); int ids / DateOnly / nullable
bools (Q10); auth fully deleted (Q12, Q13, Q21); static menu in AppShell (Q22);
ADRs 0001–0002 (Q20); frontend test parity (Q19); docs-first order (Q24).
