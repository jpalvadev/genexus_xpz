namespace Itrion.Api.Features.SecurityObservations;

/// <summary>
/// The GeneXus <c>CheckRequiredFields</c> rules for SHYMA_OPS, in English (spec: backend enforces,
/// frontend mirrors for UX). Returns the first rule the record breaks, the way the export's
/// chained checks did.
/// </summary>
public static class SecurityObservationRules {
    public const int MinObservers = 1;
    public const int MaxObservers = 10;
    public const int ObserversBackwardsWindowDays = 7;
    public const int ObserversForwardsWindowDays = 1;

    public static string? FirstViolation(SecurityObservationRequest request, DateOnly today) {
        if (IsBlank(request.Task)) return "Task is required";
        if (request.PlantId <= 0) return "Plant is required";
        if (request.SectorId <= 0) return "Sector is required";
        if (IsBlank(request.Lugar)) return "Place is required";

        var observerIds = (request.Observers ?? []).Select(o => o.ObserverId).ToList();
        if (observerIds.Count < MinObservers) return "At least one observer is required";
        if (observerIds.Count > MaxObservers) return "The maximum number of observers is 10";
        if (observerIds.Distinct().Count() != observerIds.Count)
            return "The same observer cannot be named twice on one Security Observation";

        if (SafetyReviewAnswers(request).Any(answer => answer is null))
            return "Every Safety Review answer is required";

        foreach (var (label, values) in MultiSelects(request))
            if (values.Count == 0)
                return $"At least one label is required for {label}";

        if (IsBlank(request.ResumenObservacion)) return "Summary is required";
        if (IsBlank(request.DetalleAI)) return "Detailed Action is required";
        if (IsBlank(request.DescripcionAC)) return "Immediate Action Description is required";

        if (request.ObservationDate == default)
            return "Observation Date is required";

        var (min, max) = ObservationDateWindow(today);
        if (request.ObservationDate < min || request.ObservationDate > max)
            return $"Observation Date must be between {min:yyyy-MM-dd} and {max:yyyy-MM-dd}";

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
        ("Risk Management", request.GestionRiesgo ?? []),
        ("Fatal-Risk Protocols", request.ProtocolosMortales ?? []),
        ("Observation Classification", request.ClasificacionObservacion ?? []),
        ("Observation Relation", request.RelacionObservacion ?? []),
    ];

    private static bool IsBlank(string? value) => string.IsNullOrWhiteSpace(value);
}
