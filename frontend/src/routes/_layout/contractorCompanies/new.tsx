import CreateContractorCompanyFormPage from '@/modules/contractorCompanies/views/CreateContractorCompanyFormPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/contractorCompanies/new')({
    component: CreateContractorCompanyFormPage,
});
