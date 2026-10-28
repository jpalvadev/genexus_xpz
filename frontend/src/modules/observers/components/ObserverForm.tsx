import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { z } from 'zod';

import GenericForm, { type FieldConfig } from '@/components/GenericForm';
import Loading from '@/components/Loading';
import { SelectItem } from '@/components/ui/select';
import { MultiSelectItems } from '@/components/form/FormMultiSelect';
import extractErrors from '@/utils/extractErrors';
import type { FormMode } from '@/types/FormMode.type';
import { plantService } from '@/modules/plants/services/plant.service';

import { observerService } from '../services/observer.service';
import { OBSERVER_POSTS, type Observer, type ObserverRequest } from '../types/observer.type';

type ObserverFormValues = {
    legajo: string;
    fullName: string;
    objective: string;
    post: string;
    active: boolean;
    plantIds: string[];
};

/** Mirror of the backend ObserverService rules: FullName required (400 "FullName is
 *  required"), Objective required (model binding), Legajo unique ("Legajo already
 *  exists"). Legajo is numeric; Post is limited to the ObserverPost enum values. */
const observerSchema = z.object({
    legajo: z.string().trim().regex(/^\d+$/, 'Legajo must be a number'),
    fullName: z.string().trim().min(1, 'FullName is required'),
    objective: z.string().trim().min(1, 'Objective is required'),
    post: z
        .string()
        .refine((v) => v === '1' || v === '2' || v === '3', {
            message: 'Post is required',
        }),
    active: z.boolean(),
    plantIds: z.array(z.string()),
});

type ObserverFormProps = {
    initialData?: Observer;
    mode: FormMode;
};

export default function ObserverForm({ initialData, mode }: ObserverFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const plantsQuery = useQuery({ queryKey: ['plants'], queryFn: plantService.getAll });

    const { mutate, isPending } = useMutation({
        mutationFn: async (values: ObserverFormValues) => {
            const request: ObserverRequest = {
                legajo: Number(values.legajo),
                fullName: values.fullName.trim(),
                objective: values.objective.trim(),
                post: Number(values.post),
                active: values.active,
                plantIds: values.plantIds.map(Number),
            };
            if (mode === 'create') {
                return observerService.create(request);
            }
            if (mode === 'update' && initialData) {
                await observerService.update(initialData.id, request);
                return null;
            }
            return Promise.reject(new Error('Modo de formulario inválido'));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['observers'] });
            toast.success(mode === 'create' ? 'Observador creado' : 'Observador actualizado');
            router.invalidate();
            router.navigate({ to: '/observers' });
        },
        onError: (error: AxiosError) => {
            extractErrors(error, 'Ocurrió un error al guardar el observador');
        },
    });

    if (plantsQuery.isPending || isPending) return <Loading />;

    const plants = plantsQuery.data ?? [];

    const fields: FieldConfig<ObserverFormValues>[] = [
        {
            name: 'legajo',
            label: 'Legajo',
            formField: 'input',
            colSpan: 6,
        },
        {
            name: 'fullName',
            label: 'Nombre completo',
            formField: 'input',
            colSpan: 6,
        },
        {
            name: 'objective',
            label: 'Objetivo',
            formField: 'textarea',
            colSpan: 12,
        },
        {
            name: 'post',
            label: 'Cargo',
            formField: 'select',
            colSpan: 6,
            children: OBSERVER_POSTS.map((post) => (
                <SelectItem key={post.value} value={String(post.value)}>
                    {post.label}
                </SelectItem>
            )),
        },
        {
            name: 'active',
            label: 'Activo',
            formField: 'checkbox',
            colSpan: 6,
        },
        {
            name: 'plantIds',
            label: 'Plantas',
            formField: 'multi-select',
            colSpan: 12,
            children: (
                <MultiSelectItems
                    cacheKey="plants-all"
                    fetchFn={async () => {
                        const data = await plantService.getAll();
                        return { data, rowCount: data.length };
                    }}
                    mapConfig={{ value: 'id', label: 'name' }}
                    initialItems={plants
                        .filter((plant) => (initialData?.plantIds ?? []).includes(plant.id))
                        .map((plant) => ({ value: plant.id, label: plant.name }))}
                    pageSize={50}
                />
            ),
        },
    ];

    const initialFormValues: ObserverFormValues = {
        legajo: initialData ? String(initialData.legajo) : '',
        fullName: initialData?.fullName ?? '',
        objective: initialData?.objective ?? '',
        post: initialData ? String(initialData.post) : '',
        active: initialData?.active ?? true,
        plantIds: (initialData?.plantIds ?? []).map(String),
    };

    return (
        <GenericForm<ObserverFormValues>
            initialData={initialFormValues}
            fields={fields}
            schema={observerSchema as never}
            isPending={isPending}
            onSubmit={mutate}
            mode={mode}
        />
    );
}
