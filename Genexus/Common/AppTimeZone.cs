namespace Itrion.Api.Common;

public static class AppTimeZone {
    private static readonly TimeZoneInfo Argentina = ResolveArgentinaTimeZone();

    /// <summary>Local wall-clock time in the plant's timezone, used by generated documents.</summary>
    public static DateTime NowInArgentina => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Argentina);

    private static TimeZoneInfo ResolveArgentinaTimeZone() {
        foreach (var id in new[] { "Argentina Standard Time", "America/Buenos_Aires" }) {
            try {
                return TimeZoneInfo.FindSystemTimeZoneById(id);
            } catch (TimeZoneNotFoundException) {
                // Try the next candidate: tzdata and Windows name the zone differently.
            }
        }
        // Buenos Aires has had no DST since 2009, so a fixed offset is a safe fallback.
        return TimeZoneInfo.CreateCustomTimeZone("Argentina", TimeSpan.FromHours(-3), "Argentina Standard Time", "Argentina Standard Time");
    }
}
