using Itrion.Api.Common;
using Microsoft.AspNetCore.Mvc;

namespace Itrion.Api.Features.ComboOptions;

[ApiController]
[Route("api/v1/combo-options")]
public class ComboOptionsController(IComboOptionService service) : ControllerBase {

    private readonly IComboOptionService _service = service;

    [HttpGet]
    public async Task<ActionResult<List<ComboOptionResponse>>> GetAll() {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{comboKey}")]
    public async Task<ActionResult<List<ComboOptionResponse>>> GetByKey(string comboKey) {
        return Ok(await _service.GetByKeyAsync(comboKey));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ComboOptionResponse>> GetById(int id) {
        var response = await _service.GetByIdAsync(id);
        if (response is null) {
            return NotFound(new ErrorResponse("Combo option not found"));
        }
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<ComboOptionResponse>> Create([FromBody] ComboOptionRequest request) {
        var response = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ComboOptionRequest request) {
        var response = await _service.UpdateAsync(id, request);
        if (response is null) {
            return NotFound();
        }
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) {
        if (!await _service.DeleteByIdAsync(id)) {
            return NotFound();
        }
        return NoContent();
    }

}
