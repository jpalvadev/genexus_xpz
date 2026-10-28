import {
    HomeIcon,
    ListIcon,
    ForkliftIcon,
    UsersIcon,
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
        ],
    },
];
