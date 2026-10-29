using Gridify;
using Microsoft.AspNetCore.Mvc;

namespace Itrion.Api.Common.MasterCrud;

/// <summary>
/// Shared controller semantics for the six Master CRUD verbs (ADR-0004): the
/// 200 envelopes, the 404 <see cref="Common.ErrorResponse"/> copy, the 201
/// CreatedAtAction location and the 204 NoContent bodies live here once. Each
/// catalog's controller keeps only its route and its typed binding to the
/// (unchanged) service interface; its action methods are one-liners onto the
/// helpers below. The GET-by-id action must be named "GetById" — that is the
/// <see cref="ControllerBase.CreatedAtAction(string, object, object)"/>
/// location target, enforced by the abstract declaration.
/// </summary>
public abstract class MasterCrudControllerBase<TResponse, TRequest> : ControllerBase
    where TResponse : class
    where TRequest : class {

    /// <summary>Gridify list — the capability of the gridify catalogs. Flat catalogs
    /// (Combo Options) expose no gridify route, so this default marks the capability absent.</summary>
    protected virtual Task<Paging<TResponse>> ListAsync(GridifyQuery query) =>
        throw new InvalidOperationException("This catalog exposes no gridify list endpoint.");

    protected abstract Task<TResponse?> GetAsync(int id);
    protected abstract Task<TResponse> CreateAsync(TRequest request);
    protected abstract Task<TResponse?> UpdateAsync(int id, TRequest request);
    protected abstract Task<bool> DeleteAsync(int id);

    /// <summary>Verbatim copy of the 404 body for a missing get-by-id.</summary>
    protected abstract string NotFoundMessage { get; }

    /// <summary>Id of a created response — the {id} of the CreatedAtAction location.</summary>
    protected abstract int IdOf(TResponse response);

    /// <summary>The GET-by-id action every catalog declares (route + binding), named for CreatedAtAction.</summary>
    public abstract Task<IActionResult> GetById(int id);

    protected async Task<IActionResult> ListResultAsync(GridifyQuery query) =>
        Ok(await ListAsync(query));

    protected async Task<IActionResult> GetResultAsync(int id) {
        var response = await GetAsync(id);
        if (response is null) {
            return NotFound(new ErrorResponse(NotFoundMessage));
        }
        return Ok(response);
    }

    protected async Task<IActionResult> CreateResultAsync(TRequest request) {
        var response = await CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = IdOf(response) }, response);
    }

    protected async Task<IActionResult> UpdateResultAsync(int id, TRequest request) {
        var response = await UpdateAsync(id, request);
        if (response is null) {
            return NotFound();
        }
        return NoContent();
    }

    protected async Task<IActionResult> DeleteResultAsync(int id) {
        if (!await DeleteAsync(id)) {
            return NotFound();
        }
        return NoContent();
    }
}
