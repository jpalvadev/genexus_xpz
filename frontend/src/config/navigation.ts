import {
    HomeIcon,
    ListIcon,
    ForkliftIcon,
    UsersIcon,
    ShieldIcon,
    type LucideProps,
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
};

export const navigationConfig: INavigationConfig[] = [
    {
        title: 'Menus',
        menus: [
            { title: 'Home', to: '/', icon: HomeIcon },
            {
                title: 'Mantenimiento Equipos',
                icon: UsersIcon,
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
                title: 'Seguridad',
                icon: ShieldIcon,
                menus: [
                    {
                        title: 'Observaciones',
                        to: '/securityObservations',
                        icon: ListIcon,
                    },
                    {
                        title: 'Nueva Observación',
                        to: '/securityObservations/new',
                        icon: ShieldIcon,
                    },
                    {
                        title: 'Catálogos',
                        icon: ListIcon,
                        menus: [
                            {
                                title: 'Observadores',
                                to: '/observers',
                                icon: UsersIcon,
                            },
                            {
                                title: 'Plantas',
                                to: '/plants',
                                icon: ListIcon,
                            },
                            {
                                title: 'Sectores',
                                to: '/sectors',
                                icon: ListIcon,
                            },
                            {
                                title: 'Empresas Contratistas',
                                to: '/contractorCompanies',
                                icon: ListIcon,
                            },
                            {
                                title: 'Opciones de Combo',
                                to: '/comboOptions',
                                icon: ListIcon,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
