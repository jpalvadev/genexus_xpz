/**
 * Observers — Master record config (GLOSSARY.md, ADR-0003).
 * Quirks expressed in config language only: the Plants multi-select is a
 * `fields` function feeding module-local ObserverPlantItems, and the Security
 * Observation picker's `lookup` composes through the extraService extension
 * point. Copy moves verbatim from the deleted clone files.
 */
import { z } from 'zod';

import { apiClient } from '@/api/apiClient';
import { createMasterRecordModule } from '@/master-records/createMasterRecordModule';
import type { FieldConfig } from '@/components/GenericForm';
import Loading from '@/components/Loading';
import { SelectItem } from '@/components/ui/select';
import { MultiSelectItems } from '@/components/form/FormMultiSelect';
import { plantService } from '@/modules/plants/plant.config';
import type { GridifyResponse } from '@/types/gridifyResponse.type';
import type { PaginatedData } from '@/types/table.type';

import { OBSERVER_COLUMNS } from './components/observer.columns';
import { OBSERVER_POSTS, type Observer, type ObserverRequest } from './types/observer.type';
import { useQuery } from '@tanstack/react-query';

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

/** Plants feed for the form's multi-select: same query, cache key, fetch
 *  function, mapping and page size the hand-rolled ObserverForm used. */
function ObserverPlantItems({ initialPlantIds }: { initialPlantIds: number[] }) {
    const plantsQuery = useQuery({ queryKey: ['plants'], queryFn: plantService.getAll });

    if (plantsQuery.isPending) return <Loading />;

    const plants = plantsQuery.data ?? [];

    return (
        <MultiSelectItems
            cacheKey="plants-all"
            fetchFn={async () => {
                const data = await plantService.getAll();
                return { data, rowCount: data.length };
            }}
            mapConfig={{ value: 'id', label: 'name' }}
            initialItems={plants
                .filter((plant) => initialPlantIds.includes(plant.id))
                .map((plant) => ({ value: plant.id, label: plant.name }))}
            pageSize={50}
        />
    );
}

const observerFields = (initialData: Observer | undefined): FieldConfig<ObserverFormValues>[] => [
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
        children: <ObserverPlantItems initialPlantIds={initialData?.plantIds ?? []} />,
    },
];

const observerModule = createMasterRecordModule<
    Observer,
    ObserverRequest,
    ObserverFormValues,
    { lookup: (params: Record<string, string>) => Promise<PaginatedData<Observer>> }
>({
    resource: 'observers',
    route: 'observers',
    queryKey: 'observers',
    nameField: 'fullName',
    list: { mode: 'gridify', order: 'fullName asc' },
    labels: {
        title: 'Observadores',
        singular: 'Observador',
        create: 'Nuevo Observador',
        createTitle: 'Nuevo Observador',
        updateTitle: 'Actualización de Observador',
        toastCreated: 'Observador creado',
        toastUpdated: 'Observador actualizado',
        toastDeleted: 'Observador eliminado',
        deleteTitle: '¿Eliminar Observador?',
        deleteDescription: (observer) =>
            'Estás a punto de eliminar el observador #' +
            observer.id +
            ' (Legajo ' +
            observer.legajo +
            ' — ' +
            observer.fullName +
            ').',
        saveError: 'Ocurrió un error al guardar el observador',
        deleteError: 'Ocurrió un error al intentar eliminar el observador',
    },
    columns: OBSERVER_COLUMNS,
    schema: observerSchema,
    fields: observerFields,
    initialValues: { legajo: '', fullName: '', objective: '', post: '', active: true, plantIds: [] },
    toFormValues: (observer) => ({
        legajo: String(observer.legajo),
        fullName: observer.fullName,
        objective: observer.objective,
        post: String(observer.post),
        active: observer.active,
        plantIds: observer.plantIds.map(String),
    }),
    toRequest: (values) => ({
        legajo: Number(values.legajo),
        fullName: values.fullName.trim(),
        objective: values.objective.trim(),
        post: Number(values.post),
        active: values.active,
        plantIds: values.plantIds.map(Number),
    }),
    extraService: (base) => ({
        ...base,
        /**
         * Feed for the Security Observation observers picker: active observers only
         * (spec), contains search on fullName driven by the MultiSelect search box.
         */
        lookup: async (params: Record<string, string>): Promise<PaginatedData<Observer>> => {
            const filters = ['active=true'];
            const term = (params.fullName ?? '').trim();
            if (term) {
                filters.push(`fullName=*${term}`);
            }
            const response = await apiClient.get<GridifyResponse<Observer>>('observers', {
                params: {
                    Page: 1,
                    PageSize: Number(params.pageSize) || 30,
                    OrderBy: 'fullName asc',
                    Filter: filters.join(','),
                },
            });
            return { data: response.data.data, rowCount: response.data.count };
        },
    }),
});

export const observerService = observerModule.service;
export const ObserverTablePage = observerModule.TablePage;
export const CreateObserverPage = observerModule.CreatePage;
export const UpdateObserverPage = observerModule.UpdatePage;
