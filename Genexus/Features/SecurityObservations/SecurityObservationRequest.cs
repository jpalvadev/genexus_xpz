namespace Itrion.Api.Features.SecurityObservations;

/// <summary>One observer named on a Security Observation (1-10 named observers per observation).</summary>
public record ObserverSelection(int ObserverId);

/// <summary>
/// Create/update payload. Required-ness is enforced by <see cref="SecurityObservationRules"/> so
/// every rejection is a 400 + <c>ErrorResponse</c> with the rule message in Spanish (ADR-0005),
/// not a framework ValidationProblemDetails response.
///
/// <c>AprReviewed</c> and its eleven sibling fields are Safety Review answers (ADR-0006):
/// strings on the framework's boundary — "SI", "NO", "N/A" — parsed to
/// <see cref="SafetyReviewAnswer"/> by the service; the entity stays typed and persisted as TEXT.
/// </summary>
public record SecurityObservationRequest(
    DateOnly ObservationDate,
    string Task,
    string Lugar,
    int PlantId,
    int SectorId,
    int? ContractorCompanyId,
    List<ObserverSelection> Observers,
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
    string DescripcionAC
);
