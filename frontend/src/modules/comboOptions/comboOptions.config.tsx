/**
 * Combo Options — Master record config (GLOSSARY.md, ADR-0003).
 * Flat catalogue: local-mode list (client-side paging/sorting, no gridify),
 * `getByKey` composed through the config's extraService extension point.
 * Copy moves verbatim from the deleted clone files.
 */
import { z } from 'zod';

import { apiClient } from '@/api/apiClient';
import { createMasterRecordModule } from '@/master-records/createMasterRecordModule';
import type { FieldConfig } from '@/components/GenericForm';
import { SelectItem } from '@/components/ui/select';

import { COMBO_OPTION_COLUMNS } from './components/comboOption.columns';
import {
    COMBO_KEYS,
    type ComboOption,
    type ComboOptionRequest,
} from './types/comboOption.type';

type ComboOptionFormValues = {
    comboKey: string;
    label: string;
    order: string;
};

/** Mirror of ComboOptionService rules: ComboKey required ("ComboKey es obligatoria")
 *  and Label required ("Label es obligatoria"). Order is a non-negative integer. */
const comboOptionSchema = z.object({
    comboKey: z.string().min(1, 'ComboKey es obligatoria'),
    label: z.string().trim().min(1, 'La etiqueta es obligatoria'),
    order: z.string().trim().regex(/^\d+$/, 'El orden debe ser un número'),
});

const comboOptionFields: FieldConfig<ComboOptionFormValues>[] = [
    {
        name: 'comboKey',
        label: 'Combo Key',
        formField: 'select',
        colSpan: 6,
        children: Object.values(COMBO_KEYS).map((key) => (
            <SelectItem key={key} value={key}>
                {key}
            </SelectItem>
        )),
    },
    {
        name: 'label',
        label: 'Etiqueta',
        formField: 'input',
        colSpan: 6,
    },
    {
        name: 'order',
        label: 'Orden',
        formField: 'input',
        colSpan: 12,
        description: 'Entero no negativo; 0 = automático por orden de creación',
    },
];

const comboOptionModule = createMasterRecordModule<
    ComboOption,
    ComboOptionRequest,
    ComboOptionFormValues,
    { getByKey: (comboKey: string) => Promise<ComboOption[]> }
>({
    resource: 'combo-options',
    route: 'comboOptions',
    queryKey: 'comboOptions',
    extraQueryKeys: ['combo-options'],
    nameField: 'label',
    list: { mode: 'local', pageSize: 10 },
    labels: {
        title: 'Opciones de Combo',
        singular: 'Opción de Combo',
        create: 'Nueva Opción',
        createTitle: 'Nueva Opción de Combo',
        updateTitle: 'Actualización de Opción de Combo',
        toastCreated: 'Opción creada',
        toastUpdated: 'Opción actualizada',
        toastDeleted: 'Opción eliminada',
        deleteTitle: '¿Eliminar Opción de Combo?',
        deleteDescription: (comboOption) =>
            'Estás a punto de eliminar la opción "' +
            comboOption.label +
            '" de ' +
            comboOption.comboKey +
            '.',
        saveError: 'Ocurrió un error al guardar la opción',
        deleteError: 'Ocurrió un error al intentar eliminar la opción',
    },
    columns: COMBO_OPTION_COLUMNS,
    schema: comboOptionSchema,
    fields: comboOptionFields,
    initialValues: { comboKey: '', label: '', order: '0' },
    toFormValues: (comboOption) => ({
        comboKey: comboOption.comboKey,
        label: comboOption.label,
        order: String(comboOption.order),
    }),
    toRequest: (values) => ({
        comboKey: values.comboKey,
        label: values.label.trim(),
        order: Number(values.order) || 0,
    }),
    extraService: (base) => ({
        ...base,
        /** Items of one combo set (GET /combo-options/{comboKey}). */
        getByKey: async (comboKey: string): Promise<ComboOption[]> => {
            const response = await apiClient.get<ComboOption[]>(`combo-options/${comboKey}`);
            return response.data;
        },
    }),
});

export const comboOptionService = comboOptionModule.service;
export const ComboOptionTablePage = comboOptionModule.TablePage;
export const CreateComboOptionPage = comboOptionModule.CreatePage;
export const UpdateComboOptionPage = comboOptionModule.UpdatePage;
