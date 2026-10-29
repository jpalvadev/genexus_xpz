using Gridify;
using Itrion.Api.Common;
using Itrion.Api.Common.MasterCrud;
using Itrion.Api.Models;

namespace Itrion.Api.Features.Sectors;

/// <summary>
/// Sectors' MasterCrud adapter (ADR-0004): the thin class crossing the unchanged
/// ISectorService seam onto the shared module. The adapter is config — entity set,
/// default order, Id+Name projection, validation copy, conflict copy — and nothing
/// that is not Sectors-specific.
/// </summary>
public class SectorService(ItrionDbContext db) : ISectorService {

    private static readonly MasterCrudConfig<Sector, SectorRequest, SectorResponse> Adapter = new() {
        Set = db => db.Sectors,
        DefaultOrder = "name asc",
        ToResponse = e => new SectorResponse(e.Id, e.Name),
        NewEntity = r => new Sector { Name = r.Name },
        ApplyRequest = (e, r) => e.Name = r.Name,
        Validation = r => string.IsNullOrWhiteSpace(r.Name) ? "Nombre es obligatorio" : null,
        ConflictMessage = "El sector está referenciado por observaciones de seguridad y no puede eliminarse",
    };

    private readonly MasterCrud<Sector, SectorRequest, SectorResponse> _crud = new(db, Adapter);

    public Task<Paging<SectorResponse>> GetAllAsync(GridifyQuery query) => _crud.GetAllAsync(query);

    public Task<SectorResponse?> GetByIdAsync(int id) => _crud.GetByIdAsync(id);

    public Task<SectorResponse> CreateAsync(SectorRequest request) => _crud.CreateAsync(request);

    public Task<SectorResponse?> UpdateAsync(int id, SectorRequest request) => _crud.UpdateAsync(id, request);

    public Task<bool> DeleteByIdAsync(int id) => _crud.DeleteByIdAsync(id);
}
