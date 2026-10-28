using Gridify;
using Itrion.Api.Common;

namespace Itrion.Api.Features.Persons;

public interface IPersonService {

    Task<Paging<PersonResponse>> GetAllAsync(GridifyQuery query);

    Task<List<PersonResponse>> GetAllListAsync();

    Task<PersonResponse?> GetByIdAsync(int id);

    Task<PersonResponse> CreateAsync(PersonRequest request);

    Task<PersonResponse?> UpdateAsync(int id, PersonRequest request);

    Task<bool> DeleteByIdAsync(int id);

}
