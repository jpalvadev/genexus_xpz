using Gridify;
using Itrion.Api.Common;

namespace Itrion.Api.Features.Observers;

public interface IObserverService {

    Task<Paging<ObserverResponse>> GetAllAsync(GridifyQuery query);

    Task<ObserverResponse?> GetByIdAsync(int id);

    Task<ObserverResponse> CreateAsync(ObserverRequest request);

    Task<ObserverResponse?> UpdateAsync(int id, ObserverRequest request);

    Task<bool> DeleteByIdAsync(int id);

}
