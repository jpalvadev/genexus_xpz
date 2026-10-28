//using Microsoft.EntityFrameworkCore;
//using System.Reflection;

//namespace Itrion.Api.Common;

//public static class IQueryableExtensions {
//    public static async Task<IQueryable<T>> PaginateAndFilter<T>(
//        this IQueryable<T> queryable,
//        PaginationAndFilterDto paginationDto,
//        HttpContext httpContext) {
//        var queryParams = httpContext.Request.Query;
//        var ignore = new[] { "pageIndex", "pageSize", "sortBy" };

//        // filtros dinámicos por reflection
//        foreach (var param in queryParams) {
//            if (ignore.Contains(param.Key, StringComparer.OrdinalIgnoreCase)) continue;

//            var filterValue = param.Value.ToString();
//            if (string.IsNullOrWhiteSpace(filterValue)) continue;

//            var property = typeof(T).GetProperty(param.Key,
//                BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

//            if (property is null) continue;

//            var realName = property.Name;

//            if (property.PropertyType == typeof(string))
//                queryable = queryable.Where(x => EF.Property<string>(x!, realName).Contains(filterValue));
//            else
//                queryable = queryable.Where(x => EF.Property<object>(x!, realName).ToString() == filterValue);
//        }

//        // count después del filter, va en el header
//        var count = await queryable.CountAsync();
//        httpContext.Response.Headers.Append("total-records-count", count.ToString());

//        // sorting
//        if (!string.IsNullOrEmpty(paginationDto.SortBy)) {
//            var parts = paginationDto.SortBy.Split('.');
//            var property = typeof(T).GetProperty(parts[0],
//                BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

//            if (property is not null) {
//                var realName = property.Name;
//                bool desc = parts.Length > 1 && parts[1].ToLower() == "desc";

//                queryable = desc
//                    ? queryable.OrderByDescending(x => EF.Property<object>(x!, realName))
//                    : queryable.OrderBy(x => EF.Property<object>(x!, realName));
//            }
//        }

//        // paginación
//        return queryable
//            .Skip(paginationDto.PageIndex * paginationDto.PageSize)
//            .Take(paginationDto.PageSize);
//    }
//}

using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace Itrion.Api.Common;

public static class IQueryableExtensions {
    public static async Task<IQueryable<T>> PaginateAndFilter<T>(
        this IQueryable<T> queryable,
        PaginationAndFilterDto paginationDto,
        HttpContext httpContext) {
        // obtenemos todos los query params de la URL
        // ejemplo: ?temperature=18&createdAt.from=2026-03-17&createdAt.to=2026-04-19&pageIndex=0
        var queryParams = httpContext.Request.Query;

        // estos params los manejamos por separado, no como filtros dinámicos
        var ignore = new[] { "pageIndex", "pageSize", "sortBy" };

        // --- FILTRO DE FECHAS CON RANGO ---
        // buscamos si hay algún param que termine en ".from" o ".to"
        // ejemplo: "createdAt.from" o "createdAt.to"
        var fromKey = queryParams.Keys.FirstOrDefault(k =>
            k.EndsWith(".from", StringComparison.OrdinalIgnoreCase));
        var toKey = queryParams.Keys.FirstOrDefault(k =>
            k.EndsWith(".to", StringComparison.OrdinalIgnoreCase));

        if (fromKey != null || toKey != null) {
            // extraemos el nombre de la propiedad antes del punto
            // "createdAt.from" -> "createdAt"
            var propName = (fromKey ?? toKey)!.Split('.')[0];

            // buscamos si esa propiedad existe en la entidad T
            var dateProperty = typeof(T).GetProperty(propName,
                BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

            // solo aplicamos el filtro si la propiedad existe y es DateTime
            if (dateProperty != null && dateProperty.PropertyType == typeof(DateTime)) {
                var realName = dateProperty.Name;

                // si hay "from" — traer registros desde esa fecha inclusive
                // ejemplo: createdAt.from=2026-03-17 -> WHERE created_at >= '2026-03-17'
                if (fromKey != null && DateTime.TryParse(queryParams[fromKey], out var from)) {
                    // Forzamos a que sea UTC para que Postgres no proteste con error Cannot write DateTime with Kind=Unspecified
                    var fromUtc = DateTime.SpecifyKind(from, DateTimeKind.Utc);
                    queryable = queryable.Where(x => EF.Property<DateTime>(x!, realName) >= fromUtc);
                }

                // si hay "to" — traer registros hasta esa fecha inclusive
                // sumamos 1 día para incluir todo el día seleccionado
                // ejemplo: createdAt.to=2026-04-19 -> WHERE created_at <= '2026-04-20'
                if (toKey != null && DateTime.TryParse(queryParams[toKey], out var to)) {
                    var toUtc = DateTime.SpecifyKind(to.AddDays(1), DateTimeKind.Utc);
                    queryable = queryable.Where(x => EF.Property<DateTime>(x!, realName) <= toUtc);

                }
            }
        }

        // --- FILTROS DINÁMICOS POR REFLECTION ---
        // iteramos todos los query params que no sean de paginación ni de fecha
        foreach (var param in queryParams) {
            // ignoramos los params de paginación y sorting
            if (ignore.Contains(param.Key, StringComparer.OrdinalIgnoreCase)) continue;

            // ignoramos los params de fecha que ya manejamos arriba
            if (param.Key.EndsWith(".from", StringComparison.OrdinalIgnoreCase) ||
                param.Key.EndsWith(".to", StringComparison.OrdinalIgnoreCase)) continue;

            var filterValue = param.Value.ToString();
            if (string.IsNullOrWhiteSpace(filterValue)) continue;

            // buscamos si el param corresponde a una propiedad de la entidad T
            // BindingFlags.IgnoreCase permite que "temperature" matchee "Temperature"
            var property = typeof(T).GetProperty(param.Key,
                BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

            // si el param no corresponde a ninguna propiedad, lo ignoramos
            if (property is null) continue;

            // usamos el nombre real de la propiedad con el casing correcto
            var realName = property.Name;

            // para strings aplicamos Contains (búsqueda parcial)
            // ejemplo: temperature=18 -> WHERE temperature LIKE '%18%'
            if (property.PropertyType == typeof(string))
                queryable = queryable.Where(x => EF.Property<string>(x!, realName).Contains(filterValue));
            else
                // para números y otros tipos aplicamos igualdad exacta
                // ejemplo: temperature=18 -> WHERE temperature = 18
                queryable = queryable.Where(x => EF.Property<object>(x!, realName).ToString() == filterValue);
        }

        // --- COUNT ---
        // contamos después de aplicar todos los filtros para que el total sea correcto
        // este número va en el header de la response para que el front sepa cuántas páginas hay
        var count = await queryable.CountAsync();
        httpContext.Response.Headers.Append("total-records-count", count.ToString());

        // --- SORTING ---
        // el sortBy viene como "createdAt.desc" o "temperature.asc"
        if (!string.IsNullOrEmpty(paginationDto.SortBy)) {
            // separamos el nombre de la propiedad y la dirección
            // "createdAt.desc" -> ["createdAt", "desc"]
            var parts = paginationDto.SortBy.Split('.');
            var property = typeof(T).GetProperty(parts[0],
                BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

            if (property is not null) {
                var realName = property.Name;
                bool desc = parts.Length > 1 && parts[1].ToLower() == "desc";

                queryable = desc
                    ? queryable.OrderByDescending(x => EF.Property<object>(x!, realName))
                    : queryable.OrderBy(x => EF.Property<object>(x!, realName));
            }
        }

        // --- PAGINACIÓN ---
        // Skip salta los registros de las páginas anteriores
        // Take toma solo los registros de la página actual
        // ejemplo: pageIndex=2, pageSize=10 -> saltamos 20, tomamos 10
        return queryable
            .Skip(paginationDto.PageIndex * paginationDto.PageSize)
            .Take(paginationDto.PageSize);
    }
}