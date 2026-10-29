namespace Itrion.Api.Models;

public class ComboOption {
    public int Id { get; set; }
    public string ComboKey { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int Order { get; set; }
}
