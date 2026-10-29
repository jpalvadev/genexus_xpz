/**
 * Sector — Master record config (GLOSSARY.md, ADR-0003).
 * The grid, create, edit and delete screens are produced by the Master record
 * module from this config; copy moves verbatim from the deleted clone files.
 */
import { z } from 'zod';

import { createMasterRecordModule } from '@/master-records/createMasterRecordModule';
import type { FieldConfig } from '@/components/GenericForm';

import { SECTOR_COLUMNS } from './components/sector.columns';
import type { Sector, SectorRequest } from './types/sector.type';

type SectorFormValues = {
    name: string;
};

const sectorSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
});

const sectorFields: FieldConfig<SectorFormValues>[] = [
    {
        name: 'name',
        label: 'Nombre',
        formField: 'input',
        colSpan: 12,
    },
];

const sectorModule = createMasterRecordModule<Sector, SectorRequest, SectorFormValues>({
    resource: 'sectors',
    route: 'sectors',
    queryKey: 'sectors',
    nameField: 'name',
    list: { mode: 'gridify', order: 'name asc' },
    labels: {
        title: 'Sectores',
        singular: 'Sector',
        create: 'Nuevo Sector',
        createTitle: 'Nuevo Sector',
        updateTitle: 'Actualización de Sector',
        toastCreated: 'Sector creado',
        toastUpdated: 'Sector actualizado',
        toastDeleted: 'sector eliminado/a',
        deleteTitle: '¿Eliminar Sector?',
        deleteDescription: (sector) =>
            'Estás a punto de eliminar el registro #' + sector.id + ' (' + sector.name + ').',
        saveError: 'Ocurrió un error al guardar el registro',
        deleteError: 'Ocurrió un error al intentar eliminar el registro',
    },
    columns: SECTOR_COLUMNS,
    schema: sectorSchema,
    fields: sectorFields,
    initialValues: { name: '' },
    toFormValues: (sector) => ({ name: sector.name }),
    toRequest: (values) => ({ name: values.name.trim() }),
});

export const sectorService = sectorModule.service;
export const SectorTablePage = sectorModule.TablePage;
export const CreateSectorPage = sectorModule.CreatePage;
export const UpdateSectorPage = sectorModule.UpdatePage;
