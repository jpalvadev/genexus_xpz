using Gridify;
using Itrion.Api.Common;
using Itrion.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Itrion.Api.Features.Observers;

public class ObserverService(ItrionDbContext db) : IObserverService {

    private readonly ItrionDbContext _db = db;

    public async Task<Paging<ObserverResponse>> GetAllAsync(GridifyQuery query) {
        var page = query.Page < 1 ? 1 : query.Page;
        var size = query.PageSize < 1 ? 20 : query.PageSize;

        var q = _db.Observers.AsNoTracking()
            .Include(o => o.Plants)
            .ApplyFiltering(query.Filter)
            .ApplyOrdering(string.IsNullOrWhiteSpace(query.OrderBy) ? "legajo asc" : query.OrderBy);

        var count = await q.CountAsync();
        var items = await q.Skip((page - 1) * size).Take(size).ToListAsync();

        return new Paging<ObserverResponse> {
            Count = count,
            Data = items.Select(ToResponse).ToList()
        };
    }

    public async Task<ObserverResponse?> GetByIdAsync(int id) {
        var entity = await _db.Observers.AsNoTracking()
            .Include(o => o.Plants)
            .FirstOrDefaultAsync(o => o.Id == id);
        return entity is null ? null : ToResponse(entity);
    }

    public async Task<ObserverResponse> CreateAsync(ObserverRequest request) {
        Validate(request);
        if (await _db.Observers.AnyAsync(o => o.Legajo == request.Legajo)) {
            throw new ValidationException("El legajo ya existe");
        }
        var entity = new Observer {
            Legajo = request.Legajo,
            FullName = request.FullName,
            Objective = request.Objective,
            Post = request.Post,
            Active = request.Active
        };
        await ApplyPlantsAsync(entity, request.PlantIds);
        _db.Observers.Add(entity);
        await _db.SaveChangesAsync();
        return ToResponse(entity);
    }

    public async Task<ObserverResponse?> UpdateAsync(int id, ObserverRequest request) {
        Validate(request);
        if (await _db.Observers.AnyAsync(o => o.Legajo == request.Legajo && o.Id != id)) {
            throw new ValidationException("El legajo ya existe");
        }
        var entity = await _db.Observers
            .Include(o => o.Plants)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (entity is null) {
            return null;
        }
        entity.Legajo = request.Legajo;
        entity.FullName = request.FullName;
        entity.Objective = request.Objective;
        entity.Post = request.Post;
        entity.Active = request.Active;
        await ApplyPlantsAsync(entity, request.PlantIds);
        await _db.SaveChangesAsync();
        return ToResponse(entity);
    }

    public async Task<bool> DeleteByIdAsync(int id) {
        var entity = await _db.Observers.FirstOrDefaultAsync(o => o.Id == id);
        if (entity is null) {
            return false;
        }
        _db.Observers.Remove(entity);
        try {
            await _db.SaveChangesAsync();
        } catch (DbUpdateException) {
            throw new ConflictException("El observador está referenciado por observaciones de seguridad y no puede eliminarse");
        }
        return true;
    }

    private static void Validate(ObserverRequest request) {
        if (string.IsNullOrWhiteSpace(request.FullName)) {
            throw new ValidationException("Nombre completo es obligatorio");
        }
        if (string.IsNullOrWhiteSpace(request.Objective)) {
            throw new ValidationException("Objetivo es obligatorio");
        }
    }

    private async Task ApplyPlantsAsync(Observer entity, List<int>? plantIds) {
        plantIds ??= [];
        var distinctIds = plantIds.Distinct().ToList();
        var existing = await _db.Plants.Where(p => distinctIds.Contains(p.Id)).Select(p => p.Id).ToListAsync();
        if (existing.Count != distinctIds.Count) {
            throw new ValidationException("Uno o más ids de Planta no existen");
        }
        _db.ObserverPlantAssignments.RemoveRange(entity.Plants);
        entity.Plants = distinctIds.Select(pid => new ObserverPlantAssignment { PlantId = pid }).ToList();
    }

    private static ObserverResponse ToResponse(Observer o) =>
        new(o.Id, o.Legajo, o.FullName, o.Objective, o.Post, o.Active, o.Plants.Select(p => p.PlantId).ToList());

}
