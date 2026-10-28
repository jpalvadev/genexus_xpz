using Gridify;
using Itrion.Api.Common;
using Itrion.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Itrion.Api.Features.Sectors;

public class SectorService(ItrionDbContext db) : ISectorService {

    private readonly ItrionDbContext _db = db;

    public async Task<Paging<SectorResponse>> GetAllAsync(GridifyQuery query) {
        var page = query.Page < 1 ? 1 : query.Page;
        var size = query.PageSize < 1 ? 20 : query.PageSize;

        var q = _db.Sectors.AsNoTracking()
            .ApplyFiltering(query.Filter)
            .ApplyOrdering(string.IsNullOrWhiteSpace(query.OrderBy) ? "name asc" : query.OrderBy);

        var count = await q.CountAsync();
        var items = await q.Skip((page - 1) * size).Take(size).ToListAsync();

        return new Paging<SectorResponse> {
            Count = count,
            Data = items.Select(e => new SectorResponse(e.Id, e.Name)).ToList()
        };
    }

    public async Task<SectorResponse?> GetByIdAsync(int id) {
        var entity = await _db.Sectors.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        return entity is null ? null : new SectorResponse(entity.Id, entity.Name);
    }

    public async Task<SectorResponse> CreateAsync(SectorRequest request) {
        if (string.IsNullOrWhiteSpace(request.Name)) {
            throw new ValidationException("Name is required");
        }
        var entity = new Sector { Name = request.Name };
        _db.Sectors.Add(entity);
        await _db.SaveChangesAsync();
        return new SectorResponse(entity.Id, entity.Name);
    }

    public async Task<SectorResponse?> UpdateAsync(int id, SectorRequest request) {
        if (string.IsNullOrWhiteSpace(request.Name)) {
            throw new ValidationException("Name is required");
        }
        var entity = await _db.Sectors.FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null) {
            return null;
        }
        entity.Name = request.Name;
        await _db.SaveChangesAsync();
        return new SectorResponse(entity.Id, entity.Name);
    }

    public async Task<bool> DeleteByIdAsync(int id) {
        var entity = await _db.Sectors.FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null) {
            return false;
        }
        _db.Sectors.Remove(entity);
        try {
            await _db.SaveChangesAsync();
        } catch (DbUpdateException) {
            throw new ConflictException("Sector is referenced by security observations and cannot be deleted");
        }
        return true;
    }

}
