using Gridify;
using Itrion.Api.Common;

namespace Itrion.Api.Features.ContractorCompanies;

public interface IContractorCompanyService {

    Task<Paging<ContractorCompanyResponse>> GetAllAsync(GridifyQuery query);

    Task<ContractorCompanyResponse?> GetByIdAsync(int id);

    Task<ContractorCompanyResponse> CreateAsync(ContractorCompanyRequest request);

    Task<ContractorCompanyResponse?> UpdateAsync(int id, ContractorCompanyRequest request);

    Task<bool> DeleteByIdAsync(int id);

}
