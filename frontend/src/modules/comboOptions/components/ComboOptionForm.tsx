import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { z } from 'zod';

import GenericForm, { type FieldConfig } from '@/components/GenericForm';
import { SelectItem } from '@/components/ui/select';
import extractErrors from '@/utils/extractErrors';
import type { FormMode } from '@/types/FormMode.type';

import { comboOptionService } from '../services/comboOption.service';
import { COMBO_KEYS, type ComboOption, type ComboOptionRequest } from '../types/comboOption.type';

type ComboOptionFormValues = {
    comboKey: string;
    label: string;
    order: string;
};

/** Mirror of ComboOptionService rules: ComboKey must be a known key ("Unknown combo
 *  key") and Label required ("Label is required"). Order is a non-negative integer. */
const comboOptionSchema = z.object({
    comboKey: z.string().min(1, 'Combo Key is required'),
    label: z.string().trim().min(1, 'Label is required'),
    order: z.string().trim().regex(/^\d+$/, 'Order must be a number'),
});

const fields: FieldConfig<ComboOptionFormValues>[] = [
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

type ComboOptionFormProps = {
    initialData?: ComboOption;
    mode: FormMode;
};

export default function ComboOptionForm({ initialData, mode }: ComboOptionFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: async (values: ComboOptionFormValues) => {
            const request: ComboOptionRequest = {
                comboKey: values.comboKey,
                label: values.label.trim(),
                order: Number(values.order) || 0,
            };
            if (mode === 'create') {
                return comboOptionService.create(request);
            }
            if (mode === 'update' && initialData) {
                await comboOptionService.update(initialData.id, request);
                return null;
            }
            return Promise.reject(new Error('Modo de formulario inválido'));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comboOptions'] });
            queryClient.invalidateQueries({ queryKey: ['combo-options'] });
            toast.success(
                mode === 'create' ? 'Opción creada' : 'Opción actualizada',
            );
            router.invalidate();
            router.navigate({ to: '/comboOptions' });
        },
        onError: (error: AxiosError) => {
            extractErrors(error, 'Ocurrió un error al guardar la opción');
        },
    });

    const initialFormValues: ComboOptionFormValues = {
        comboKey: initialData?.comboKey ?? '',
        label: initialData?.label ?? '',
        order: initialData ? String(initialData.order) : '0',
    };

    return (
        <GenericForm<ComboOptionFormValues>
            initialData={initialFormValues}
            fields={fields}
            schema={comboOptionSchema as never}
            isPending={isPending}
            onSubmit={mutate}
            mode={mode}
        />
    );
}
