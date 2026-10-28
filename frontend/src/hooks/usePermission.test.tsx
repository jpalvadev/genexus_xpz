import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
    usePermissions,
    usePermission,
    useHasModuleAccess,
} from './usePermission';
import type { AuthUser, UserPermission } from '@/modules/auth/types/auth.type';

function createWrapper(permissions?: UserPermission[] | null) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    if (permissions !== null) {
        queryClient.setQueryData<AuthUser>(['auth', 'user'], {
            email: 'test@itrion.com',
            firstName: 'Test',
            lastName: 'User',
            roles: ['user'],
            permissions: permissions ?? [],
            mustChangePassword: false,
        });
    }

    return function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    };
}

describe('usePermission hooks', () => {
    describe('usePermissions', () => {
        it('devuelve los permisos del usuario cuando está presente en la caché', () => {
            const permisos: UserPermission[] = [
                { module: 'device', role: 'admin', scope: null },
            ];
            const { result } = renderHook(() => usePermissions(), {
                wrapper: createWrapper(permisos),
            });

            expect(result.current).toEqual(permisos);
        });

        it('devuelve un array vacío si no hay usuario en la caché', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: createWrapper(null),
            });

            expect(result.current).toEqual([]);
        });
    });

    describe('usePermission (Matriz de paridad con backend PermissionService)', () => {
        it('general/admin actúa como bypass universal para cualquier módulo, rol y scope', () => {
            const permisos: UserPermission[] = [
                { module: 'general', role: 'admin', scope: null },
            ];
            const wrapper = createWrapper(permisos);

            const { result: deviceAdmin } = renderHook(
                () => usePermission('device', 'admin'),
                { wrapper },
            );
            const { result: readingViewer } = renderHook(
                () => usePermission('reading', 'viewer', 'norte'),
                { wrapper },
            );
            const { result: custom } = renderHook(
                () => usePermission('cualquier_cosa', 'cualquier_rol'),
                { wrapper },
            );

            expect(deviceAdmin.current).toBe(true);
            expect(readingViewer.current).toBe(true);
            expect(custom.current).toBe(true);
        });

        it('permiso con scope null otorga acceso a cualquier scope (scope null = todos)', () => {
            const permisos: UserPermission[] = [
                { module: 'device', role: 'admin', scope: null },
            ];
            const wrapper = createWrapper(permisos);

            const { result: sinScope } = renderHook(
                () => usePermission('device', 'admin'),
                { wrapper },
            );
            const { result: conScopeNorte } = renderHook(
                () => usePermission('device', 'admin', 'norte'),
                { wrapper },
            );

            expect(sinScope.current).toBe(true);
            expect(conScopeNorte.current).toBe(true);
        });

        it('permiso con scope específico restringe a otros scopes', () => {
            const permisos: UserPermission[] = [
                { module: 'device', role: 'admin', scope: 'norte' },
            ];
            const wrapper = createWrapper(permisos);

            const { result: mismoScope } = renderHook(
                () => usePermission('device', 'admin', 'norte'),
                { wrapper },
            );
            const { result: otroScope } = renderHook(
                () => usePermission('device', 'admin', 'sur'),
                { wrapper },
            );
            const { result: sinScopeRequerido } = renderHook(
                () => usePermission('device', 'admin'),
                { wrapper },
            );

            expect(mismoScope.current).toBe(true);
            expect(otroScope.current).toBe(false);
            expect(sinScopeRequerido.current).toBe(true);
        });

        it('rechaza si el rol es diferente', () => {
            const permisos: UserPermission[] = [
                { module: 'device', role: 'reports', scope: null },
            ];
            const wrapper = createWrapper(permisos);

            const { result } = renderHook(
                () => usePermission('device', 'admin'),
                { wrapper },
            );

            expect(result.current).toBe(false);
        });

        it('rechaza si el módulo es diferente', () => {
            const permisos: UserPermission[] = [
                { module: 'reading', role: 'admin', scope: null },
            ];
            const wrapper = createWrapper(permisos);

            const { result } = renderHook(
                () => usePermission('device', 'admin'),
                { wrapper },
            );

            expect(result.current).toBe(false);
        });

        it('general/reports no tiene bypass universal (solo aplica a admin)', () => {
            const permisos: UserPermission[] = [
                { module: 'general', role: 'reports', scope: null },
            ];
            const wrapper = createWrapper(permisos);

            const { result } = renderHook(
                () => usePermission('device', 'admin'),
                { wrapper },
            );

            expect(result.current).toBe(false);
        });

        it('devuelve false cuando la lista de permisos está vacía', () => {
            const wrapper = createWrapper([]);

            const { result } = renderHook(
                () => usePermission('device', 'admin'),
                { wrapper },
            );

            expect(result.current).toBe(false);
        });
    });

    describe('useHasModuleAccess', () => {
        it('general/admin otorga acceso a cualquier módulo', () => {
            const permisos: UserPermission[] = [
                { module: 'general', role: 'admin', scope: null },
            ];
            const wrapper = createWrapper(permisos);

            const { result } = renderHook(() => useHasModuleAccess('device'), {
                wrapper,
            });

            expect(result.current).toBe(true);
        });

        it('otorga acceso si el usuario posee cualquier rol en el módulo solicitado', () => {
            const permisos: UserPermission[] = [
                { module: 'device', role: 'viewer', scope: null },
            ];
            const wrapper = createWrapper(permisos);

            const { result: deviceAccess } = renderHook(
                () => useHasModuleAccess('device'),
                { wrapper },
            );
            const { result: usersAccess } = renderHook(
                () => useHasModuleAccess('users'),
                { wrapper },
            );

            expect(deviceAccess.current).toBe(true);
            expect(usersAccess.current).toBe(false);
        });

        it('devuelve false si la lista de permisos está vacía', () => {
            const wrapper = createWrapper([]);
            const { result } = renderHook(() => useHasModuleAccess('device'), {
                wrapper,
            });

            expect(result.current).toBe(false);
        });
    });
});

