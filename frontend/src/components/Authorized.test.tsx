import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '@/test/test-utils';
import Authorized from './Authorized';
import { createTestQueryClient } from '@/test/test-utils';

describe('Authorized component', () => {
    it('muestra "Cargando..." cuando la información del usuario está pendiente', () => {
        const queryClient = createTestQueryClient();
        // Creamos una query pendiente en cache sin datos resueltos
        queryClient.setQueryData(['auth', 'user'], undefined);

        renderWithProviders(
            <Authorized fallback={<p>Sin acceso</p>}>
                <p>Contenido secreto</p>
            </Authorized>,
            { queryClient }
        );

        expect(screen.getByText('Cargando...')).toBeInTheDocument();
        expect(screen.queryByText('Contenido secreto')).not.toBeInTheDocument();
        expect(screen.queryByText('Sin acceso')).not.toBeInTheDocument();
    });

    it('muestra el fallback cuando no hay usuario autenticado (user es null)', () => {
        renderWithProviders(
            <Authorized fallback={<p>Acceso denegado</p>}>
                <p>Contenido privado</p>
            </Authorized>,
            { user: null }
        );

        expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
        expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
    });

    it('renderiza children cuando el usuario tiene el requiredModule y requiredRole exacto', () => {
        renderWithProviders(
            <Authorized
                requiredModule="device"
                requiredRole="operator"
                fallback={<p>Sin permiso</p>}
            >
                <p>Panel de Dispositivos</p>
            </Authorized>,
            {
                user: {
                    roles: ['user'],
                    permissions: [
                        { module: 'device', role: 'operator', scope: null },
                    ],
                },
            }
        );

        expect(screen.getByText('Panel de Dispositivos')).toBeInTheDocument();
        expect(screen.queryByText('Sin permiso')).not.toBeInTheDocument();
    });

    it('muestra fallback cuando el usuario no tiene el permiso requerido', () => {
        renderWithProviders(
            <Authorized
                requiredModule="device"
                requiredRole="admin"
                fallback={<p>Sin permiso</p>}
            >
                <p>Panel de Dispositivos</p>
            </Authorized>,
            {
                user: {
                    roles: ['user'],
                    permissions: [
                        { module: 'device', role: 'operator', scope: null },
                    ],
                },
            }
        );

        expect(screen.getByText('Sin permiso')).toBeInTheDocument();
        expect(screen.queryByText('Panel de Dispositivos')).not.toBeInTheDocument();
    });

    it('permite acceso total mediante bypass general/admin aunque no tenga el permiso específico', () => {
        renderWithProviders(
            <Authorized
                requiredModule="equipment"
                requiredRole="supervisor"
                fallback={<p>Sin permiso</p>}
            >
                <p>Gestión de Equipos</p>
            </Authorized>,
            {
                user: {
                    roles: ['admin'],
                    permissions: [
                        { module: 'general', role: 'admin', scope: null },
                    ],
                },
            }
        );

        expect(screen.getByText('Gestión de Equipos')).toBeInTheDocument();
        expect(screen.queryByText('Sin permiso')).not.toBeInTheDocument();
    });

    describe('filtro por scope', () => {
        it('permite acceso si el permiso coincide exactamente con el scope solicitado', () => {
            renderWithProviders(
                <Authorized
                    requiredModule="device"
                    requiredRole="operator"
                    scope="zona-norte"
                    fallback={<p>Sin permiso</p>}
                >
                    <p>Sensor Zona Norte</p>
                </Authorized>,
                {
                    user: {
                        roles: ['user'],
                        permissions: [
                            { module: 'device', role: 'operator', scope: 'zona-norte' },
                        ],
                    },
                }
            );

            expect(screen.getByText('Sensor Zona Norte')).toBeInTheDocument();
        });

        it('deniega acceso si el scope del usuario es para otra zona', () => {
            renderWithProviders(
                <Authorized
                    requiredModule="device"
                    requiredRole="operator"
                    scope="zona-sur"
                    fallback={<p>Sin permiso</p>}
                >
                    <p>Sensor Zona Sur</p>
                </Authorized>,
                {
                    user: {
                        roles: ['user'],
                        permissions: [
                            { module: 'device', role: 'operator', scope: 'zona-norte' },
                        ],
                    },
                }
            );

            expect(screen.getByText('Sin permiso')).toBeInTheDocument();
            expect(screen.queryByText('Sensor Zona Sur')).not.toBeInTheDocument();
        });

        it('permite acceso si el permiso del usuario tiene scope null (aplica globalmente)', () => {
            renderWithProviders(
                <Authorized
                    requiredModule="device"
                    requiredRole="operator"
                    scope="zona-sur"
                    fallback={<p>Sin permiso</p>}
                >
                    <p>Sensor Global</p>
                </Authorized>,
                {
                    user: {
                        roles: ['user'],
                        permissions: [
                            { module: 'device', role: 'operator', scope: null },
                        ],
                    },
                }
            );

            expect(screen.getByText('Sensor Global')).toBeInTheDocument();
        });
    });

    describe('filtro por allowedRoles', () => {
        it('muestra children si el usuario contiene uno de los roles permitidos', () => {
            renderWithProviders(
                <Authorized
                    allowedRoles={['manager', 'supervisor']}
                    fallback={<p>Rol insuficiente</p>}
                >
                    <p>Reporte Gerencial</p>
                </Authorized>,
                {
                    user: {
                        roles: ['supervisor'],
                        permissions: [],
                    },
                }
            );

            expect(screen.getByText('Reporte Gerencial')).toBeInTheDocument();
            expect(screen.queryByText('Rol insuficiente')).not.toBeInTheDocument();
        });

        it('muestra fallback si el usuario no tiene ninguno de los roles permitidos', () => {
            renderWithProviders(
                <Authorized
                    allowedRoles={['manager']}
                    fallback={<p>Rol insuficiente</p>}
                >
                    <p>Reporte Gerencial</p>
                </Authorized>,
                {
                    user: {
                        roles: ['operator'],
                        permissions: [],
                    },
                }
            );

            expect(screen.getByText('Rol insuficiente')).toBeInTheDocument();
            expect(screen.queryByText('Reporte Gerencial')).not.toBeInTheDocument();
        });

        it('evidencia B6: maneja correctamente cuando roles está vacío sin arrojar excepción', () => {
            renderWithProviders(
                <Authorized
                    allowedRoles={['manager']}
                    fallback={<p>Rol insuficiente</p>}
                >
                    <p>Reporte Gerencial</p>
                </Authorized>,
                {
                    user: {
                        roles: [],
                        permissions: [],
                    },
                }
            );

            expect(screen.getByText('Rol insuficiente')).toBeInTheDocument();
            expect(screen.queryByText('Reporte Gerencial')).not.toBeInTheDocument();
        });
    });
});

