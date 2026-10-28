// Importamos una utilidad que limpia parámetros vacíos de un objeto
// Por ejemplo: { name: '', age: 25, city: null } -> { age: 25 }
import { cleanEmptyParams } from '@/utils/cleanEmptyParams';

// Importamos tipos y funciones de TanStack Router para manejar rutas y navegación
import {
    getRouteApi, // Función para obtener la API de una ruta específica
    type RegisteredRouter, // Tipo que representa el router registrado en la app
    type RouteIds, // Tipo que contiene todos los IDs de rutas disponibles
    type SearchParamOptions, // Tipo para opciones de parámetros de búsqueda
} from '@tanstack/react-router';

/**
 * Hook personalizado para manejar filtros en tablas que se sincronizan con la URL
 *
 * ¿Qué hace este hook?
 * - Lee los filtros actuales desde la URL (ej: /users?name=john&age=25)
 * - Permite actualizar esos filtros y automáticamente actualiza la URL
 * - Permite resetear todos los filtros
 * - Mantiene el estado de filtros sincronizado entre la tabla y la URL del navegador
 *
 * ¿Por qué es útil?
 * - Los filtros persisten al recargar la página
 * - Se pueden compartir URLs con filtros aplicados
 * - El botón "atrás" del navegador funciona con los filtros
 * - Estado centralizado de filtros para toda la aplicación
 */
export function useFilters<
    // TId: El tipo del ID de la ruta (ej: '/users', '/products')
    TId extends RouteIds<RegisteredRouter['routeTree']>,
    // TSearchParams: El tipo de los parámetros de búsqueda para esa ruta específica
    // Por ejemplo: { name?: string, age?: number, pageIndex?: number }
    TSearchParams extends SearchParamOptions<
        RegisteredRouter,
        TId,
        TId
    >['search'],
>(routeId: TId) {
    // Obtenemos la API específica de la ruta que nos interesa
    // Por ejemplo, si routeId es '/users', obtenemos la API para manejar esa ruta
    const routeApi = getRouteApi<TId>(routeId);

    // Obtenemos la función de navegación para poder cambiar la URL programáticamente
    const navigate = routeApi.useNavigate();

    // Obtenemos los parámetros de búsqueda actuales de la URL
    // Si la URL es /users?name=john&age=25, filters será { name: 'john', age: 25 }
    const filters = routeApi.useSearch();

    /**
     * Función para actualizar filtros parcialmente
     *
     * Ejemplo de uso:
     * setFilters({ name: 'john' }) // Actualiza solo el nombre, mantiene otros filtros
     * setFilters({ age: 30 })     // Actualiza solo la edad, mantiene otros filtros
     *
     * ¿Qué hace internamente?
     * 1. Combina los filtros actuales con los nuevos usando spread operator
     * 2. Limpia parámetros vacíos (elimina '', null, undefined)
     * 3. Navega a la misma ruta pero con los nuevos parámetros de búsqueda
     */
    const setFilters = (partialFilters: Partial<TSearchParams>) =>
        navigate({
            search: cleanEmptyParams({
                ...filters, // Filtros actuales: { name: 'john', age: 25 }
                ...partialFilters, // Nuevos filtros: { age: 30 }
                // Resultado: { name: 'john', age: 30 }
            }) as TSearchParams,
        });

    /**
     * Función para resetear todos los filtros
     *
     * Ejemplo: Si la URL era /users?name=john&age=25&pageIndex=2
     * Después del reset será: /users
     *
     * Útil para el botón "Limpiar filtros" en las tablas
     */
    const resetFilters = () => navigate({ search: {} as TSearchParams });

    // Retornamos las tres cosas que necesita cualquier componente que use filtros:
    return {
        filters, // Los filtros actuales leídos de la URL
        setFilters, // Función para actualizar filtros
        resetFilters, // Función para limpiar todos los filtros
    };
}
