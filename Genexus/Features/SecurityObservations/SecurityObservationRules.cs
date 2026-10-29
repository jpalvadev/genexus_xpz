namespace Itrion.Api.Features.SecurityObservations;

/// <summary>
/// The GeneXus <c>CheckRequiredFields</c> rules for SHYMA_OPS, in Spanish (ADR-0005:
/// visible copy is Spanish, contract stays English; backend enforces, frontend mirrors
/// for UX). Returns the first rule the record breaks, the way the export's
/// chained checks did.
/// </summary>
public static class SecurityObservationRules {
    public const int MinObservers = 1;
    public const int MaxObservers = 10;
    public const int ObserversBackwardsWindowDays = 7;
    public const int ObserversForwardsWindowDays = 1;

    public static string? FirstViolation(SecurityObservationRequest request, DateOnly today) {
        if (IsBlank(request.Task)) return "La tarea es obligatoria";
        if (request.PlantId <= 0) return "La planta es obligatoria";
        if (request.SectorId <= 0) return "El sector es obligatorio";
        if (IsBlank(request.Lugar)) return "El lugar es obligatorio";

        var observerIds = (request.Observers ?? []).Select(o => o.ObserverId).ToList();
        if (observerIds.Count < MinObservers) return "Se requiere al menos un observador";
        if (observerIds.Count > MaxObservers) return "El máximo de observadores es 10";
        if (observerIds.Distinct().Count() != observerIds.Count)
            return "El mismo observador no puede nombrarse dos veces en una Observación de Seguridad";

        if (SafetyReviewAnswers(request).Any(answer => answer is null))
            return "Todas las respuestas de la Revisión de Seguridad son obligatorias";

        foreach (var (label, values) in MultiSelects(request))
            if (values.Count == 0)
                return $"Se requiere al menos un label para {label}";

        if (IsBlank(request.ResumenObservacion)) return "El resumen es obligatorio";
        if (IsBlank(request.DetalleAI)) return "La acción detallada es obligatoria";
        if (IsBlank(request.DescripcionAC)) return "La descripción de la acción inmediata es obligatoria";

        if (request.ObservationDate == default)
            return "La fecha de observación es obligatoria";

        var (min, max) = ObservationDateWindow(today);
        if (request.ObservationDate < min || request.ObservationDate > max)
            return $"La fecha de observación debe estar entre {min:dd/MM/yyyy} y {max:dd/MM/yyyy}";

        return null;
    }

    public static (DateOnly Min, DateOnly Max) ObservationDateWindow(DateOnly today) =>
        (today.AddDays(-ObserversBackwardsWindowDays), today.AddDays(ObserversForwardsWindowDays));

    /// <summary>A blank finding is an error on the record: null means unanswered (GLOSSARY.md).</summary>
    private static IEnumerable<bool?> SafetyReviewAnswers(SecurityObservationRequest request) => [
        request.AprReviewed,
        request.TaskRealized,
        request.RequiresAtrReview,
        request.TrcRisk,
        request.ImpactRiskControlled,
        request.HandInjuryMeasures,
        request.InjuryMeasures,
        request.ToolsReviewed,
        request.MobileEquipmentReviewed,
        request.EnergyReviewed,
        request.LadderReviewed,
        request.ElectricalEquipmentCircuitBreaker,
    ];

    private static IEnumerable<(string Label, List<string> Labels)> MultiSelects(SecurityObservationRequest request) => [
        ("Gestión de Riesgo", request.GestionRiesgo ?? []),
        ("Protocolos Mortales", request.ProtocolosMortales ?? []),
        ("Clasificación de Observación", request.ClasificacionObservacion ?? []),
        ("Relación de Observación", request.RelacionObservacion ?? []),
    ];

    private static bool IsBlank(string? value) => string.IsNullOrWhiteSpace(value);
}
