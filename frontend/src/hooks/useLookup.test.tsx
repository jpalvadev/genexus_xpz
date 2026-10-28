import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { useLookup } from './useLookup';

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    };
}

describe('useLookup hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('llama a fetchFn con pageSize por defecto (20) y sin filtro si searchValue está vacío', async () => {
        const fetchFn = vi.fn().mockResolvedValue({
            data: [
                { id: 1, name: 'Sector Norte' },
                { id: 2, name: 'Sector Sur' },
            ],
            rowCount: 2,
        });

        const wrapper = createWrapper();
        const { result } = renderHook(
            () =>
                useLookup(
                    'test-sectors',
                    fetchFn,
                    '',
                    { value: 'id', label: 'name' },
                ),
            { wrapper },
        );

        await waitFor(() => {
            expect(result.current.lookups).toHaveLength(2);
        });

        expect(fetchFn).toHaveBeenCalledWith({ pageSize: '20' });
        expect(result.current.lookups).toEqual([
            { value: 1, label: 'Sector Norte' },
            { value: 2, label: 'Sector Sur' },
        ]);
    });

    it('combina initialItems para que estén siempre presentes aunque no vengan en fetchFn', async () => {
        const fetchFn = vi.fn().mockResolvedValue({
            data: [{ id: 1, name: 'Sector 1' }],
            rowCount: 1,
        });

        const initialItems = [
            { value: 85, label: 'Sector Preexistente 85' },
        ];

        const wrapper = createWrapper();
        const { result } = renderHook(
            () =>
                useLookup(
                    'test-initial',
                    fetchFn,
                    '',
                    { value: 'id', label: 'name' },
                    { initialItems },
                ),
            { wrapper },
        );

        await waitFor(() => {
            expect(result.current.lookups).toHaveLength(2);
        });

        expect(result.current.lookups).toEqual([
            { value: 85, label: 'Sector Preexistente 85' },
            { value: 1, label: 'Sector 1' },
        ]);
    });

    it('permite configurar pageSize personalizado', async () => {
        const fetchFn = vi.fn().mockResolvedValue({
            data: [],
            rowCount: 0,
        });

        const wrapper = createWrapper();
        renderHook(
            () =>
                useLookup(
                    'test-pagesize',
                    fetchFn,
                    '',
                    { value: 'id', label: 'name' },
                    { pageSize: 50 },
                ),
            { wrapper },
        );

        await waitFor(() => {
            expect(fetchFn).toHaveBeenCalledWith({ pageSize: '50' });
        });
    });
});

