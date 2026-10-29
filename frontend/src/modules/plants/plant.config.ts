/**
 * Plant — Master record config (GLOSSARY.md, ADR-0003).
 * The grid, create, edit and delete screens are produced by the Master record
 * module from this config; copy moves verbatim from the deleted clone files.
 */
import { z } from 'zod';

import { createMasterRecordModule } from '@/master-records/createMasterRecordModule';
import type { FieldConfig } from '@/components/GenericForm';

import { PLANT_COLUMNS } from './components/plant.columns';
import type { Plant, PlantRequest } from './types/plant.type';

type PlantFormValues = {
    name: string;
};

const plantSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
});

const plantFields: FieldConfig<PlantFormValues>[] = [
    {
        name: 'name',
        label: 'Nombre',
        formField: 'input',
        colSpan: 12,
    },
];

const plantModule = createMasterRecordModule<Plant, PlantRequest, PlantFormValues>({
    resource: 'plants',
    route: 'plants',
    queryKey: 'plants',
    nameField: 'name',
    list: { mode: 'gridify', order: 'name asc' },
    labels: {
        title: 'Plantas',
        singular: 'Planta',
        create: 'Nueva Planta',
        createTitle: 'Nueva Planta',
        updateTitle: 'Actualización de Planta',
        toastCreated: 'Planta creado',
        toastUpdated: 'Planta actualizado',
        toastDeleted: 'planta eliminado/a',
        deleteTitle: '¿Eliminar Planta?',
        deleteDescription: (plant) =>
            'Estás a punto de eliminar el registro #' + plant.id + ' (' + plant.name + ').',
        saveError: 'Ocurrió un error al guardar el registro',
        deleteError: 'Ocurrió un error al intentar eliminar el registro',
    },
    columns: PLANT_COLUMNS,
    schema: plantSchema,
    fields: plantFields,
    initialValues: { name: '' },
    toFormValues: (plant) => ({ name: plant.name }),
    toRequest: (values) => ({ name: values.name.trim() }),
});

export const plantService = plantModule.service;
export const PlantTablePage = plantModule.TablePage;
export const CreatePlantPage = plantModule.CreatePage;
export const UpdatePlantPage = plantModule.UpdatePage;
