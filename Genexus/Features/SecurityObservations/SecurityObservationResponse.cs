namespace Itrion.Api.Features.SecurityObservations;

public record SecurityObservationObserverDto(int Id, string FullName, int Legajo, bool Active);

public record SecurityObservationPlantDto(int Id, string Name);

public record SecurityObservationSectorDto(int Id, string Name);

public record SecurityObservationCompanyDto(int Id, string Name);

public record SecurityObservationResponse(
    int Id,
    DateOnly ObservationDate,
    DateTime CreatedOn,
    string Task,
    string Lugar,
    string? AprReviewed,
    string? TaskRealized,
    string? RequiresAtrReview,
    string? TrcRisk,
    string? ImpactRiskControlled,
    string? HandInjuryMeasures,
    string? InjuryMeasures,
    string? ToolsReviewed,
    string? MobileEquipmentReviewed,
    string? EnergyReviewed,
    string? LadderReviewed,
    string? ElectricalEquipmentCircuitBreaker,
    string ControlesCriticos,
    List<string> GestionRiesgo,
    List<string> ProtocolosMortales,
    List<string> ClasificacionObservacion,
    List<string> RelacionObservacion,
    string ResumenObservacion,
    string DetalleAI,
    string DescripcionAC,
    SecurityObservationPlantDto Plant,
    SecurityObservationSectorDto Sector,
    SecurityObservationCompanyDto? ContractorCompany,
    List<SecurityObservationObserverDto> Observers
);
