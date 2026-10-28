import { type ColumnDef } from '@tanstack/react-table';

import PlantActionCell from './PlantActionCell';
import type { Plant } from '../types/plant.type';

export const PLANT_COLUMNS: ColumnDef<Plant>[] = [
    {
        id: 'id',
        accessorKey: 'id',
        header: () => <span>ID</span>,
        meta: { filterKey: 'id', filterVariant: 'number' },
    },
    {
        id: 'name',
        accessorKey: 'name',
        header: () => <span>Nombre</span>,
        meta: { filterKey: 'name', filterVariant: 'string' },
    },
    {
        id: 'actions',
        accessorKey: 'id',
        header: () => <span>Acciones</span>,
        cell: ({ row }) => <PlantActionCell plant={row.original} />,
    },
];
