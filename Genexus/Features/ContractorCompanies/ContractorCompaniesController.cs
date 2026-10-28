using Gridify;
using Itrion.Api.Common;
using Microsoft.AspNetCore.Mvc;

namespace Itrion.Api.Features.ContractorCompanies;

[ApiController]
[Route("api/v1/contractor-companies")]
public class ContractorCompaniesController(IContractorCompanyService service) : ControllerBase {

    private readonly IContractorCompanyService _service = service;

    [HttpGet]
    public async Task<ActionResult<Paging<ContractorCompanyResponse>>> GetAll([FromQuery] GridifyQuery query) {
        return Ok(await _service.GetAllAsync(query));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ContractorCompanyResponse>> GetById(int id) {
        var response = await _service.GetByIdAsync(id);
        if (response is null) {
            return NotFound(new ErrorResponse("ContractorCompany not found"));
        }
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<ContractorCompanyResponse>> Create([FromBody] ContractorCompanyRequest request) {
        var response = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ContractorCompanyRequest request) {
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
