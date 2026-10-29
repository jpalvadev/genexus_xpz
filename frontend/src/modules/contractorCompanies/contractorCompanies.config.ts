/**
 * Contractor Company — Master record config (GLOSSARY.md, ADR-0003).
 * The grid, create, edit and delete screens are produced by the Master record
 * module from this config; copy moves verbatim from the deleted clone files.
 */
import { z } from 'zod';

import { createMasterRecordModule } from '@/master-records/createMasterRecordModule';
import type { FieldConfig } from '@/components/GenericForm';

import { CONTRACTORCOMPANY_COLUMNS } from './components/contractorCompany.columns';
import type {
    ContractorCompany,
    ContractorCompanyRequest,
} from './types/contractorCompany.type';

type ContractorCompanyFormValues = {
    name: string;
};

const contractorCompanySchema = z.object({
    name: z.string().trim().min(1, 'Nombre es obligatorio'),
});

const contractorCompanyFields: FieldConfig<ContractorCompanyFormValues>[] = [
    {
        name: 'name',
        label: 'Nombre',
        formField: 'input',
        colSpan: 12,
    },
];

const contractorCompanyModule = createMasterRecordModule<
    ContractorCompany,
    ContractorCompanyRequest,
    ContractorCompanyFormValues
>({
    resource: 'contractor-companies',
    route: 'contractorCompanies',
    queryKey: 'contractorCompanies',
    nameField: 'name',
    list: { mode: 'gridify', order: 'name asc' },
    labels: {
        title: 'Empresas Contratistas',
        singular: 'Empresa contratista',
        create: 'Nueva Empresa Contratista',
        createTitle: 'Nueva Empresa Contratista',
        updateTitle: 'Actualización de Empresa contratista',
        toastCreated: 'Empresa contratista creado',
        toastUpdated: 'Empresa contratista actualizado',
        toastDeleted: 'empresa contratista eliminado/a',
        deleteTitle: '¿Eliminar Empresa contratista?',
        deleteDescription: (contractorCompany) =>
            'Estás a punto de eliminar el registro #' +
            contractorCompany.id +
            ' (' +
            contractorCompany.name +
            ').',
        saveError: 'Ocurrió un error al guardar el registro',
        deleteError: 'Ocurrió un error al intentar eliminar el registro',
    },
    columns: CONTRACTORCOMPANY_COLUMNS,
    schema: contractorCompanySchema,
    fields: contractorCompanyFields,
    initialValues: { name: '' },
    toFormValues: (contractorCompany) => ({ name: contractorCompany.name }),
    toRequest: (values) => ({ name: values.name.trim() }),
});

export const contractorCompanyService = contractorCompanyModule.service;
export const ContractorCompanyTablePage = contractorCompanyModule.TablePage;
export const CreateContractorCompanyPage = contractorCompanyModule.CreatePage;
export const UpdateContractorCompanyPage = contractorCompanyModule.UpdatePage;
