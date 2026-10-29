import { type ColumnDef } from '@tanstack/react-table';

import type { Sector } from '../types/sector.type';

export const SECTOR_COLUMNS: ColumnDef<Sector>[] = [
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
