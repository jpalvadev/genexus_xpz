import { type ColumnDef } from '@tanstack/react-table';

import ObserverActionCell from './ObserverActionCell';
import { OBSERVER_POSTS, type Observer } from '../types/observer.type';

export const OBSERVER_COLUMNS: ColumnDef<Observer>[] = [
    {
        id: 'id',
        accessorKey: 'id',
        header: () => <span>ID</span>,
        meta: { filterKey: 'id', filterVariant: 'number' },
    },
    {
        id: 'legajo',
        accessorKey: 'legajo',
        header: () => <span>Legajo</span>,
        meta: { filterKey: 'legajo', filterVariant: 'number' },
    },
    {
        id: 'fullName',
        accessorKey: 'fullName',
        header: () => <span>Nombre</span>,
        meta: { filterKey: 'fullName', filterVariant: 'string' },
    },
    {
        id: 'post',
        accessorKey: 'post',
        accessorFn: (row) =>
            OBSERVER_POSTS.find((p) => p.value === row.post)?.label ?? String(row.post),
        header: () => <span>Cargo</span>,
    },
    {
        id: 'active',
        accessorKey: 'active',
        accessorFn: (row) => (row.active ? 'Sí' : 'No'),
        header: () => <span>Activo</span>,
    },
    {
        id: 'actions',
        accessorKey: 'id',
        header: () => <span>Acciones</span>,
        cell: ({ row }) => <ObserverActionCell observer={row.original} />,
    },
];
