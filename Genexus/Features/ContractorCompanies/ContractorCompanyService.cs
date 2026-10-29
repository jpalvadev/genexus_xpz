using Gridify;
using Itrion.Api.Common;
using Itrion.Api.Common.MasterCrud;
using Itrion.Api.Models;

namespace Itrion.Api.Features.ContractorCompanies;

/// <summary>
/// Contractor Companies' MasterCrud adapter (ADR-0004): the thin class crossing the
/// unchanged IContractorCompanyService seam onto the shared module. The adapter is
/// config — entity set, default order, Id+Name projection, validation copy, conflict
/// copy — and nothing that is not ContractorCompany-specific.
/// </summary>
public class ContractorCompanyService(ItrionDbContext db) : IContractorCompanyService {

    private static readonly MasterCrudConfig<ContractorCompany, ContractorCompanyRequest, ContractorCompanyResponse> Adapter = new() {
        Set = db => db.ContractorCompanies,
        DefaultOrder = "name asc",
        ToResponse = e => new ContractorCompanyResponse(e.Id, e.Name),
        NewEntity = r => new ContractorCompany { Name = r.Name },
        ApplyRequest = (e, r) => e.Name = r.Name,
        Validation = r => string.IsNullOrWhiteSpace(r.Name) ? "Nombre es obligatorio" : null,
        ConflictMessage = "La empresa está referenciada por observaciones de seguridad y no puede eliminarse",
    };

    private readonly MasterCrud<ContractorCompany, ContractorCompanyRequest, ContractorCompanyResponse> _crud = new(db, Adapter);

    public Task<Paging<ContractorCompanyResponse>> GetAllAsync(GridifyQuery query) => _crud.GetAllAsync(query);

    public Task<ContractorCompanyResponse?> GetByIdAsync(int id) => _crud.GetByIdAsync(id);

    public Task<ContractorCompanyResponse> CreateAsync(ContractorCompanyRequest request) => _crud.CreateAsync(request);

    public Task<ContractorCompanyResponse?> UpdateAsync(int id, ContractorCompanyRequest request) => _crud.UpdateAsync(id, request);

    public Task<bool> DeleteByIdAsync(int id) => _crud.DeleteByIdAsync(id);
}
