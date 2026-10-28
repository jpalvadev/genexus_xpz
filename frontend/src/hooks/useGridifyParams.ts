/**
 * useGridifyParams
 *
 * Hook que actúa como bridge entre los query params de TanStack Router
 * y el formato que espera la API de Gridify.
 *
 * Responsabilidades:
 *  1. Leer los search params del router (paginación, sorting, filtros)
 *  2. Exponerlos como estado tipado para la tabla
 *  3. Proveer callbacks para mutar el estado → el router actualiza la URL
 *  4. Derivar el objeto `GridifyQuery` listo para mandárselo al fetch
 */

import { useCallback } from 'react';
import {
    type NavigateFn,
    useNavigate,
    useSearch,
} from '@tanstack/react-router';
import { type PaginationState, type SortingState } from '@tanstack/react-table';

import {
    DEFAULT_PAGE_INDEX,
    DEFAULT_PAGE_SIZE,
} from '@/components/GenericTable';
import {
    type GridifyQuery,
    type FilterVariant,
    type Operator,
    upsertFilter,
} from '@/utils/gridifyFilter';
import { stateToSortBy, sortByToState } from '@/utils/tableSortMapper';
import { cleanEmptyParams } from '@/utils/cleanEmptyParams';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Forma mínima que deben tener los search params de la ruta para que el hook funcione.
 * Extendés esto en tu ruta con los filtros específicos del dominio.
 *
 * Ejemplo en el router:
 *   export const Route = createFileRoute('/users')({
 *     validateSearch: zodValidator(z.object({
 *       ...gridifySearchSchema,
 *       name: z.string().optional(),
 *       roleId: z.number().optional(),
 *     }))
 *   })
 */
export type GridifySearchParams = {
    pageIndex?: number;
    pageSize?: number;
    orderBy?: string;
    filter?: string;
};

type UseGridifyParamsReturn = {
    /** Estado de paginación para TanStack Table */
    pagination: PaginationState;
    /** Estado de sorting para TanStack Table */
    sorting: SortingState;
    /** El filter string crudo de la URL */
    filter: string | undefined;
    /** true cuando hay al menos un filtro activo — útil para mostrar/ocultar el botón de reset */
    hasActiveFilters: boolean;

    /** Cambia página o pageSize */
    onPaginationChange: (
        updater: PaginationState | ((prev: PaginationState) => PaginationState),
    ) => void;
    /** Cambia el sorting */
    onSortingChange: (
        updater: SortingState | ((prev: SortingState) => SortingState),
    ) => void;
    /** Inserta o actualiza un campo en el filter string.
     *  - `variant` determina si se usa LIKE o exacto (default: 'text')
     *  - `operator` para campos de fecha/número con comparación (default: '=')
     *  - Pasar `value = ''` elimina el campo.
     */
    onFilterChange: (
        field: string,
        value: string,
        options?: { variant?: FilterVariant; operator?: Operator },
    ) => void;
    /** Borra todos los filtros activos y vuelve a la primera página */
    onResetFilters: () => void;
    /**
     * Merge genérico de cualquier clave de los search params.
     * Para filtros de dominio (roleId, status, etc.) que viven fuera del filter string.
     */
    onSearchChange: (
        partial: Partial<GridifySearchParams & Record<string, unknown>>,
    ) => void;

    /** Objeto listo para pasarle al fetch de Gridify */
    gridifyQuery: GridifyQuery;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGridifyParams(): UseGridifyParamsReturn {
    const navigate = useNavigate();
    const search = useSearch({ strict: false }) as GridifySearchParams &
        Record<string, unknown>;

    // ── Derived state ──────────────────────────────────────────────────────

    const pagination: PaginationState = {
        pageIndex: search.pageIndex ?? DEFAULT_PAGE_INDEX,
        pageSize: search.pageSize ?? DEFAULT_PAGE_SIZE,
    };

    // const sorting: SortingState = sortByToState(search.orderBy);

    const sorting: SortingState = sortByToState(
        search.orderBy as `${string} asc` | `${string} desc` | undefined,
    );

    const hasActiveFilters = Boolean(search.filter);

    // ── Navigate helper ────────────────────────────────────────────────────

    const mergeSearch = useCallback(
        (partial: Record<string, unknown>) => {
            navigate({
                search: (prev) =>
                    cleanEmptyParams({
                        ...prev,
                        ...partial,
                    }),
            } as Parameters<NavigateFn>[0]);
        },
        [navigate],
    );

    // ── Callbacks ──────────────────────────────────────────────────────────

    const onPaginationChange = useCallback(
        (
            updater:
                | PaginationState
                | ((prev: PaginationState) => PaginationState),
        ) => {
            const next =
                typeof updater === 'function' ? updater(pagination) : updater;
            mergeSearch({ pageIndex: next.pageIndex, pageSize: next.pageSize });
        },
        [pagination, mergeSearch],
    );

    const onSortingChange = useCallback(
        (updater: SortingState | ((prev: SortingState) => SortingState)) => {
            const next =
                typeof updater === 'function' ? updater(sorting) : updater;
            mergeSearch({
                orderBy: stateToSortBy(next),
                // Al cambiar el sort volvemos a la primera página
                pageIndex: DEFAULT_PAGE_INDEX,
            });
        },
        [sorting, mergeSearch],
    );

    const onFilterChange = useCallback(
        (
            field: string,
            value: string,
            options?: { variant?: FilterVariant; operator?: Operator },
        ) => {
            const nextFilter = upsertFilter(
                search.filter,
                field,
                value,
                options,
            );
            mergeSearch({
                filter: nextFilter,
                pageIndex: DEFAULT_PAGE_INDEX,
            });
        },
        [search.filter, mergeSearch],
    );

    const onResetFilters = useCallback(() => {
        mergeSearch({ filter: undefined, pageIndex: DEFAULT_PAGE_INDEX });
    }, [mergeSearch]);

    const onSearchChange = useCallback(
        (partial: Partial<GridifySearchParams & Record<string, unknown>>) => {
            mergeSearch({ ...partial, pageIndex: DEFAULT_PAGE_INDEX });
        },
        [mergeSearch],
    );

    // ── Gridify query ──────────────────────────────────────────────────────

    const gridifyQuery: GridifyQuery = {
        Page: pagination.pageIndex + 1, // Gridify es 1-indexed
        PageSize: pagination.pageSize,
        ...(search.orderBy ? { OrderBy: search.orderBy } : {}),
        ...(search.filter ? { Filter: search.filter } : {}),
    };

    return {
        pagination,
        sorting,
        filter: search.filter,
        hasActiveFilters,
        onPaginationChange,
        onSortingChange,
        onFilterChange,
        onResetFilters,
        onSearchChange,
        gridifyQuery,
    };
}
