import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { z } from 'zod';

import GenericForm, { type FieldConfig } from '@/components/GenericForm';
import extractErrors from '@/utils/extractErrors';
import type { FormMode } from '@/types/FormMode.type';

import { sectorService } from '../services/sector.service';
import type { Sector, SectorRequest } from '../types/sector.type';

type SectorFormValues = {
    name: string;
};

const sectorSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
});

const fields: FieldConfig<SectorFormValues>[] = [
    {
        name: 'name',
        label: 'Nombre',
        formField: 'input',
        colSpan: 12,
    },
];

type SectorFormProps = {
    initialData?: Sector;
    mode: FormMode;
};

export default function SectorForm({ initialData, mode }: SectorFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: async (values: SectorFormValues) => {
            const request: SectorRequest = { name: values.name.trim() };
            if (mode === 'create') {
                return sectorService.create(request);
            }
            if (mode === 'update' && initialData) {
                await sectorService.update(initialData.id, request);
                return null;
            }
            return Promise.reject(new Error('Modo de formulario inválido'));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sectors'] });
            toast.success(
                mode === 'create' ? 'Sector creado' : 'Sector actualizado',
            );
            router.invalidate();
            router.navigate({ to: '/sectors' });
        },
        onError: (error: AxiosError) => {
            extractErrors(error, 'Ocurrió un error al guardar el registro');
        },
    });

    const initialFormValues: SectorFormValues = {
        name: initialData?.name ?? '',
    };

    return (
        <GenericForm<SectorFormValues>
            initialData={initialFormValues}
            fields={fields}
            schema={sectorSchema as never}
            isPending={isPending}
            onSubmit={mutate}
            mode={mode}
        />
    );
}
