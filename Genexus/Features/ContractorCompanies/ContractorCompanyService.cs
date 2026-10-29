using Gridify;
using Itrion.Api.Common;
using Itrion.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Itrion.Api.Features.ContractorCompanies;

public class ContractorCompanyService(ItrionDbContext db) : IContractorCompanyService {

    private readonly ItrionDbContext _db = db;

    public async Task<Paging<ContractorCompanyResponse>> GetAllAsync(GridifyQuery query) {
        var page = query.Page < 1 ? 1 : query.Page;
        var size = query.PageSize < 1 ? 20 : query.PageSize;

        var q = _db.ContractorCompanies.AsNoTracking()
            .ApplyFiltering(query.Filter)
            .ApplyOrdering(string.IsNullOrWhiteSpace(query.OrderBy) ? "name asc" : query.OrderBy);

        var count = await q.CountAsync();
        var items = await q.Skip((page - 1) * size).Take(size).ToListAsync();

        return new Paging<ContractorCompanyResponse> {
            Count = count,
            Data = items.Select(e => new ContractorCompanyResponse(e.Id, e.Name)).ToList()
        };
    }

    public async Task<ContractorCompanyResponse?> GetByIdAsync(int id) {
        var entity = await _db.ContractorCompanies.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        return entity is null ? null : new ContractorCompanyResponse(entity.Id, entity.Name);
    }

    public async Task<ContractorCompanyResponse> CreateAsync(ContractorCompanyRequest request) {
        if (string.IsNullOrWhiteSpace(request.Name)) {
            throw new ValidationException("Name is required");
        }
        var entity = new ContractorCompany { Name = request.Name };
        _db.ContractorCompanies.Add(entity);
        await _db.SaveChangesAsync();
        return new ContractorCompanyResponse(entity.Id, entity.Name);
    }

    public async Task<ContractorCompanyResponse?> UpdateAsync(int id, ContractorCompanyRequest request) {
        if (string.IsNullOrWhiteSpace(request.Name)) {
            throw new ValidationException("Name is required");
        }
        var entity = await _db.ContractorCompanies.FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null) {
            return null;
        }
        entity.Name = request.Name;
        await _db.SaveChangesAsync();
        return new ContractorCompanyResponse(entity.Id, entity.Name);
    }

    public async Task<bool> DeleteByIdAsync(int id) {
        var entity = await _db.ContractorCompanies.FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null) {
            return false;
        }
        _db.ContractorCompanies.Remove(entity);
        try {
            await _db.SaveChangesAsync();
        } catch (DbUpdateException) {
            throw new ConflictException("ContractorCompany is referenced by security observations and cannot be deleted");
        }
        return true;
    }

}
