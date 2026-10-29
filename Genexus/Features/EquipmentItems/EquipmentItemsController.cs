using Gridify;
using Itrion.Api.Common;
using Microsoft.AspNetCore.Mvc;

namespace Itrion.Api.Features.EquipmentItems;

[ApiController]
[Route("api/v1/equipment-items")]
public class EquipmentItemsController(IEquipmentItemService service) : ControllerBase {

    private readonly IEquipmentItemService _service = service;

    [HttpGet]
    public async Task<ActionResult<Paging<EquipmentItemResponse>>> GetAll([FromQuery] GridifyQuery query) {
        return Ok(await _service.GetAllAsync(query));
    }

    [HttpGet("all")]
    public async Task<ActionResult<List<EquipmentItemResponse>>> GetAllList() {
        return Ok(await _service.GetAllListAsync());
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] int status) {
        if (!await _service.UpdateStatusAsync(id, status)) {
            return NotFound(new ErrorResponse("Ítem de equipo no encontrado"));
        }
        return NoContent();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EquipmentItemResponse>> GetById(int id) {
        var response = await _service.GetByIdAsync(id);
        if (response is null) {
            return NotFound(new ErrorResponse("Ítem de equipo no encontrado"));
        }
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<EquipmentItemResponse>> Create([FromBody] EquipmentItemRequest request) {
        var response = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] EquipmentItemRequest request) {
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
