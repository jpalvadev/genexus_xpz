namespace Itrion.Api.Features.ComboOptions;

public interface IComboOptionService {

    Task<List<ComboOptionResponse>> GetAllAsync();

    Task<List<ComboOptionResponse>> GetByKeyAsync(string comboKey);

    Task<ComboOptionResponse?> GetByIdAsync(int id);

    Task<ComboOptionResponse> CreateAsync(ComboOptionRequest request);

    Task<ComboOptionResponse?> UpdateAsync(int id, ComboOptionRequest request);

    Task<bool> DeleteByIdAsync(int id);

}
