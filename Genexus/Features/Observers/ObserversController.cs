using Gridify;
using Itrion.Api.Common;
using Microsoft.AspNetCore.Mvc;

namespace Itrion.Api.Features.Observers;

[ApiController]
[Route("api/v1/observers")]
public class ObserversController(IObserverService service) : ControllerBase {

    private readonly IObserverService _service = service;

    [HttpGet]
    public async Task<ActionResult<Paging<ObserverResponse>>> GetAll([FromQuery] GridifyQuery query) {
        return Ok(await _service.GetAllAsync(query));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ObserverResponse>> GetById(int id) {
        var response = await _service.GetByIdAsync(id);
        if (response is null) {
            return NotFound(new ErrorResponse("Observador no encontrado"));
        }
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<ObserverResponse>> Create([FromBody] ObserverRequest request) {
        var response = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ObserverRequest request) {
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
