namespace Itrion.Api.Models;

/// <summary>
/// Normalized replacement of the export's concatenated SHYMA_OPSObservador attribute (ADR 0002).
/// 1-10 rows per observation is enforced in the handlers.
/// </summary>
public class SecurityObservationObserver {
    public int ObservationId { get; set; }
    public SecurityObservation Observation { get; set; } = null!;

    public int ObserverId { get; set; }
    public Observer Observer { get; set; } = null!;
}
