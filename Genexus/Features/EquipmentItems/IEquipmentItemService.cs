using Gridify;
using Itrion.Api.Common;

namespace Itrion.Api.Features.EquipmentItems;

public interface IEquipmentItemService {

    Task<Paging<EquipmentItemResponse>> GetAllAsync(GridifyQuery query);

    Task<List<EquipmentItemResponse>> GetAllListAsync();

    Task<bool> UpdateStatusAsync(int id, int status);

    Task<EquipmentItemResponse?> GetByIdAsync(int id);

    Task<EquipmentItemResponse> CreateAsync(EquipmentItemRequest request);

    Task<EquipmentItemResponse?> UpdateAsync(int id, EquipmentItemRequest request);

    Task<bool> DeleteByIdAsync(int id);

}
