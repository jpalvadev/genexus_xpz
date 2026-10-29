using Gridify;
using Itrion.Api.Common.MasterCrud;
using Microsoft.AspNetCore.Mvc;

namespace Itrion.Api.Features.Plants;

/// <summary>
/// Plants controller: route + typed binding onto the shared MasterCrud controller
/// base (ADR-0004). All six verbs' status codes, copy and envelopes live once in
/// <see cref="MasterCrudControllerBase{TResponse,TRequest}"/>.
/// </summary>
[ApiController]
[Route("api/v1/plants")]
public class PlantsController(IPlantService service) : MasterCrudControllerBase<PlantResponse, PlantRequest> {

    private readonly IPlantService _service = service;

    protected override Task<Paging<PlantResponse>> ListAsync(GridifyQuery query) => _service.GetAllAsync(query);

    protected override Task<PlantResponse?> GetAsync(int id) => _service.GetByIdAsync(id);

    protected override Task<PlantResponse> CreateAsync(PlantRequest request) => _service.CreateAsync(request);

    protected override Task<PlantResponse?> UpdateAsync(int id, PlantRequest request) => _service.UpdateAsync(id, request);

    protected override Task<bool> DeleteAsync(int id) => _service.DeleteByIdAsync(id);

    protected override string NotFoundMessage => "Planta no encontrada";

    protected override int IdOf(PlantResponse response) => response.Id;

    [HttpGet]
    public Task<IActionResult> GetAll([FromQuery] GridifyQuery query) => ListResultAsync(query);

    [HttpGet("{id:int}")]
    public override Task<IActionResult> GetById(int id) => GetResultAsync(id);

    [HttpPost]
    public Task<IActionResult> Create([FromBody] PlantRequest request) => CreateResultAsync(request);

    [HttpPut("{id:int}")]
    public Task<IActionResult> Update(int id, [FromBody] PlantRequest request) => UpdateResultAsync(id, request);

    [HttpDelete("{id:int}")]
    public Task<IActionResult> Delete(int id) => DeleteResultAsync(id);
}
