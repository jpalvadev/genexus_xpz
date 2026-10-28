# 01 — Backend infrastructure & entities

Status: ready-for-agent

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
