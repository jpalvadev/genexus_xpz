using Gridify;
using Itrion.Api.Common;
using Microsoft.AspNetCore.Mvc;

namespace Itrion.Api.Features.Persons;

[ApiController]
[Route("api/v1/persons")]
public class PersonsController(IPersonService service) : ControllerBase {

    private readonly IPersonService _service = service;

    [HttpGet]
    public async Task<ActionResult<Paging<PersonResponse>>> GetAll([FromQuery] GridifyQuery query) {
        return Ok(await _service.GetAllAsync(query));
    }

    [HttpGet("all")]
    public async Task<ActionResult<List<PersonResponse>>> GetAllList() {
        return Ok(await _service.GetAllListAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PersonResponse>> GetById(int id) {
        var response = await _service.GetByIdAsync(id);
        if (response is null) {
            return NotFound(new ErrorResponse("Persona no encontrada"));
        }
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<PersonResponse>> Create([FromBody] PersonRequest request) {
        var response = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] PersonRequest request) {
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
