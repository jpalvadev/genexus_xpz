import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { z } from 'zod';

import GenericForm, { type FieldConfig } from '@/components/GenericForm';
import extractErrors from '@/utils/extractErrors';
import type { FormMode } from '@/types/FormMode.type';

import { plantService } from '../services/plant.service';
import type { Plant, PlantRequest } from '../types/plant.type';

type PlantFormValues = {
    name: string;
};

const plantSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
});

const fields: FieldConfig<PlantFormValues>[] = [
    {
        name: 'name',
        label: 'Nombre',
        formField: 'input',
        colSpan: 12,
    },
];

type PlantFormProps = {
    initialData?: Plant;
    mode: FormMode;
};

export default function PlantForm({ initialData, mode }: PlantFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: async (values: PlantFormValues) => {
            const request: PlantRequest = { name: values.name.trim() };
            if (mode === 'create') {
                return plantService.create(request);
            }
            if (mode === 'update' && initialData) {
                await plantService.update(initialData.id, request);
                return null;
            }
            return Promise.reject(new Error('Modo de formulario inválido'));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plants'] });
            toast.success(
                mode === 'create' ? 'Planta creado' : 'Planta actualizado',
            );
            router.invalidate();
            router.navigate({ to: '/plants' });
        },
        onError: (error: AxiosError) => {
            extractErrors(error, 'Ocurrió un error al guardar el registro');
        },
    });

    const initialFormValues: PlantFormValues = {
        name: initialData?.name ?? '',
    };

    return (
        <GenericForm<PlantFormValues>
            initialData={initialFormValues}
            fields={fields}
            schema={plantSchema as never}
            isPending={isPending}
            onSubmit={mutate}
            mode={mode}
        />
    );
}
