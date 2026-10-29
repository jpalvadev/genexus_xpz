using Gridify;
using Itrion.Api.Common.MasterCrud;
using Microsoft.AspNetCore.Mvc;

namespace Itrion.Api.Features.Sectors;

/// <summary>
/// Sectors controller: route + typed binding onto the shared MasterCrud controller
/// base (ADR-0004). All six verbs' status codes, copy and envelopes live once in
/// <see cref="MasterCrudControllerBase{TResponse,TRequest}"/>.
/// </summary>
[ApiController]
[Route("api/v1/sectors")]
public class SectorsController(ISectorService service) : MasterCrudControllerBase<SectorResponse, SectorRequest> {

    private readonly ISectorService _service = service;

    protected override Task<Paging<SectorResponse>> ListAsync(GridifyQuery query) => _service.GetAllAsync(query);

    protected override Task<SectorResponse?> GetAsync(int id) => _service.GetByIdAsync(id);

    protected override Task<SectorResponse> CreateAsync(SectorRequest request) => _service.CreateAsync(request);

    protected override Task<SectorResponse?> UpdateAsync(int id, SectorRequest request) => _service.UpdateAsync(id, request);

    protected override Task<bool> DeleteAsync(int id) => _service.DeleteByIdAsync(id);

    protected override string NotFoundMessage => "Sector not found";

    protected override int IdOf(SectorResponse response) => response.Id;

    [HttpGet]
    public Task<IActionResult> GetAll([FromQuery] GridifyQuery query) => ListResultAsync(query);

    [HttpGet("{id:int}")]
    public override Task<IActionResult> GetById(int id) => GetResultAsync(id);

    [HttpPost]
    public Task<IActionResult> Create([FromBody] SectorRequest request) => CreateResultAsync(request);

    [HttpPut("{id:int}")]
    public Task<IActionResult> Update(int id, [FromBody] SectorRequest request) => UpdateResultAsync(id, request);

    [HttpDelete("{id:int}")]
    public Task<IActionResult> Delete(int id) => DeleteResultAsync(id);
}
