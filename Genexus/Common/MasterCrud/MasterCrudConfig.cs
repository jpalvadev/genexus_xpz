using Gridify;
using Itrion.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Itrion.Api.Common.MasterCrud;

/// <summary>
/// Adapter contract for a backend Master catalog (ADR-0004): everything a catalog
/// contributes to <see cref="MasterCrud{TEntity,TRequest,TResponse}"/> — entity set,
/// default order, response projection, request↔entity mapping, validation copy and
/// conflict copy — as data. The flat-feed extras are declared only by catalogs that
/// have a flat catalogue (Combo Options); the module body never branches per entity.
/// </summary>
public sealed record MasterCrudConfig<TEntity, TRequest, TResponse>
    where TEntity : class, new() {

    public required Func<ItrionDbContext, DbSet<TEntity>> Set { get; init; }

    /// <summary>Gridify default order when the request carries none (e.g. "name asc").</summary>
    public required string DefaultOrder { get; init; }

    public required Func<TEntity, TResponse> ToResponse { get; init; }

    public required Func<TRequest, TEntity> NewEntity { get; init; }

    public required Action<TEntity, TRequest> ApplyRequest { get; init; }

    /// <summary>Returns the verbatim 400 copy for an invalid request, or null when valid.</summary>
    public required Func<TRequest, string?> Validation { get; init; }

    /// <summary>Verbatim 409 copy raised when a delete hits the FK conflict.</summary>
    public required string ConflictMessage { get; init; }

    /// <summary>Order of the flat catalogue feed (no paging, no gridify).</summary>
    public Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? FlatOrder { get; init; }

    /// <summary>Filter-by-key + order of a key-scoped feed.</summary>
    public Func<IQueryable<TEntity>, string, IOrderedQueryable<TEntity>>? KeyFeed { get; init; }
}
