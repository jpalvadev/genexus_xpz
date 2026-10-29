using Gridify;
using Itrion.Api.Common.MasterCrud;
using Microsoft.AspNetCore.Mvc;

namespace Itrion.Api.Features.ContractorCompanies;

/// <summary>
/// Contractor Companies controller: route + typed binding onto the shared MasterCrud
/// controller base (ADR-0004). All six verbs' status codes, copy and envelopes live
/// once in <see cref="MasterCrudControllerBase{TResponse,TRequest}"/>.
/// </summary>
[ApiController]
[Route("api/v1/contractor-companies")]
public class ContractorCompaniesController(IContractorCompanyService service) : MasterCrudControllerBase<ContractorCompanyResponse, ContractorCompanyRequest> {

    private readonly IContractorCompanyService _service = service;

    protected override Task<Paging<ContractorCompanyResponse>> ListAsync(GridifyQuery query) => _service.GetAllAsync(query);

    protected override Task<ContractorCompanyResponse?> GetAsync(int id) => _service.GetByIdAsync(id);

    protected override Task<ContractorCompanyResponse> CreateAsync(ContractorCompanyRequest request) => _service.CreateAsync(request);

    protected override Task<ContractorCompanyResponse?> UpdateAsync(int id, ContractorCompanyRequest request) => _service.UpdateAsync(id, request);

    protected override Task<bool> DeleteAsync(int id) => _service.DeleteByIdAsync(id);

    protected override string NotFoundMessage => "ContractorCompany not found";

    protected override int IdOf(ContractorCompanyResponse response) => response.Id;

    [HttpGet]
    public Task<IActionResult> GetAll([FromQuery] GridifyQuery query) => ListResultAsync(query);

    [HttpGet("{id:int}")]
    public override Task<IActionResult> GetById(int id) => GetResultAsync(id);

    [HttpPost]
    public Task<IActionResult> Create([FromBody] ContractorCompanyRequest request) => CreateResultAsync(request);

    [HttpPut("{id:int}")]
    public Task<IActionResult> Update(int id, [FromBody] ContractorCompanyRequest request) => UpdateResultAsync(id, request);

    [HttpDelete("{id:int}")]
    public Task<IActionResult> Delete(int id) => DeleteResultAsync(id);
}
