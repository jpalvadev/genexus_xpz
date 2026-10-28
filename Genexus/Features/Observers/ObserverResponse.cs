using Itrion.Api.Models;

namespace Itrion.Api.Features.Observers;

public record ObserverResponse(
    int Id,
    int Legajo,
    string FullName,
    string Objective,
    ObserverPost Post,
    bool Active,
    List<int> PlantIds);
