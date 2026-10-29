using Itrion.Api.Common.MasterCrud;
using Microsoft.AspNetCore.Mvc;

namespace Itrion.Api.Features.ComboOptions;

/// <summary>
/// Combo Options controller (ADR-0004): the shared MasterCrud verbs ride the base
/// (route + typed binding only); the catalog's two list endpoints — the flat GET
/// and the comboKey-scoped feed — are its declared extras, with the int-constrained
/// id route preserved (GET {id:int} wins over GET {comboKey} on numeric segments).
/// </summary>
[ApiController]
[Route("api/v1/combo-options")]
public class ComboOptionsController(IComboOptionService service) : MasterCrudControllerBase<ComboOptionResponse, ComboOptionRequest> {

    private readonly IComboOptionService _service = service;

    protected override Task<ComboOptionResponse?> GetAsync(int id) => _service.GetByIdAsync(id);

    protected override Task<ComboOptionResponse> CreateAsync(ComboOptionRequest request) => _service.CreateAsync(request);

    protected override Task<ComboOptionResponse?> UpdateAsync(int id, ComboOptionRequest request) => _service.UpdateAsync(id, request);

    protected override Task<bool> DeleteAsync(int id) => _service.DeleteByIdAsync(id);

    protected override string NotFoundMessage => "Opción de combo no encontrada";

    protected override int IdOf(ComboOptionResponse response) => response.Id;

    [HttpGet]
    public async Task<ActionResult<List<ComboOptionResponse>>> GetAll() {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{comboKey}")]
    public async Task<ActionResult<List<ComboOptionResponse>>> GetByKey(string comboKey) {
        return Ok(await _service.GetByKeyAsync(comboKey));
    }

    [HttpGet("{id:int}")]
    public override Task<IActionResult> GetById(int id) => GetResultAsync(id);

    [HttpPost]
    public Task<IActionResult> Create([FromBody] ComboOptionRequest request) => CreateResultAsync(request);

    [HttpPut("{id:int}")]
    public Task<IActionResult> Update(int id, [FromBody] ComboOptionRequest request) => UpdateResultAsync(id, request);

    [HttpDelete("{id:int}")]
    public Task<IActionResult> Delete(int id) => DeleteResultAsync(id);
}
