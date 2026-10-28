# 01 — Backend infrastructure & entities

Status: resolved

- Add packages: `Gridify`, `Gridify.EntityFramework`, `ClosedXML`.
- `Models/ItrionDbContext.cs` + entities: Person, EquipmentItem, EquipmentMaintenance,
  ContractorCompany, Plant, Sector, Observer, ObserverPlantAssignment, ComboOption,
  SecurityObservation, SecurityObservationObserver.
- `Features/EquipmentItems/EquipmentItem.cs` + `EquipmentItemStatus` (namespace the
  reference service imports); `Common/Storage/ITenantLogoResolver` stub (no tenant —
  export logo resolution is not part of the MVP).
- `Program.cs`: register `ItrionDbContext` (UseSqlite from
  `ConnectionStrings:Default = Data Source=itrion.db` in appsettings.json), CORS for the
  Vite dev origin, controllers, OpenApi.
- Backend auth sweep: remove every `[RequirePermission]` from
  `EquipmentMaintenancesController` (no attribute created), strip tenant deps from
  `EquipmentMaintenanceService`.
- Compile: `dotnet build` clean.

## Answer

Done on `integration/security-observations`, commit `a3d33b3`. `dotnet build`: 0 warnings, 0 errors.

- Packages: `Gridify` 2.20.0, `Gridify.EntityFramework` 2.20.0, `ClosedXML` 0.105.1.
- `Models/ItrionDbContext.cs` uses namespace `Itrion.Api.Models` (the folder the entities live
  in); `EquipmentMaintenanceService`'s stale `using Itrion.Api.Data;` was dropped to match.
- Entities: 11 SHYMA/reference entities. Safety-review findings are named from the export's
  `SHYMA_OPS*` attributes (AprReviewed, TaskRealized, RequiresAtrReview, TrcRisk,
  ImpactRiskControlled, HandInjuryMeasures, InjuryMeasures, ToolsReviewed,
  MobileEquipmentReviewed, EnergyReviewed, LadderReviewed, ElectricalEquipmentCircuitBreaker),
  all `bool?`. Multi-selects are `string` columns holding JSON arrays, default `"[]"`.
  Composite keys: `SecurityObservationObserver (ObservationId, ObserverId)`,
  `ObserverPlantAssignment (ObserverId, PlantId)`. `Restrict` on every SHYMA reference FK
  (ADR 0002); join rows cascade with their observation, never with an Observer.
- `Common/AppTimeZone.cs` added — `ExcelExporter` referenced it and nothing defined it.
- `Common/Storage/ITenantLogoResolver.cs` + `NoLogoTenantLogoResolver`.
- Deviation: `ExcelExporter`'s logo-sizing block used `SixLabors.ImageSharp`, which was the only
  reason to reference it. 3.1.x carries high-severity advisories and 3.2.0 requires a commercial
  license, and this MVP never supplies a logo — the sizing block and its pixel helpers are
  deleted, the logo is inserted at native size. No ImageSharp package, no license file.
- All 7 `[RequirePermission]` attributes and the `Features.Auth` import removed from
  `EquipmentMaintenancesController`; `ITenantContext`, `TenantId` and the `Tenants` lookup
  removed from `EquipmentMaintenanceService`.
- `Program.cs`: `ItrionDbContext` via `ConnectionStrings:Default`, CORS policy for the Vite dev
  origin (5173), controllers, OpenApi, `IEquipmentMaintenanceService` registration. Removed
  `UseHttpsRedirection` (the dev profile serves plain HTTP on 5281, which the Vite dev server
  calls directly) and `UseAuthorization`.
