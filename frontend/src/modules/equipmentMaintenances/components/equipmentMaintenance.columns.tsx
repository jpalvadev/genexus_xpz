import { type ColumnDef } from '@tanstack/react-table';
import { type EquipmentMaintenanceResponse } from '../types/equipmentMaintenance.type';
import EquipmentMaintenanceActionCell from './EquipmentMaintenanceActionCell';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export const EQUIPMENT_MAINTENANCE_COLUMNS: ColumnDef<EquipmentMaintenanceResponse>[] =
    [
        {
            accessorKey: 'date',
            header: () => <span>Fecha</span>,
            cell: ({ getValue }) => {
                const date = getValue<string>();
                return <span>{format(parseISO(date), 'dd/MM/yyyy')}</span>;
            },
            meta: { filterKey: 'date', filterVariant: 'date' },
        },

        {
            accessorKey: 'equipmentItem.name',
            header: () => <span>Equipo</span>,

            meta: {
                filterKey: 'equipmentItem.name',
                filterVariant: 'string',
            },
        },

        {
            accessorKey: 'equipmentItem.code',
            header: () => <span>Código</span>,

            meta: {
                filterKey: 'equipmentItem.code',
                filterVariant: 'string',
            },
        },

        {
            accessorKey: 'equipmentItem.status',
            header: () => <span>Estado del Equipo</span>,
            cell: ({ getValue }) => {
                const status = getValue<number>();
                if (status === 1) {
                    return <Badge variant="success">Operativo</Badge>;
                }
                if (status === 2) {
                    return <Badge variant="warning">En Reparación</Badge>;
                }
                return <Badge variant="destructive">Fuera de Servicio</Badge>;
            },
            meta: {
                filterKey: 'equipmentItem.status',
                filterVariant: 'select',
                selectOptions: [
                    { label: 'Operativo', value: 1 },
                    { label: 'En Reparación', value: 2 },
                    { label: 'Fuera de Servicio', value: 3 },
                ],
            },
        },

        {
            accessorKey: 'type',
            header: () => <span>Tipo</span>,
            cell: ({ getValue }) => {
                const type = getValue<number>();
                return type === 2 ? (
                    <Badge variant="destructive">Correctivo</Badge>
                ) : (
                    <Badge variant="info">Preventivo</Badge>
                );
            },
            meta: {
                filterKey: 'type',
                filterVariant: 'select', // Cambiamos a select
                selectOptions: [
                    { label: 'Preventivo', value: 1 }, // El value debe ser el nombre del Enum en C#
                    { label: 'Correctivo', value: 2 },
                ],
            },
        },

        {
            accessorKey: 'activity',
            header: () => <span>Actividad</span>,
            meta: { filterKey: 'activity', filterVariant: 'string' },
        },

        {
            accessorKey: 'person.lastName',
            header: () => <span>Responsable</span>,
            accessorFn: (row) =>
                `${row.person.lastName}, ${row.person.firstName}`,
            meta: { filterKey: 'person.lastName', filterVariant: 'string' },
        },

        {
            accessorKey: 'status',
            header: () => <span>Estado</span>,
            cell: ({ getValue }) => {
                const status = getValue<number>();
                return status === 2 ? (
                    <Badge variant="success">Completado</Badge>
                ) : (
                    <Badge variant="warning">Pendiente</Badge>
                );
            },
            meta: {
                filterKey: 'status',
                filterVariant: 'select',
                selectOptions: [
                    { label: 'Pendiente', value: 'Pending' },
                    { label: 'Completado', value: 'Completed' },
                ],
            },
        },

        {
            accessorKey: 'closedAt',
            header: () => <span>Cerrado</span>,
            cell: ({ getValue }) => {
                const date = getValue<string>();
                return date ? (
                    <span>{format(parseISO(date), 'dd/MM/yyyy')}</span>
                ) : (
                    <span>-</span>
                );
            },
            meta: { filterKey: 'closedAt', filterVariant: 'date' },
        },

        {
            id: 'actions',
            cell: ({ row }) => (
                <EquipmentMaintenanceActionCell
                    equipmentMaintenance={row.original}
                />
            ),
        },
    ];
