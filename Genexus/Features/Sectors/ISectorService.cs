using Gridify;
using Itrion.Api.Common;

namespace Itrion.Api.Features.Sectors;

public interface ISectorService {

    Task<Paging<SectorResponse>> GetAllAsync(GridifyQuery query);

    Task<SectorResponse?> GetByIdAsync(int id);

    Task<SectorResponse> CreateAsync(SectorRequest request);

    Task<SectorResponse?> UpdateAsync(int id, SectorRequest request);

    Task<bool> DeleteByIdAsync(int id);

}
