using Gridify;
using Itrion.Api.Common;
using Itrion.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Itrion.Api.Features.EquipmentItems;

public class EquipmentItemService(ItrionDbContext db) : IEquipmentItemService {

    private readonly ItrionDbContext _db = db;

    public async Task<Paging<EquipmentItemResponse>> GetAllAsync(GridifyQuery query) {
        var page = query.Page < 1 ? 1 : query.Page;
        var size = query.PageSize < 1 ? 20 : query.PageSize;

        var q = _db.EquipmentItems.AsNoTracking()
            .ApplyFiltering(query.Filter)
            .ApplyOrdering(string.IsNullOrWhiteSpace(query.OrderBy) ? "id asc" : query.OrderBy);

        var count = await q.CountAsync();
        var items = await q.Skip((page - 1) * size).Take(size).ToListAsync();

        return new Paging<EquipmentItemResponse> {
            Count = count,
            Data = items.Select(e => new EquipmentItemResponse(e.Id, e.Name, e.Code, (int)e.Status)).ToList()
        };
    }

    public async Task<List<EquipmentItemResponse>> GetAllListAsync() {
        var items = await _db.EquipmentItems.AsNoTracking().OrderBy(e => e.Id).ToListAsync();
        return items.Select(e => new EquipmentItemResponse(e.Id, e.Name, e.Code, (int)e.Status)).ToList();
    }

    public async Task<bool> UpdateStatusAsync(int id, int status) {
        var entity = await _db.EquipmentItems.FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null) {
            return false;
        }
        if (!Enum.IsDefined(typeof(EquipmentItemStatus), status)) {
            throw new ValidationException("Estado de ítem de equipo inválido");
        }
        entity.Status = (EquipmentItemStatus)status;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<EquipmentItemResponse?> GetByIdAsync(int id) {
        var entity = await _db.EquipmentItems.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        return entity is null ? null : new EquipmentItemResponse(entity.Id, entity.Name, entity.Code, (int)entity.Status);
    }

    public async Task<EquipmentItemResponse> CreateAsync(EquipmentItemRequest request) {
        if (string.IsNullOrWhiteSpace(request.Name)) {
            throw new ValidationException("Nombre es obligatorio");
        }
        var entity = new EquipmentItem { Name = request.Name, Code = request.Code, Status = (EquipmentItemStatus)request.Status };
        _db.EquipmentItems.Add(entity);
        await _db.SaveChangesAsync();
        return new EquipmentItemResponse(entity.Id, entity.Name, entity.Code, (int)entity.Status);
    }

    public async Task<EquipmentItemResponse?> UpdateAsync(int id, EquipmentItemRequest request) {
        if (string.IsNullOrWhiteSpace(request.Name)) {
            throw new ValidationException("Nombre es obligatorio");
        }
        var entity = await _db.EquipmentItems.FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null) {
            return null;
        }
        entity.Name = request.Name;
        entity.Code = request.Code;
        entity.Status = (EquipmentItemStatus)request.Status;
        await _db.SaveChangesAsync();
        return new EquipmentItemResponse(entity.Id, entity.Name, entity.Code, (int)entity.Status);
    }

    public async Task<bool> DeleteByIdAsync(int id) {
        var entity = await _db.EquipmentItems.FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null) {
            return false;
        }
        _db.EquipmentItems.Remove(entity);
        try {
            await _db.SaveChangesAsync();
        } catch (DbUpdateException) {
            throw new ConflictException("El ítem de equipo está referenciado por mantenimientos de equipos y no puede eliminarse");
        }
        return true;
    }

}
