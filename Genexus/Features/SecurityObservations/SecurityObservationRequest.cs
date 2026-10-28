namespace Itrion.Api.Features.SecurityObservations;

/// <summary>One observer named on a Security Observation (1-10 named observers per observation).</summary>
public record ObserverSelection(int ObserverId);

/// <summary>
/// Create/update payload. Required-ness is enforced by <see cref="SecurityObservationRules"/> so
/// every rejection is a 400 + <c>ErrorResponse</c> with the export's rule in English, not a
/// framework ValidationProblemDetails response.
/// </summary>
public record SecurityObservationRequest(
    DateOnly ObservationDate,
    string Task,
    string Lugar,
    int PlantId,
    int SectorId,
    int? ContractorCompanyId,
    List<ObserverSelection> Observers,
    bool? AprReviewed,
    bool? TaskRealized,
    bool? RequiresAtrReview,
    bool? TrcRisk,
    bool? ImpactRiskControlled,
    bool? HandInjuryMeasures,
    bool? InjuryMeasures,
    bool? ToolsReviewed,
    bool? MobileEquipmentReviewed,
    bool? EnergyReviewed,
    bool? LadderReviewed,
    bool? ElectricalEquipmentCircuitBreaker,
    string ControlesCriticos,
    List<string> GestionRiesgo,
    List<string> ProtocolosMortales,
    List<string> ClasificacionObservacion,
    List<string> RelacionObservacion,
    string ResumenObservacion,
    string DetalleAI,
    string DescripcionAC
);
