using Gridify;

namespace Itrion.Api.Features.SecurityObservations;

public interface ISecurityObservationService {
    Task<Paging<SecurityObservationResponse>> GetAllAsync(GridifyQuery query);
    Task<SecurityObservationResponse?> GetByIdAsync(int id);
    /// <summary>Non-null Error is a 400 with that message; null Response with null Error is a 404.</summary>
    Task<(SecurityObservationResponse? Response, string? Error)> CreateAsync(SecurityObservationRequest request);
    Task<(SecurityObservationResponse? Response, string? Error)> UpdateAsync(int id, SecurityObservationRequest request);
    Task<bool> DeleteByIdAsync(int id);
    Task<byte[]> ExportAsync(GridifyQuery query);
}
