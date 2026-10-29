import GenericForm, { type FieldConfig } from '@/components/GenericForm';
import Loading from '@/components/Loading';
import { SelectItem } from '@/components/ui/select';
import { MultiSelectItems } from '@/components/form/FormMultiSelect';
import { plantService } from '@/modules/plants/plant.config';
import { sectorService } from '@/modules/sectors/sector.config';
import { contractorCompanyService } from '@/modules/contractorCompanies/contractorCompanies.config';
import { comboOptionService } from '@/modules/comboOptions/comboOptions.config';
import { observerService } from '@/modules/observers/services/observer.service';
import type { FormMode } from '@/types/FormMode.type';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import extractErrors from '@/utils/extractErrors';

import type {
    SecurityObservationFormValues,
    SecurityObservationResponse,
} from '../types/securityObservation.type';
import {
    MULTI_SELECT_LABELS,
    SAFETY_REVIEW_FIELDS,
    emptySecurityObservationFormValues,
    observationDateWindow,
    securityObservationFormValuesToRequest,
    securityObservationSchema,
    securityObservationToFormValues,
} from '../types/securityObservation.type';
import { securityObservationService } from '../services/securityObservation.service';

type SecurityObservationFormProps = {
    initialData?: SecurityObservationResponse;
    mode: FormMode;
};

/** Spanish labels for the combo MultiSelect fields; the English rule label is shown
 *  beside it so validation messages ("At least one label is required for …") read true. */
const COMBO_FIELD_LABELS: Record<keyof typeof MULTI_SELECT_LABELS, string> = {
    gestionRiesgo: 'Gestión de Riesgo',
    protocolosMortales: 'Protocolos Mortales',
    clasificacionObservacion: 'Clasificación de Observación',
    relacionObservacion: 'Relación de Observación',
};

/** Combo MultiSelects work on the combo catalogue (GET /combo-options/{key}). */
function comboFetchFn(comboKey: string) {
    return async () => {
        const items = await comboOptionService.getByKey(comboKey);
        return { data: items, rowCount: items.length };
    };
}

export default function SecurityObservationForm({
    initialData,
    mode,
}: SecurityObservationFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const plantsQuery = useQuery({ queryKey: ['plants'], queryFn: plantService.getAll });
    const sectorsQuery = useQuery({ queryKey: ['sectors'], queryFn: sectorService.getAll });
    const companiesQuery = useQuery({
        queryKey: ['contractorCompanies'],
        queryFn: contractorCompanyService.getAll,
    });
    const combosQuery = useQuery({
        queryKey: ['comboOptions'],
        queryFn: comboOptionService.getAll,
    });

    const mastersLoading =
        plantsQuery.isPending ||
        sectorsQuery.isPending ||
        companiesQuery.isPending ||
        combosQuery.isPending;

    const combos = useMemo(() => combosQuery.data ?? [], [combosQuery.data]);

    const initialFormValues = useMemo<SecurityObservationFormValues>(
        () =>
            initialData
                ? securityObservationToFormValues(initialData, combos)
                : emptySecurityObservationFormValues(),
        [initialData, combos],
    );

    const { mutate, isPending } = useMutation({
        mutationFn: async (values: SecurityObservationFormValues) => {
            const request = securityObservationFormValuesToRequest(values, combos);
            if (mode === 'create') {
                return securityObservationService.create(request);
            }
            if (mode === 'update' && initialData) {
                await securityObservationService.update(initialData.id, request);
                return null;
            }
            return Promise.reject(new Error('Modo de formulario inválido'));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['securityObservations'] });
            toast.success(
                mode === 'create'
                    ? 'Observación creada correctamente'
                    : 'Observación actualizada correctamente',
            );
            router.invalidate();
            router.navigate({ to: '/securityObservations' });
        },
        onError: (error: AxiosError) => {
            extractErrors(error, 'Ocurrió un error al guardar la observación');
        },
    });

    if (isPending || mastersLoading) return <Loading />;

    const { min, max } = observationDateWindow();

    const fields: FieldConfig<SecurityObservationFormValues>[] = [
        { name: 'sepObservation', label: 'Observación', formField: 'separator', colSpan: 12 } as unknown as FieldConfig<SecurityObservationFormValues>,
        {
            name: 'observationDate',
            label: 'Fecha de Observación',
            formField: 'date',
            colSpan: 6,
            description: `Rango permitido: ${min} a ${max}`,
        },
        {
            name: 'plantId',
            label: 'Planta',
            formField: 'select',
            colSpan: 6,
            children: plantsQuery.data?.map((plant) => (
                <SelectItem key={plant.id} value={String(plant.id)}>
                    {plant.name}
                </SelectItem>
            )),
        },
        {
            name: 'sectorId',
            label: 'Sector',
            formField: 'select',
            colSpan: 6,
            children: sectorsQuery.data?.map((sector) => (
                <SelectItem key={sector.id} value={String(sector.id)}>
                    {sector.name}
                </SelectItem>
            )),
        },
        {
            name: 'contractorCompanyId',
            label: 'Empresa Contratista',
            formField: 'select',
            colSpan: 6,
            description: 'Opcional',
            children: companiesQuery.data?.map((company) => (
                <SelectItem key={company.id} value={String(company.id)}>
                    {company.name}
                </SelectItem>
            )),
        },
        { name: 'task', label: 'Tarea', formField: 'input', colSpan: 6 },
        { name: 'lugar', label: 'Lugar', formField: 'input', colSpan: 6 },
        {
            name: 'observers',
            label: 'Observadores',
            formField: 'multi-select',
            colSpan: 12,
            placeholder: 'Buscar observador activo por nombre...',
            children: (
                <MultiSelectItems
                    cacheKey="observers-active"
                    fetchFn={observerService.lookup}
                    mapConfig={{ value: 'id', label: 'fullName' }}
                    renderLabel={(observer) => `${observer.fullName} — ${observer.legajo}`}
                    initialItems={
                        initialData?.observers.map((observer) => ({
                            value: observer.id,
                            label: `${observer.fullName} — ${observer.legajo}`,
                        })) ?? []
                    }
                    pageSize={30}
                />
            ),
        },

        {
            name: 'sepSafety',
            label: 'Safety Review',
            formField: 'separator',
            colSpan: 12,
            description: 'Todas las preguntas deben responderse (Sí/No)',
        } as unknown as FieldConfig<SecurityObservationFormValues>,
        ...SAFETY_REVIEW_FIELDS.map(({ key, label }) => ({
            name: key,
            label,
            formField: 'checkbox' as const,
            colSpan: 4,
        })),

        { name: 'sepLabels', label: 'Labels', formField: 'separator', colSpan: 12 } as unknown as FieldConfig<SecurityObservationFormValues>,
        ...(
            Object.keys(MULTI_SELECT_LABELS) as (keyof typeof MULTI_SELECT_LABELS)[]
        ).map((key) => ({
            name: key,
            label: `${COMBO_FIELD_LABELS[key]} (${MULTI_SELECT_LABELS[key]})`,
            formField: 'multi-select' as const,
            colSpan: 6,
            children: (
                <MultiSelectItems
                    cacheKey={`combo-${key}`}
                    fetchFn={comboFetchFn(key)}
                    mapConfig={{ value: 'id', label: 'label' }}
                    initialItems={
                        initialData
                            ? combos
                                  .filter(
                                      (item) =>
                                          item.comboKey === key &&
                                          (initialData[key] as string[]).includes(item.label),
                                  )
                                  .map((item) => ({ value: item.id, label: item.label }))
                            : []
                    }
                    pageSize={50}
                />
            ),
        })),
        { name: 'sepDetail', label: 'Detalle', formField: 'separator', colSpan: 12 } as unknown as FieldConfig<SecurityObservationFormValues>,
        {
            name: 'controlesCriticos',
            label: 'Controles Críticos',
            formField: 'textarea',
            colSpan: 12,
            description: 'Opcional',
        },
        { name: 'resumenObservacion', label: 'Resumen de la Observación', formField: 'textarea', colSpan: 12 },
        { name: 'detalleAI', label: 'Acción Detallada (AI)', formField: 'textarea', colSpan: 12 },
        { name: 'descripcionAC', label: 'Descripción de Acción Inmediata (AC)', formField: 'textarea', colSpan: 12 },
    ];

    return (
        <GenericForm<SecurityObservationFormValues>
            initialData={initialFormValues}
            fields={fields}
            schema={securityObservationSchema as never}
            isPending={isPending}
            onSubmit={mutate}
            mode={mode}
        />
    );
}
