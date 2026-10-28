using Itrion.Api.Models;

namespace Itrion.Api.Features.Observers;

public record ObserverRequest(
    int Legajo,
    string FullName,
    string Objective,
    ObserverPost Post,
    bool Active = true,
    List<int>? PlantIds = null);
