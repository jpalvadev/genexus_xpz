import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilters } from './useFilters';

let mockSearchFilters: Record<string, unknown> = {};
const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
    getRouteApi: vi.fn(() => ({
        useNavigate: () => mockNavigate,
        useSearch: () => mockSearchFilters,
    })),
}));

describe('useFilters hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchFilters = {};
    });

    it('retorna los filtros actuales expuestos por el router', () => {
        mockSearchFilters = { name: 'Lucas', status: 'active' };

        const { result } = renderHook(() => useFilters('/' as any));

        expect(result.current.filters).toEqual({
            name: 'Lucas',
            status: 'active',
        });
    });

    it('setFilters realiza el merge con los filtros existentes y limpia campos vacíos', () => {
        mockSearchFilters = { name: 'Lucas', category: 'admin', pageIndex: 3 };

        const { result } = renderHook(() => useFilters('/' as any));

        act(() => {
            result.current.setFilters({
                name: '', // debe eliminarse por estar vacío
                category: 'operator', // debe actualizarse
                age: 30, // nuevo filtro
            } as any);
        });

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith({
            search: {
                category: 'operator',
                age: 30,
                pageIndex: 3,
            },
        });
    });

    it('resetFilters llama a navigate con un objeto de búsqueda vacío', () => {
        mockSearchFilters = { name: 'Lucas', status: 'active' };

        const { result } = renderHook(() => useFilters('/' as any));

        act(() => {
            result.current.resetFilters();
        });

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith({ search: {} });
    });
});

