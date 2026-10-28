import GenericForm, { type FieldConfig } from '@/components/GenericForm';
import Loading from '@/components/Loading';
import { SelectItem } from '@/components/ui/select';
import { MultiSelectItems } from '@/components/form/FormMultiSelect';
import { equipmentItemService } from '@/modules/equipmentItems/services/equipmentItem.service';
import { personService } from '@/modules/persons/services/person.service';
import type { FormMode } from '@/types/FormMode.type';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    equipmentMaintenanceSchema,
    equipmentMaintenanceType,
    equipmentMaintenanceStatus,
    type EquipmentMaintenance,
    type EquipmentMaintenanceResponse,
} from '../types/equipmentMaintenance.type';
import { equipmentMaintenanceService } from '../services/equipmentMaintenance.service';
import { toast } from 'sonner';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import EquipmentStatusDialog from './EquipmentStatusDialog';

type EquipmentMaintenanceFormProps = {
    initialData?: EquipmentMaintenanceResponse;
    mode: FormMode;
};

export default function EquipmentMaintenanceForm({
    initialData,
    ...rest
}: EquipmentMaintenanceFormProps) {
    const router = useRouter();
    const canGoBack = useCanGoBack();
    const queryClient = useQueryClient();

    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [pendingSubmitValues, setPendingSubmitValues] =
        useState<EquipmentMaintenance | null>(null);

    const data: EquipmentMaintenance = {
        id: 0,
        date: '',
        type: 1,
        status: 1,
        activity: '',
        ...initialData,
        equipmentItemId: initialData?.equipmentItem?.id || 0,
        personId: initialData?.person?.id || 0,
    };

    const handleBeforeSubmit = async (
        values: EquipmentMaintenance,
    ): Promise<boolean> => {
        if (
            values.type === equipmentMaintenanceType.Correctivo &&
            values.status === equipmentMaintenanceStatus.Completado
        ) {
            setPendingSubmitValues(values);
            setShowStatusDialog(true);
            return false;
        }
        return true;
    };

    const handleStatusSelected = async (status: number) => {
        setShowStatusDialog(false);
        if (pendingSubmitValues) {
            await mutate({
                ...pendingSubmitValues,
                equipmentStatus: status as any,
            });
        }
    };

    const handleCancelStatus = () => {
        setShowStatusDialog(false);
    };

    const { mutate, isPending } = useMutation({
        mutationFn: async (equipmentMaintenance: EquipmentMaintenance) => {
            if (rest.mode === 'create')
                return equipmentMaintenanceService.create(equipmentMaintenance);
            if (rest.mode === 'update') {
                await equipmentMaintenanceService.update(equipmentMaintenance);
                return equipmentMaintenance;
            }
            if (rest.mode === 'delete')
                return equipmentMaintenanceService.deleteById(
                    equipmentMaintenance.id,
                );
            return Promise.reject();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['equipmentMaintenances'],
            });
            const messages = {
                create: 'Registro creado correctamente',
                update: 'Registro actualizado correctamente',
                delete: 'Registro eliminado correctamente',
                view: '',
            };
            toast.success(messages[rest.mode]);
            if (canGoBack) router.history.back();
        },
        onError: () => toast.error('Ocurrió un error'),
        onSettled: () => {
            router.navigate({ to: '/equipmentMaintenances' });
        },
    });

    if (isPending) return <Loading />;

    const fields: FieldConfig<EquipmentMaintenance>[] = [
        {
            name: 'date',
            label: 'Fecha',
            formField: 'date',
        },
        {
            name: 'type',
            label: 'Tipo',
            formField: 'select',
            children: Object.entries(equipmentMaintenanceType).map(
                ([key, value]) => (
                    <SelectItem key={value} value={value.toString()}>
                        {key}
                    </SelectItem>
                ),
            ),
        },
        {
            name: 'status',
            label: 'Estado',
            formField: 'select',
            children: Object.entries(equipmentMaintenanceStatus).map(
                ([key, value]) => (
                    <SelectItem key={value} value={value.toString()}>
                        {key}
                    </SelectItem>
                ),
            ),
        },
        {
            name: 'activity',
            label: 'Actividad',
            formField: 'textarea',
            colSpan: 12,
        },
        {
            name: 'closedAt',
            label: 'Cerrado',
            formField: 'date',
        },
        {
            name: 'equipmentItemId',
            label: 'Equipo',
            formField: 'multi-select',
            single: true,
            placeholder: 'Seleccionar equipo...',
            children: (
                <MultiSelectItems
                    cacheKey="equipmentItems"
                    fetchFn={equipmentItemService.getAllPaginated}
                    mapConfig={{ value: 'id', label: 'name' }}
                    renderLabel={(item) => `${item.code} - ${item.name}`}
                    initialItems={
                        initialData?.equipmentItem
                            ? [
                                  {
                                      value: initialData.equipmentItem.id,
                                      label: `${initialData.equipmentItem.code} - ${initialData.equipmentItem.name}`,
                                  },
                              ]
                            : []
                    }
                    pageSize={20}
                />
            ),
        },
        {
            name: 'personId',
            label: 'Responsable',
            formField: 'multi-select',
            single: true,
            placeholder: 'Seleccionar responsable...',
            children: (
                <MultiSelectItems
                    cacheKey="persons"
                    fetchFn={personService.getAllPaginated}
                    mapConfig={{ value: 'id', label: 'lastName' }}
                    renderLabel={(person) => `${person.lastName}, ${person.firstName}`}
                    initialItems={
                        initialData?.person
                            ? [
                                  {
                                      value: initialData.person.id,
                                      label: `${initialData.person.lastName}, ${initialData.person.firstName}`,
                                  },
                              ]
                            : []
                    }
                    pageSize={20}
                />
            ),
        },
    ];

    return (
        <>
            <GenericForm<EquipmentMaintenance>
                initialData={data}
                fields={fields}
                schema={equipmentMaintenanceSchema}
                isPending={isPending}
                onSubmit={mutate}
                onBeforeSubmit={handleBeforeSubmit}
                {...rest}
            />
            <EquipmentStatusDialog
                open={showStatusDialog}
                onStatusSelected={handleStatusSelected}
                onCancel={handleCancelStatus}
            />
        </>
    );
}
