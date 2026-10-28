using Gridify;
using Itrion.Api.Common;
using Itrion.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Itrion.Api.Features.Plants;

public class PlantService(ItrionDbContext db) : IPlantService {

    private readonly ItrionDbContext _db = db;

    public async Task<Paging<PlantResponse>> GetAllAsync(GridifyQuery query) {
        var page = query.Page < 1 ? 1 : query.Page;
        var size = query.PageSize < 1 ? 20 : query.PageSize;

        var q = _db.Plants.AsNoTracking()
            .ApplyFiltering(query.Filter)
            .ApplyOrdering(string.IsNullOrWhiteSpace(query.OrderBy) ? "name asc" : query.OrderBy);

        var count = await q.CountAsync();
        var items = await q.Skip((page - 1) * size).Take(size).ToListAsync();

        return new Paging<PlantResponse> {
            Count = count,
            Data = items.Select(e => new PlantResponse(e.Id, e.Name)).ToList()
        };
    }

    public async Task<PlantResponse?> GetByIdAsync(int id) {
        var entity = await _db.Plants.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        return entity is null ? null : new PlantResponse(entity.Id, entity.Name);
    }

    public async Task<PlantResponse> CreateAsync(PlantRequest request) {
        if (string.IsNullOrWhiteSpace(request.Name)) {
            throw new ValidationException("Name is required");
        }
        var entity = new Plant { Name = request.Name };
        _db.Plants.Add(entity);
        await _db.SaveChangesAsync();
        return new PlantResponse(entity.Id, entity.Name);
    }

    public async Task<PlantResponse?> UpdateAsync(int id, PlantRequest request) {
        if (string.IsNullOrWhiteSpace(request.Name)) {
            throw new ValidationException("Name is required");
        }
        var entity = await _db.Plants.FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null) {
            return null;
        }
        entity.Name = request.Name;
        await _db.SaveChangesAsync();
        return new PlantResponse(entity.Id, entity.Name);
    }

    public async Task<bool> DeleteByIdAsync(int id) {
        var entity = await _db.Plants.FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null) {
            return false;
        }
        _db.Plants.Remove(entity);
        try {
            await _db.SaveChangesAsync();
        } catch (DbUpdateException) {
            throw new ConflictException("Plant is referenced by security observations and cannot be deleted");
        }
        return true;
    }

}
