using System.ComponentModel.DataAnnotations;
using Itrion.Api.Features.EquipmentItems;

namespace Itrion.Api.Features.EquipmentMaintenances;

public record EquipmentMaintenanceRequest(
    [Required] DateOnly Date,
    [Required] EquipmentMaintenanceType Type,
    [Required] EquipmentMaintenanceStatus Status,
    [MaxLength(255)] string Activity,
    [Required] int EquipmentItemId,
    [Required] int PersonId,
    DateOnly? ClosedAt,
    EquipmentItemStatus? EquipmentStatus
);

