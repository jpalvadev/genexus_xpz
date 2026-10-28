namespace Itrion.Api.Features.EquipmentItems;

public class EquipmentItem {
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public EquipmentItemStatus Status { get; set; } = EquipmentItemStatus.Operational;
}
