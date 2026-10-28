import { Route } from '@/routes/_layout/contractorCompanies/$id/edit';
import ContractorCompanyForm from '../components/ContractorCompanyForm';

const UpdateContractorCompanyFormPage = () => {
    const contractorCompany = Route.useLoaderData();

    return (
        <div className="flex flex-col h-full gap-8">
            <h1 className="text-2xl font-semibold text-center">
                Actualización de Empresa contratista
            </h1>
            <ContractorCompanyForm mode="update" initialData={contractorCompany} />
        </div>
    );
};

export default UpdateContractorCompanyFormPage;
