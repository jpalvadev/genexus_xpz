using Gridify;
using Itrion.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Itrion.Api.Common.MasterCrud;

/// <summary>
/// The deep module behind the per-catalog Master services (ADR-0004): the CRUD
/// semantics every Master record shares, implemented once — paging clamp
/// (Page &lt; 1 → 1, PageSize &lt; 1 → 20), Gridify filtering/ordering with the
/// adapter's default order, count + skip/take into the {count, data} envelope,
/// as-no-tracking reads / tracked writes, the NotFound contract, DbUpdateException →
/// 409 with the adapter's copy, and the validation hook → 400. Per-entity deltas
/// arrive only through <see cref="MasterCrudConfig{TEntity,TRequest,TResponse}"/>;
/// this body contains no per-entity branches.
/// </summary>
public sealed class MasterCrud<TEntity, TRequest, TResponse>
    where TEntity : class, new()
    where TResponse : class {

    private readonly ItrionDbContext _db;
    private readonly MasterCrudConfig<TEntity, TRequest, TResponse> _adapter;

    public MasterCrud(ItrionDbContext db, MasterCrudConfig<TEntity, TRequest, TResponse> adapter) {
        _db = db;
        _adapter = adapter;
    }

    public async Task<Paging<TResponse>> GetAllAsync(GridifyQuery query) {
        var page = query.Page < 1 ? 1 : query.Page;
        var size = query.PageSize < 1 ? 20 : query.PageSize;

        var q = _adapter.Set(_db).AsNoTracking()
            .ApplyFiltering(query.Filter)
            .ApplyOrdering(string.IsNullOrWhiteSpace(query.OrderBy) ? _adapter.DefaultOrder : query.OrderBy);

        var count = await q.CountAsync();
        var items = await q.Skip((page - 1) * size).Take(size).ToListAsync();

        return new Paging<TResponse> {
            Count = count,
            Data = items.Select(_adapter.ToResponse).ToList()
        };
    }

    /// <summary>Flat catalogue feed: every record, adapter-declared order, no paging.</summary>
    public async Task<List<TResponse>> GetFlatAsync() {
        var flatOrder = _adapter.FlatOrder
            ?? throw new InvalidOperationException("This catalog declares no flat feed.");
        var items = await flatOrder(_adapter.Set(_db).AsNoTracking()).ToListAsync();
        return items.Select(_adapter.ToResponse).ToList();
    }

    /// <summary>Key-scoped feed: records of one key, adapter-declared filter and order.</summary>
    public async Task<List<TResponse>> GetByKeyAsync(string key) {
        var keyFeed = _adapter.KeyFeed
            ?? throw new InvalidOperationException("This catalog declares no key-scoped feed.");
        var items = await keyFeed(_adapter.Set(_db).AsNoTracking(), key).ToListAsync();
        return items.Select(_adapter.ToResponse).ToList();
    }

    public async Task<TResponse?> GetByIdAsync(int id) {
        var entity = await _adapter.Set(_db).AsNoTracking()
            .FirstOrDefaultAsync(e => EF.Property<int>(e, "Id") == id);
        return entity is null ? null : _adapter.ToResponse(entity);
    }

    public async Task<TResponse> CreateAsync(TRequest request) {
        var error = _adapter.Validation(request);
        if (error is not null) {
            throw new ValidationException(error);
        }
        var entity = _adapter.NewEntity(request);
        _adapter.Set(_db).Add(entity);
        await _db.SaveChangesAsync();
        return _adapter.ToResponse(entity);
    }

    public async Task<TResponse?> UpdateAsync(int id, TRequest request) {
        var error = _adapter.Validation(request);
        if (error is not null) {
            throw new ValidationException(error);
        }
        var entity = await _adapter.Set(_db).FirstOrDefaultAsync(e => EF.Property<int>(e, "Id") == id);
        if (entity is null) {
            return null;
        }
        _adapter.ApplyRequest(entity, request);
        await _db.SaveChangesAsync();
        return _adapter.ToResponse(entity);
    }

    public async Task<bool> DeleteByIdAsync(int id) {
        var set = _adapter.Set(_db);
        var entity = await set.FirstOrDefaultAsync(e => EF.Property<int>(e, "Id") == id);
        if (entity is null) {
            return false;
        }
        set.Remove(entity);
        try {
            await _db.SaveChangesAsync();
        } catch (DbUpdateException) {
            throw new ConflictException(_adapter.ConflictMessage);
        }
        return true;
    }
}
