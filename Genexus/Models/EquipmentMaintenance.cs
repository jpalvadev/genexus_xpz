using Itrion.Api.Features.EquipmentItems;
using Itrion.Api.Features.EquipmentMaintenances;

namespace Itrion.Api.Models;

public class EquipmentMaintenance {
    public int Id { get; set; }
    public DateOnly Date { get; set; }
    public EquipmentMaintenanceType Type { get; set; }
    public EquipmentMaintenanceStatus Status { get; set; }
    public string Activity { get; set; } = string.Empty;
    public DateOnly? ClosedAt { get; set; }

    public int EquipmentItemId { get; set; }
    public EquipmentItem EquipmentItem { get; set; } = null!;

    public int PersonId { get; set; }
    public Person Person { get; set; } = null!;
}
