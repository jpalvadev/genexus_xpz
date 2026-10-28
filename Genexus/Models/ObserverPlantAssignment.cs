namespace Itrion.Api.Models;

public class ObserverPlantAssignment {
    public int ObserverId { get; set; }
    public Observer Observer { get; set; } = null!;

    public int PlantId { get; set; }
    public Plant Plant { get; set; } = null!;
}
