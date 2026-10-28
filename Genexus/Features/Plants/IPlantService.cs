using Gridify;
using Itrion.Api.Common;

namespace Itrion.Api.Features.Plants;

public interface IPlantService {

    Task<Paging<PlantResponse>> GetAllAsync(GridifyQuery query);

    Task<PlantResponse?> GetByIdAsync(int id);

    Task<PlantResponse> CreateAsync(PlantRequest request);

    Task<PlantResponse?> UpdateAsync(int id, PlantRequest request);

    Task<bool> DeleteByIdAsync(int id);

}
