using Itrion.Api.Common;
using Itrion.Api.Common.MasterCrud;
using Itrion.Api.Models;

namespace Itrion.Api.Features.ComboOptions;

/// <summary>
/// Combo Options' MasterCrud adapter (ADR-0004): the thin class crossing the unchanged
/// IComboOptionService seam onto the shared module. The catalog's quirks are adapter
/// config — flat-catalogue order (ComboKey → Order → Id), the comboKey-scoped feed,
/// the Id+ComboKey+Label+Order projection, the two-field validation copies and the
/// conflict copy. No per-entity branch in the module.
/// </summary>
public class ComboOptionService(ItrionDbContext db) : IComboOptionService {

    private static readonly MasterCrudConfig<ComboOption, ComboOptionRequest, ComboOptionResponse> Adapter = new() {
        Set = db => db.ComboOptions,
        DefaultOrder = "comboKey asc", // no gridify consumer today; adapter-required field
        ToResponse = c => new ComboOptionResponse(c.Id, c.ComboKey, c.Label, c.Order),
        NewEntity = r => new ComboOption { ComboKey = r.ComboKey, Label = r.Label, Order = r.Order },
        ApplyRequest = (c, r) => {
            c.ComboKey = r.ComboKey;
            c.Label = r.Label;
            c.Order = r.Order;
        },
        Validation = r => string.IsNullOrWhiteSpace(r.ComboKey) ? "ComboKey is required"
            : string.IsNullOrWhiteSpace(r.Label) ? "Label is required"
            : null,
        ConflictMessage = "Combo option is referenced by security observations and cannot be deleted",
        FlatOrder = q => q.OrderBy(c => c.ComboKey).ThenBy(c => c.Order).ThenBy(c => c.Id),
        KeyFeed = (q, key) => q.Where(c => c.ComboKey == key).OrderBy(c => c.Order).ThenBy(c => c.Id),
    };

    private readonly MasterCrud<ComboOption, ComboOptionRequest, ComboOptionResponse> _crud = new(db, Adapter);

    public Task<List<ComboOptionResponse>> GetAllAsync() => _crud.GetFlatAsync();

    public Task<List<ComboOptionResponse>> GetByKeyAsync(string comboKey) => _crud.GetByKeyAsync(comboKey);

    public Task<ComboOptionResponse?> GetByIdAsync(int id) => _crud.GetByIdAsync(id);

    public Task<ComboOptionResponse> CreateAsync(ComboOptionRequest request) => _crud.CreateAsync(request);

    public Task<ComboOptionResponse?> UpdateAsync(int id, ComboOptionRequest request) => _crud.UpdateAsync(id, request);

    public Task<bool> DeleteByIdAsync(int id) => _crud.DeleteByIdAsync(id);
}
