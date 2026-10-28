import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMenuNavigation } from './useMenuNavigation';
import type { AuthUser, UserPermission } from '@/modules/auth/types/auth.type';
import type { ReactNode } from 'react';

function createWrapper(user: Partial<AuthUser> | null, isPending = false) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
        },
    });

    if (!isPending) {
        if (user === null) {
            queryClient.setQueryData(['auth', 'user'], null);
        } else {
            const fullUser: AuthUser = {
                email: user.email ?? 'test@itrion.com',
                firstName: user.firstName ?? 'Test',
                lastName: user.lastName ?? 'User',
                roles: user.roles ?? ['user'],
                permissions: user.permissions ?? [],
                mustChangePassword: user.mustChangePassword ?? false,
            };
            queryClient.setQueryData(['auth', 'user'], fullUser);
        }
    }

    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    };
}

describe('useMenuNavigation hook', () => {
    it('retorna menu vacío si la autenticación está cargando (isPending)', () => {
        const wrapper = createWrapper(null, true);
        const { result } = renderHook(() => useMenuNavigation(), { wrapper });

        expect(result.current.isPending).toBe(true);
        expect(result.current.menu).toEqual([]);
    });

    it('un usuario con general:admin tiene acceso a todos los módulos y submenús (bypass admin)', () => {
        const permissions: UserPermission[] = [
            { module: 'general', role: 'admin', scope: null },
        ];
        const wrapper = createWrapper({ permissions });
        const { result } = renderHook(() => useMenuNavigation(), { wrapper });

        expect(result.current.isPending).toBe(false);

        const menusGroup = result.current.menu.find((m) => m.title === 'Menus');
        expect(menusGroup).toBeDefined();

        const menuTitles = menusGroup?.menus?.map((m) => m.title) ?? [];
        expect(menuTitles).toContain('Home');
        expect(menuTitles).toContain('Dispositivos');
        expect(menuTitles).toContain('Lecturas');
        expect(menuTitles).toContain('Personas');
        expect(menuTitles).toContain('Configuración');
    });

    it('un usuario con únicamente device:admin solo ve Home y Dispositivos', () => {
        const permissions: UserPermission[] = [
            { module: 'device', role: 'admin', scope: null },
        ];
        const wrapper = createWrapper({ permissions });
        const { result } = renderHook(() => useMenuNavigation(), { wrapper });

        const menusGroup = result.current.menu.find((m) => m.title === 'Menus');
        const menuTitles = menusGroup?.menus?.map((m) => m.title) ?? [];

        expect(menuTitles).toContain('Home');
        expect(menuTitles).toContain('Dispositivos');
        expect(menuTitles).not.toContain('Lecturas');
        expect(menuTitles).not.toContain('Personas');
        expect(menuTitles).not.toContain('Configuración');
    });

    it('un usuario con permisos de módulo pero sin acceso a device ni reading no ve esos módulos', () => {
        const permissions: UserPermission[] = [
            { module: 'person', role: 'admin', scope: null },
        ];
        const wrapper = createWrapper({ permissions });
        const { result } = renderHook(() => useMenuNavigation(), { wrapper });

        const menusGroup = result.current.menu.find((m) => m.title === 'Menus');
        const menuTitles = menusGroup?.menus?.map((m) => m.title) ?? [];

        expect(menuTitles).toContain('Home');
        expect(menuTitles).toContain('Personas');
        expect(menuTitles).not.toContain('Dispositivos');
        expect(menuTitles).not.toContain('Lecturas');
        expect(menuTitles).not.toContain('Configuración');
    });

    it('filtra submenús específicos cuando no tiene el rol secundario requerido (ej: reportes)', () => {
        // Usuario con acceso a lecturas pero NO a reportes de device
        const wrapperWithoutReports = createWrapper({
            permissions: [{ module: 'reading', role: 'admin', scope: null }],
        });
        const { result: resNoReports } = renderHook(() => useMenuNavigation(), {
            wrapper: wrapperWithoutReports,
        });

        const lecturasMenu = resNoReports.current.menu
            .find((m) => m.title === 'Menus')
            ?.menus?.find((m) => m.title === 'Lecturas');

        expect(lecturasMenu).toBeDefined();
        const subTitlesWithout = lecturasMenu?.menus?.map((m) => m.title) ?? [];
        expect(subTitlesWithout).toContain('Listado');
        expect(subTitlesWithout).not.toContain('Reportes');

        // Usuario con acceso a lecturas Y a reportes de device
        const wrapperWithReports = createWrapper({
            permissions: [
                { module: 'reading', role: 'admin', scope: null },
                { module: 'device', role: 'reports', scope: null },
            ],
        });
        const { result: resWithReports } = renderHook(() => useMenuNavigation(), {
            wrapper: wrapperWithReports,
        });

        const lecturasWithReports = resWithReports.current.menu
            .find((m) => m.title === 'Menus')
            ?.menus?.find((m) => m.title === 'Lecturas');

        const subTitlesWith = lecturasWithReports?.menus?.map((m) => m.title) ?? [];
        expect(subTitlesWith).toContain('Listado');
        expect(subTitlesWith).toContain('Reportes');
    });
});

