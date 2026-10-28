import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { z } from 'zod';

import GenericForm, { type FieldConfig } from '@/components/GenericForm';
import extractErrors from '@/utils/extractErrors';
import type { FormMode } from '@/types/FormMode.type';

import { contractorCompanyService } from '../services/contractorCompany.service';
import type { ContractorCompany, ContractorCompanyRequest } from '../types/contractorCompany.type';

type ContractorCompanyFormValues = {
    name: string;
};

const contractorCompanySchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
});

const fields: FieldConfig<ContractorCompanyFormValues>[] = [
    {
        name: 'name',
        label: 'Nombre',
        formField: 'input',
        colSpan: 12,
    },
];

type ContractorCompanyFormProps = {
    initialData?: ContractorCompany;
    mode: FormMode;
};

export default function ContractorCompanyForm({ initialData, mode }: ContractorCompanyFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: async (values: ContractorCompanyFormValues) => {
            const request: ContractorCompanyRequest = { name: values.name.trim() };
            if (mode === 'create') {
                return contractorCompanyService.create(request);
            }
            if (mode === 'update' && initialData) {
                await contractorCompanyService.update(initialData.id, request);
                return null;
            }
            return Promise.reject(new Error('Modo de formulario inválido'));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contractorCompanies'] });
            toast.success(
                mode === 'create' ? 'Empresa contratista creado' : 'Empresa contratista actualizado',
            );
            router.invalidate();
            router.navigate({ to: '/contractorCompanies' });
        },
        onError: (error: AxiosError) => {
            extractErrors(error, 'Ocurrió un error al guardar el registro');
        },
    });

    const initialFormValues: ContractorCompanyFormValues = {
        name: initialData?.name ?? '',
    };

    return (
        <GenericForm<ContractorCompanyFormValues>
            initialData={initialFormValues}
            fields={fields}
            schema={contractorCompanySchema as never}
            isPending={isPending}
            onSubmit={mutate}
            mode={mode}
        />
    );
}
