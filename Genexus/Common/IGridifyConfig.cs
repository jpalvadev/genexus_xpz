using Gridify;

namespace Itrion.Api.Common;
public interface IGridifyConfig<T> where T : class {
    void Configure(GridifyMapper<T> mapper);
}

