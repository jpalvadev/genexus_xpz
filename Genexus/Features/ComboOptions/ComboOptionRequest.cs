namespace Itrion.Api.Features.ComboOptions;

public record ComboOptionRequest(string ComboKey, string Label, int Order = 0);
