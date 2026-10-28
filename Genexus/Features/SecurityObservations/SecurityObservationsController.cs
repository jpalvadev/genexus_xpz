using Gridify;
using Itrion.Api.Common;
using Microsoft.AspNetCore.Mvc;

namespace Itrion.Api.Features.SecurityObservations;

[ApiController]
[Route("api/v1/security-observations")]
public class SecurityObservationsController : ControllerBase {

    private readonly ISecurityObservationService _securityObservationService;

    public SecurityObservationsController(ISecurityObservationService securityObservationService) {
        _securityObservationService = securityObservationService;
    }

    [HttpGet]
    public async Task<ActionResult<Paging<SecurityObservationResponse>>> GetAll([FromQuery] GridifyQuery query) {
        var response = await _securityObservationService.GetAllAsync(query);
        return Ok(response);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SecurityObservationResponse>> GetById(int id) {
        var response = await _securityObservationService.GetByIdAsync(id);
        if (response is null) {
            return NotFound(new ErrorResponse("Security Observation not found"));
        }
        return Ok(response);
    }

    [HttpGet("export-excel")]
    public async Task<IActionResult> Export([FromQuery] GridifyQuery query) {
        var fileBytes = await _securityObservationService.ExportAsync(query);
        return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "security-observations.xlsx");
    }

    [HttpPost]
    public async Task<ActionResult<SecurityObservationResponse>> Create([FromBody] SecurityObservationRequest request) {
        var (response, error) = await _securityObservationService.CreateAsync(request);
        if (error is not null) {
            return BadRequest(new ErrorResponse(error));
        }
        return CreatedAtAction(nameof(GetById), new { id = response!.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SecurityObservationRequest request) {
        var (response, error) = await _securityObservationService.UpdateAsync(id, request);
        if (error is not null) {
            return BadRequest(new ErrorResponse(error));
        }
        if (response is null) {
            return NotFound(new ErrorResponse("Security Observation not found"));
        }
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteById(int id) {
        if (!await _securityObservationService.DeleteByIdAsync(id)) {
            return NotFound(new ErrorResponse("Security Observation not found"));
        }
        return NoContent();
    }
}
