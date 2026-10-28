using Itrion.Api.Common;
using Microsoft.EntityFrameworkCore;
using Itrion.Api.Models;

namespace Itrion.Api.Features.ComboOptions;

public class ComboOptionService(ItrionDbContext db) : IComboOptionService {

    private readonly ItrionDbContext _db = db;

    public async Task<List<ComboOptionResponse>> GetAllAsync() {
        var items = await _db.ComboOptions.AsNoTracking()
            .OrderBy(c => c.ComboKey).ThenBy(c => c.Order).ThenBy(c => c.Id)
            .ToListAsync();
        return items.Select(ToResponse).ToList();
    }

    public async Task<List<ComboOptionResponse>> GetByKeyAsync(string comboKey) {
        var items = await _db.ComboOptions.AsNoTracking()
            .Where(c => c.ComboKey == comboKey)
            .OrderBy(c => c.Order).ThenBy(c => c.Id)
            .ToListAsync();
        return items.Select(ToResponse).ToList();
    }

    public async Task<ComboOptionResponse?> GetByIdAsync(int id) {
        var entity = await _db.ComboOptions.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        return entity is null ? null : ToResponse(entity);
    }

    public async Task<ComboOptionResponse> CreateAsync(ComboOptionRequest request) {
        Validate(request);
        var entity = new ComboOption { ComboKey = request.ComboKey, Label = request.Label, Order = request.Order };
        _db.ComboOptions.Add(entity);
        await _db.SaveChangesAsync();
        return ToResponse(entity);
    }

    public async Task<ComboOptionResponse?> UpdateAsync(int id, ComboOptionRequest request) {
        Validate(request);
        var entity = await _db.ComboOptions.FirstOrDefaultAsync(c => c.Id == id);
        if (entity is null) {
            return null;
        }
        entity.ComboKey = request.ComboKey;
        entity.Label = request.Label;
        entity.Order = request.Order;
        await _db.SaveChangesAsync();
        return ToResponse(entity);
    }

    public async Task<bool> DeleteByIdAsync(int id) {
        var entity = await _db.ComboOptions.FirstOrDefaultAsync(c => c.Id == id);
        if (entity is null) {
            return false;
        }
        _db.ComboOptions.Remove(entity);
        try {
            await _db.SaveChangesAsync();
        } catch (DbUpdateException) {
            throw new ConflictException("Combo option is referenced by security observations and cannot be deleted");
        }
        return true;
    }

    private static void Validate(ComboOptionRequest request) {
        if (string.IsNullOrWhiteSpace(request.ComboKey)) {
            throw new ValidationException("ComboKey is required");
        }
        if (string.IsNullOrWhiteSpace(request.Label)) {
            throw new ValidationException("Label is required");
        }
    }

    private static ComboOptionResponse ToResponse(ComboOption c) =>
        new(c.Id, c.ComboKey, c.Label, c.Order);

}
