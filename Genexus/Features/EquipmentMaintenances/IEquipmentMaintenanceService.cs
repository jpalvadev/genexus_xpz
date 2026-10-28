using Gridify;
namespace Itrion.Api.Features.EquipmentMaintenances;
public interface IEquipmentMaintenanceService {
    Task<Paging<EquipmentMaintenanceResponse>> GetAllAsync(GridifyQuery query, bool isPaginated = true);
    Task<Paging<EquipmentMaintenanceResponse>> GetAllForChartsAsync(GridifyQuery query, bool isPaginated = false);
    Task<EquipmentMaintenanceResponse?> GetByIdAsync(int id);
    Task<EquipmentMaintenanceResponse> CreateAsync(EquipmentMaintenanceRequest request);
    Task<EquipmentMaintenanceResponse?> UpdateAsync(int id, EquipmentMaintenanceRequest request);
    Task<bool> DeleteByIdAsync(int id);
    Task<byte[]> ExportAsync(GridifyQuery query);
}
