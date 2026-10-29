import { type ColumnDef } from '@tanstack/react-table';

import type { ComboOption } from '../types/comboOption.type';

export const COMBO_OPTION_COLUMNS: ColumnDef<ComboOption>[] = [
    {
        id: 'id',
        accessorKey: 'id',
        header: () => <span>ID</span>,
    },
    {
        id: 'comboKey',
        accessorKey: 'comboKey',
        header: () => <span>Combo Key</span>,
    },
    {
        id: 'label',
        accessorKey: 'label',
        header: () => <span>Etiqueta</span>,
    },
    {
        id: 'order',
        accessorKey: 'order',
        header: () => <span>Orden</span>,
    },
];
