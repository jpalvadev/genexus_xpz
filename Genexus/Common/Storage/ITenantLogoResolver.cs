namespace Itrion.Api.Common.Storage;

/// <summary>
/// Resolves the logo embedded in exported spreadsheets. The MVP is single-tenant and has no
/// logo storage, so the only implementation returns no logo.
/// </summary>
public interface ITenantLogoResolver {
    Task<byte[]?> ResolvePngLogoBytesAsync(string? logoUrl);
}

public class NoLogoTenantLogoResolver : ITenantLogoResolver {
    public Task<byte[]?> ResolvePngLogoBytesAsync(string? logoUrl) => Task.FromResult<byte[]?>(null);
}
