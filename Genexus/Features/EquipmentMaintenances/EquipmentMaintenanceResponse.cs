using Itrion.Api.Features.EquipmentItems;

namespace Itrion.Api.Features.EquipmentMaintenances;

public record EquipmentMaintenanceEquipmentItem(
    int Id,
    string Name,
    string Code,
    EquipmentItemStatus Status
);

public record EquimentMaintenancePerson(
    int Id,
    string FirstName,
    string LastName,
    int Dni,
    string Email
);

public record EquipmentMaintenanceResponse(
    int Id,
    DateOnly Date,
    EquipmentMaintenanceType Type,
    EquipmentMaintenanceStatus Status,
    string Activity,
    DateOnly? ClosedAt,
    EquimentMaintenancePerson Person,
    EquipmentMaintenanceEquipmentItem EquipmentItem
); 

