import { type ColumnDef } from '@tanstack/react-table';

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
];
