import { type ColumnDef } from '@tanstack/react-table';

import SectorActionCell from './SectorActionCell';
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
    {
        id: 'actions',
        accessorKey: 'id',
        header: () => <span>Acciones</span>,
        cell: ({ row }) => <SectorActionCell sector={row.original} />,
    },
];
