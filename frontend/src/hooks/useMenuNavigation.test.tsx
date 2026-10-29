import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMenuNavigation } from './useMenuNavigation';
import { navigationConfig } from '@/config/navigation';

describe('useMenuNavigation hook', () => {
    it('renderiza la configuración de navegación tal cual, sin filtro de permisos', () => {
        const { result } = renderHook(() => useMenuNavigation());

        expect(result.current.isPending).toBe(false);
        expect(result.current.menu).toBe(navigationConfig);
    });

    it('no hay estado pendiente de autenticación: el menú nunca viene vacío', () => {
        const { result } = renderHook(() => useMenuNavigation());
        expect(result.current.menu.length).toBeGreaterThan(0);
    });
});
