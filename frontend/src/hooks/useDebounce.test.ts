import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce hook', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('retorna el valor inicial inmediatamente', () => {
        const { result } = renderHook(() => useDebounce('inicial', 300));
        expect(result.current).toBe('inicial');
    });

    it('actualiza el valor debounced solo tras transcurrir el delay', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: 'primer valor', delay: 300 },
            },
        );

        expect(result.current).toBe('primer valor');

        rerender({ value: 'segundo valor', delay: 300 });

        // Antes de que pasen los 300ms, sigue con el valor anterior
        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(result.current).toBe('primer valor');

        // Tras completar los 300ms, se actualiza
        act(() => {
            vi.advanceTimersByTime(100);
        });
        expect(result.current).toBe('segundo valor');
    });

    it('cancela el timer previo si el valor cambia rápidamente', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            {
                initialProps: { value: 'a' },
            },
        );

        rerender({ value: 'ab' });
        act(() => {
            vi.advanceTimersByTime(150);
        });

        rerender({ value: 'abc' });
        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(result.current).toBe('a');

        act(() => {
            vi.advanceTimersByTime(100);
        });
        expect(result.current).toBe('abc');
    });
});

