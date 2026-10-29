import { type ColumnDef } from '@tanstack/react-table';

import type { ContractorCompany } from '../types/contractorCompany.type';

export const CONTRACTORCOMPANY_COLUMNS: ColumnDef<ContractorCompany>[] = [
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
