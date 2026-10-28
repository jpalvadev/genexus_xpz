import {
    HomeIcon,
    ListIcon,
    ThermometerSunIcon,
    ChartAreaIcon,
    type LucideProps,
    UsersIcon,
    UserPlus,
    ForkliftIcon,
    CpuIcon,
    CalendarClockIcon,
    CalendarPlusIcon,
    Settings2Icon,
    ShieldIcon,
    GlobeIcon,
    SprayCanIcon,
    ClipboardListIcon,
    BoxesIcon,
    PackageIcon,
} from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { FileRouteTypes } from '../routeTree.gen';

export type INavigationConfig = {
    title?: string;
    menus?: INavigationConfig[];
    to?: FileRouteTypes['to'];
    icon?: ForwardRefExoticComponent<
        Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
    >;
    badge?: number;
    allowedRoles?: string[];
    requiredModule?: string;
    requiredRole?: 'admin' | 'reports';
};

export const navigationConfig: INavigationConfig[] = [
    {
        title: 'Menus',
        menus: [
            { title: 'Home', to: '/', icon: HomeIcon },
            {
                title: 'Dispositivos',
                icon: CpuIcon,
                requiredModule: 'device',
                requiredRole: 'admin',
                menus: [{ title: 'Listado', to: '/devices', icon: ListIcon }],
            },
            {
                title: 'Lecturas',
                icon: ThermometerSunIcon,
                requiredModule: 'reading',
                requiredRole: 'admin',
                menus: [
                    { title: 'Listado', to: '/readings', icon: ListIcon },
                    {
                        title: 'Reportes',
                        to: '/readings/charts',
                        icon: ChartAreaIcon,
                        requiredModule: 'device',
                        requiredRole: 'reports',
                    },
                ],
            },
            {
                title: 'Personas',
                icon: UsersIcon,
                requiredModule: 'person',
                requiredRole: 'admin',
                menus: [
                    { title: 'Listado', to: '/persons', icon: ListIcon },
                    { title: 'Nuevo', to: '/persons/new', icon: UserPlus },
                ],
            },
            {
                title: 'Equipos',
                icon: UsersIcon,
                requiredModule: 'equipmentItem',
                requiredRole: 'admin',
                menus: [
                    { title: 'Listado', to: '/equipmentItems', icon: ListIcon },
                    {
                        title: 'Nuevo',
                        to: '/equipmentItems/new',
                        icon: ForkliftIcon,
                    },
                ],
            },

            {
                title: 'Mantenimiento Equipos',
                icon: UsersIcon,
                requiredModule: 'equipmentMaintenance',
                requiredRole: 'admin',
                menus: [
                    {
                        title: 'Listado',
                        to: '/equipmentMaintenances',
                        icon: ListIcon,
                    },
                    {
                        title: 'Nuevo',
                        to: '/equipmentMaintenances/new',
                        icon: ForkliftIcon,
                    },
                ],
            },
            {
                title: 'Vencimientos',
                icon: CalendarClockIcon,
                requiredModule: 'expiration',
                requiredRole: 'admin',
                menus: [
                    {
                        title: 'Listado',
                        to: '/expirations',
                        icon: ListIcon,
                    },
                    {
                        title: 'Nuevo',
                        to: '/expirations/new',
                        icon: CalendarPlusIcon,
                    },
                ],
            },
            {
                title: 'Inventario',
                icon: BoxesIcon,
                menus: [
                    {
                        title: 'Catálogo Maestro',
                        to: '/inventory/items',
                        icon: PackageIcon,
                        requiredModule: 'inventoryItem',
                        requiredRole: 'admin',
                    },
                    {
                        title: 'Lotes y Stock',
                        to: '/inventory/batches',
                        icon: ListIcon,
                        requiredModule: 'inventoryBatch',
                        requiredRole: 'admin',
                    },
                    {
                        title: 'Ingreso Lote',
                        to: '/inventory/batches/new',
                        icon: BoxesIcon,
                        requiredModule: 'inventoryBatch',
                        requiredRole: 'admin',
                    },
                ],
            },
            {
                title: 'Sectores',
                icon: UsersIcon,
                requiredModule: 'sector',
                requiredRole: 'admin',
                menus: [
                    { title: 'Listado', to: '/sectors', icon: ListIcon },
                    {
                        title: 'Nuevo',
                        to: '/sectors/new',
                        icon: ForkliftIcon,
                    },
                ],
            },
            {
                title: 'Elementos',
                icon: SprayCanIcon,
                requiredModule: 'element',
                requiredRole: 'admin',
                menus: [
                    { title: 'Listado', to: '/elements', icon: ListIcon },
                    {
                        title: 'Nuevo',
                        to: '/elements/new',
                        icon: ForkliftIcon,
                    },
                ],
            },
            {
                title: 'Saneamiento',
                icon: SprayCanIcon,
                menus: [
                    {
                        title: 'Panel de Control',
                        to: '/cleaning',
                        icon: ChartAreaIcon,
                    },
                ],
            },
            {
                title: 'Formularios',
                icon: ClipboardListIcon,
                requiredModule: 'form',
                requiredRole: 'admin',
                menus: [
                    { title: 'Listado', to: '/forms', icon: ListIcon },
                    {
                        title: 'Nuevo',
                        to: '/forms/new',
                        icon: ClipboardListIcon,
                    },
                ],
            },
            {
                title: 'Configuración',
                icon: Settings2Icon,
                menus: [
                    {
                        title: 'Módulos',
                        icon: ShieldIcon,
                        requiredModule: 'general',
                        requiredRole: 'admin',
                        menus: [
                            {
                                title: 'Listado',
                                to: '/modules',
                                icon: ListIcon,
                            },
                            {
                                title: 'Nuevo',
                                to: '/modules/new',
                                icon: ForkliftIcon,
                            },
                        ],
                    },
                    {
                        title: 'Roles',
                        icon: ShieldIcon,
                        requiredModule: 'general',
                        requiredRole: 'admin',
                        menus: [
                            {
                                title: 'Listado',
                                to: '/roles',
                                icon: ListIcon,
                            },
                            {
                                title: 'Nuevo',
                                to: '/roles/new',
                                icon: ForkliftIcon,
                            },
                        ],
                    },
                    {
                        title: 'Scopes',
                        icon: GlobeIcon,
                        requiredModule: 'general',
                        requiredRole: 'admin',
                        menus: [
                            { title: 'Listado', to: '/scopes', icon: ListIcon },
                            {
                                title: 'Nuevo',
                                to: '/scopes/new',
                                icon: ForkliftIcon,
                            },
                        ],
                    },
                    {
                        title: 'Tenants',
                        icon: GlobeIcon,
                        requiredModule: 'general',
                        requiredRole: 'admin',
                        menus: [
                            {
                                title: 'Listado',
                                to: '/tenants',
                                icon: ListIcon,
                            },
                            {
                                title: 'Nuevo',
                                to: '/tenants/new',
                                icon: ForkliftIcon,
                            },
                        ],
                    },
                    {
                        title: 'Usuarios',
                        icon: GlobeIcon,
                        requiredModule: 'general',
                        requiredRole: 'admin',
                        menus: [
                            {
                                title: 'Listado',
                                to: '/users',
                                icon: ListIcon,
                            },
                            {
                                title: 'Nuevo',
                                to: '/users/new',
                                icon: ForkliftIcon,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
