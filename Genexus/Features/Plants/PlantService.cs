using Gridify;
using Itrion.Api.Common;
using Itrion.Api.Common.MasterCrud;
using Itrion.Api.Models;

namespace Itrion.Api.Features.Plants;

/// <summary>
/// Plants' MasterCrud adapter (ADR-0004): the thin class crossing the unchanged
/// IPlantService seam onto the shared module. The adapter is config — entity set,
/// default order, Id+Name projection, validation copy, conflict copy — and nothing
/// that is not Plants-specific.
/// </summary>
public class PlantService(ItrionDbContext db) : IPlantService {

    private static readonly MasterCrudConfig<Plant, PlantRequest, PlantResponse> Adapter = new() {
        Set = db => db.Plants,
        DefaultOrder = "name asc",
        ToResponse = e => new PlantResponse(e.Id, e.Name),
        NewEntity = r => new Plant { Name = r.Name },
        ApplyRequest = (e, r) => e.Name = r.Name,
        Validation = r => string.IsNullOrWhiteSpace(r.Name) ? "Name is required" : null,
        ConflictMessage = "Plant is referenced by security observations and cannot be deleted",
    };

    private readonly MasterCrud<Plant, PlantRequest, PlantResponse> _crud = new(db, Adapter);

    public Task<Paging<PlantResponse>> GetAllAsync(GridifyQuery query) => _crud.GetAllAsync(query);

    public Task<PlantResponse?> GetByIdAsync(int id) => _crud.GetByIdAsync(id);

    public Task<PlantResponse> CreateAsync(PlantRequest request) => _crud.CreateAsync(request);

    public Task<PlantResponse?> UpdateAsync(int id, PlantRequest request) => _crud.UpdateAsync(id, request);

    public Task<bool> DeleteByIdAsync(int id) => _crud.DeleteByIdAsync(id);
}
