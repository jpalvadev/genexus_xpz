using Itrion.Api.Features.SecurityObservations;

namespace Itrion.Api.Models;

/// <summary>
/// One registered act of security work (GeneXus SHYMA_OPS). Narrative field names keep the
/// export's names; the safety-review findings are named in English (GLOSSARY.md).
/// </summary>
public class SecurityObservation {
    public int Id { get; set; }

    public DateOnly ObservationDate { get; set; }

    /// <summary>Server-set on insert, never updated (GeneXus: SHYMA_OPSFechaCreacion = servernow() if insert).</summary>
    public DateTime CreatedOn { get; set; }

    public string Task { get; set; } = string.Empty;
    public string Lugar { get; set; } = string.Empty;

    // --- Safety Review: null means unanswered, and unanswered is an error on the record ---
    // All twelve answers are tri-state (ADR-0006): Sí/No/N/A, persisted as TEXT via the EF
    // value converter in ItrionDbContext; the wire carries "SI"/"NO"/"N/A".
    public SafetyReviewAnswer? AprReviewed { get; set; }
    public SafetyReviewAnswer? TaskRealized { get; set; }
    public SafetyReviewAnswer? RequiresAtrReview { get; set; }
    public SafetyReviewAnswer? TrcRisk { get; set; }
    public SafetyReviewAnswer? ImpactRiskControlled { get; set; }
    public SafetyReviewAnswer? HandInjuryMeasures { get; set; }
    public SafetyReviewAnswer? InjuryMeasures { get; set; }
    public SafetyReviewAnswer? ToolsReviewed { get; set; }
    public SafetyReviewAnswer? MobileEquipmentReviewed { get; set; }
    public SafetyReviewAnswer? EnergyReviewed { get; set; }
    public SafetyReviewAnswer? LadderReviewed { get; set; }
    public SafetyReviewAnswer? ElectricalEquipmentCircuitBreaker { get; set; }

    /// <summary>Free text naming the controls verified — not a yes/no finding.</summary>
    public string ControlesCriticos { get; set; } = string.Empty;

    // --- Multi-selects: JSON array of labels ---
    public string GestionRiesgo { get; set; } = "[]";
    public string ProtocolosMortales { get; set; } = "[]";
    public string ClasificacionObservacion { get; set; } = "[]";
    public string RelacionObservacion { get; set; } = "[]";

    // --- Narrative tail ---
    public string ResumenObservacion { get; set; } = string.Empty;
    public string DetalleAI { get; set; } = string.Empty;
    public string DescripcionAC { get; set; } = string.Empty;

    public int PlantId { get; set; }
    public Plant Plant { get; set; } = null!;

    public int SectorId { get; set; }
    public Sector Sector { get; set; } = null!;

    public int? ContractorCompanyId { get; set; }
    public ContractorCompany? ContractorCompany { get; set; }

    public ICollection<SecurityObservationObserver> Observers { get; set; } = new List<SecurityObservationObserver>();
}
