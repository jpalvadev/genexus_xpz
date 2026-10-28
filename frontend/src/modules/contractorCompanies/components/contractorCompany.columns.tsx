import { type ColumnDef } from '@tanstack/react-table';

import ContractorCompanyActionCell from './ContractorCompanyActionCell';
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
    {
        id: 'actions',
        accessorKey: 'id',
        header: () => <span>Acciones</span>,
        cell: ({ row }) => <ContractorCompanyActionCell contractorCompany={row.original} />,
    },
];
