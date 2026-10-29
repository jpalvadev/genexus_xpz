import { type ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import type { SecurityObservationResponse } from '../types/securityObservation.type';
import SecurityObservationActionCell from './SecurityObservationActionCell';

/**
 * Grid contract (ticket 06): Id, Observation Date, Plant, Sector, Task, Place, Company,
 * Observers (joined names), Created On. filterKey values match the backend's
 * SecurityObservationGridifyConfig maps; default order (createdOn desc) lives server-side.
 */
export const SECURITY_OBSERVATION_COLUMNS: ColumnDef<SecurityObservationResponse>[] = [
    {
        id: 'id',
        accessorKey: 'id',
        header: () => <span>ID</span>,
        meta: { filterKey: 'id', filterVariant: 'string' },
    },
    {
        id: 'observationDate',
        accessorKey: 'observationDate',
        header: () => <span>Fecha de Observación</span>,
        cell: ({ getValue }) => (
            <span>{format(parseISO(getValue<string>()), 'dd/MM/yyyy')}</span>
        ),
        meta: { filterKey: 'observationDate', filterVariant: 'date' },
    },
    {
        id: 'plant.name',
        accessorKey: 'plant.name',
        header: () => <span>Planta</span>,
        meta: { filterKey: 'plant.name', filterVariant: 'string' },
    },
    {
        id: 'sector.name',
        accessorKey: 'sector.name',
        header: () => <span>Sector</span>,
        meta: { filterKey: 'sector.name', filterVariant: 'string' },
    },
    {
        id: 'task',
        accessorKey: 'task',
        header: () => <span>Tarea</span>,
        meta: { filterKey: 'task', filterVariant: 'string' },
    },
    {
        id: 'lugar',
        accessorKey: 'lugar',
        header: () => <span>Lugar</span>,
        meta: { filterKey: 'lugar', filterVariant: 'string' },
    },
    {
        id: 'company.name',
        accessorKey: 'contractorCompany.name',
        accessorFn: (row) => row.contractorCompany?.name ?? '',
        header: () => <span>Empresa Contratista</span>,
        meta: { filterKey: 'company.name', filterVariant: 'string' },
    },
    {
        id: 'observers',
        accessorKey: 'observers',
        accessorFn: (row) => row.observers.map((o) => o.fullName).join(', '),
        header: () => <span>Observadores</span>,
    },
    {
        id: 'createdOn',
        accessorKey: 'createdOn',
        header: () => <span>Creado</span>,
        cell: ({ getValue }) => (
            <span>{format(parseISO(getValue<string>()), 'dd/MM/yyyy HH:mm')}</span>
        ),
        meta: { filterKey: 'createdOn', filterVariant: 'date' },
    },
    {
        id: 'actions',
        accessorKey: 'id',
        header: () => <span>Acciones</span>,
        cell: ({ row }) => <SecurityObservationActionCell securityObservation={row.original} />,
    },
];
