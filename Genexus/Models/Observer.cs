namespace Itrion.Api.Models;

public class Observer {
    public int Id { get; set; }
    public int Legajo { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Objective { get; set; } = string.Empty;
    public ObserverPost Post { get; set; }
    public bool Active { get; set; } = true;

    public ICollection<ObserverPlantAssignment> Plants { get; set; } = new List<ObserverPlantAssignment>();
}
