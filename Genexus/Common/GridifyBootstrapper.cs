using Gridify;
using Itrion.Api.Common;
using System.Reflection;

public static class GridifyBootstrapper {
    static GridifyBootstrapper() {
        GridifyGlobalConfiguration.CaseInsensitiveFiltering = true;
    }

    public static GridifyMapper<T> CreateMapper<T>() where T : class {
        var mapper = new GridifyMapper<T>();

        // Buscamos la clase de configuración (ej: ReadingsGridifyConfig)
        var configType = Assembly.GetExecutingAssembly().GetTypes()
            .FirstOrDefault(t => typeof(IGridifyConfig<T>).IsAssignableFrom(t) && !t.IsInterface);

        if (configType != null) {
            var config = (IGridifyConfig<T>)Activator.CreateInstance(configType)!;
            config.Configure(mapper);
        } else {
            mapper.GenerateMappings();
        }

        return mapper;
    }
}