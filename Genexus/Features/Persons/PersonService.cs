using Gridify;
using Itrion.Api.Common;
using Itrion.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Itrion.Api.Features.Persons;

public class PersonService(ItrionDbContext db) : IPersonService {

    private readonly ItrionDbContext _db = db;

    public async Task<Paging<PersonResponse>> GetAllAsync(GridifyQuery query) {
        var page = query.Page < 1 ? 1 : query.Page;
        var size = query.PageSize < 1 ? 20 : query.PageSize;

        var q = _db.Persons.AsNoTracking()
            .ApplyFiltering(query.Filter)
            .ApplyOrdering(string.IsNullOrWhiteSpace(query.OrderBy) ? "id asc" : query.OrderBy);

        var count = await q.CountAsync();
        var items = await q.Skip((page - 1) * size).Take(size).ToListAsync();

        return new Paging<PersonResponse> {
            Count = count,
            Data = items.Select(e => new PersonResponse(e.Id, e.FirstName, e.LastName, e.Dni, e.Email)).ToList()
        };
    }

    public async Task<List<PersonResponse>> GetAllListAsync() {
        var items = await _db.Persons.AsNoTracking().OrderBy(e => e.Id).ToListAsync();
        return items.Select(e => new PersonResponse(e.Id, e.FirstName, e.LastName, e.Dni, e.Email)).ToList();
    }

    public async Task<PersonResponse?> GetByIdAsync(int id) {
        var entity = await _db.Persons.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        return entity is null ? null : new PersonResponse(entity.Id, entity.FirstName, entity.LastName, entity.Dni, entity.Email);
    }

    public async Task<PersonResponse> CreateAsync(PersonRequest request) {
        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName)) {
            throw new ValidationException("FirstName and LastName are required");
        }
        var entity = new Person { FirstName = request.FirstName, LastName = request.LastName, Dni = request.Dni, Email = request.Email };
        _db.Persons.Add(entity);
        await _db.SaveChangesAsync();
        return new PersonResponse(entity.Id, entity.FirstName, entity.LastName, entity.Dni, entity.Email);
    }

    public async Task<PersonResponse?> UpdateAsync(int id, PersonRequest request) {
        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName)) {
            throw new ValidationException("FirstName and LastName are required");
        }
        var entity = await _db.Persons.FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null) {
            return null;
        }
        entity.FirstName = request.FirstName;
        entity.LastName = request.LastName;
        entity.Dni = request.Dni;
        entity.Email = request.Email;
        await _db.SaveChangesAsync();
        return new PersonResponse(entity.Id, entity.FirstName, entity.LastName, entity.Dni, entity.Email);
    }

    public async Task<bool> DeleteByIdAsync(int id) {
        var entity = await _db.Persons.FirstOrDefaultAsync(e => e.Id == id);
        if (entity is null) {
            return false;
        }
        _db.Persons.Remove(entity);
        try {
            await _db.SaveChangesAsync();
        } catch (DbUpdateException) {
            throw new ConflictException("Person is referenced by equipment maintenances and cannot be deleted");
        }
        return true;
    }

}
