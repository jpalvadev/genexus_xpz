import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGridifyParams } from './useGridifyParams';
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/components/GenericTable';

let mockSearch: Record<string, unknown> = {};
const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
    useNavigate: () => mockNavigate,
    useSearch: () => mockSearch,
}));

describe('useGridifyParams hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSearch = {};
    });

    it('devuelve valores por defecto cuando no hay search params', () => {
        const { result } = renderHook(() => useGridifyParams());

        expect(result.current.pagination).toEqual({
            pageIndex: DEFAULT_PAGE_INDEX,
            pageSize: DEFAULT_PAGE_SIZE,
        });
        expect(result.current.sorting).toEqual([]);
        expect(result.current.filter).toBeUndefined();
        expect(result.current.hasActiveFilters).toBe(false);
        expect(result.current.gridifyQuery).toEqual({
            Page: 1, // 0-indexed + 1
            PageSize: DEFAULT_PAGE_SIZE,
        });
    });

    it('deriva la paginación, sorting y filtros correctamente desde los search params', () => {
        mockSearch = {
            pageIndex: 2,
            pageSize: 25,
            orderBy: 'name desc',
            filter: 'status = active',
        };

        const { result } = renderHook(() => useGridifyParams());

        expect(result.current.pagination).toEqual({
            pageIndex: 2,
            pageSize: 25,
        });
        expect(result.current.sorting).toEqual([{ id: 'name', desc: true }]);
        expect(result.current.filter).toBe('status = active');
        expect(result.current.hasActiveFilters).toBe(true);
        expect(result.current.gridifyQuery).toEqual({
            Page: 3, // pageIndex 2 -> Page 3 en Gridify
            PageSize: 25,
            OrderBy: 'name desc',
            Filter: 'status = active',
        });
    });

    it('onPaginationChange llama a navigate con los nuevos valores de página y pageSize', () => {
        const { result } = renderHook(() => useGridifyParams());

        act(() => {
            result.current.onPaginationChange({ pageIndex: 3, pageSize: 50 });
        });

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        const navArg = mockNavigate.mock.calls[0][0];
        expect(navArg).toHaveProperty('search');

        // Ejecutamos la función de búsqueda para verificar la transformación
        const nextSearch = navArg.search({ someExistingParam: 'foo' });
        expect(nextSearch).toEqual({
            someExistingParam: 'foo',
            pageIndex: 3,
            pageSize: 50,
        });
    });

    it('onSortingChange actualiza orderBy y resetea pageIndex al inicio (limpiado por cleanEmptyParams)', () => {
        const { result } = renderHook(() => useGridifyParams());

        act(() => {
            result.current.onSortingChange([{ id: 'createdAt', desc: false }]);
        });

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        const navArg = mockNavigate.mock.calls[0][0];
        // Si veníamos de la página 3, el reset a 0 hace que cleanEmptyParams elimine pageIndex
        const nextSearch = navArg.search({ pageIndex: 3 });
        expect(nextSearch.orderBy).toBe('createdAt asc');
        expect(nextSearch.pageIndex).toBeUndefined();
    });

    it('onFilterChange agrega un filtro y resetea la página', () => {
        mockSearch = { filter: 'type=1', pageIndex: 2 };
        const { result } = renderHook(() => useGridifyParams());

        act(() => {
            result.current.onFilterChange('name', 'Sensor');
        });

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        const navArg = mockNavigate.mock.calls[0][0];
        const nextSearch = navArg.search({ pageIndex: 2 });
        // upsertFilter agrega el nuevo filtro con isLike por defecto (variant: 'string')
        expect(nextSearch.pageIndex).toBeUndefined();
        expect(nextSearch.filter).toBe('type=1,name=*Sensor');
    });

    it('onResetFilters elimina el filtro y resetea la página', () => {
        mockSearch = { filter: 'status = active', pageIndex: 4 };
        const { result } = renderHook(() => useGridifyParams());

        act(() => {
            result.current.onResetFilters();
        });

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        const navArg = mockNavigate.mock.calls[0][0];
        const nextSearch = navArg.search({ filter: 'status = active', pageIndex: 4 });
        expect(nextSearch.filter).toBeUndefined();
        expect(nextSearch.pageIndex).toBeUndefined();
    });

    it('onSearchChange mergea propiedades adicionales y resetea pageIndex', () => {
        const { result } = renderHook(() => useGridifyParams());

        act(() => {
            result.current.onSearchChange({ tenantId: 'tenant-123' });
        });

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        const navArg = mockNavigate.mock.calls[0][0];
        const nextSearch = navArg.search({ pageIndex: 5 });
        expect(nextSearch.tenantId).toBe('tenant-123');
        expect(nextSearch.pageIndex).toBeUndefined();
    });
});
