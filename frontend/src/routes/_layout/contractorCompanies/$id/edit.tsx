import Loading from '@/components/Loading';
import { contractorCompanyService } from '@/modules/contractorCompanies/services/contractorCompany.service';
import UpdateContractorCompanyFormPage from '@/modules/contractorCompanies/views/UpdateContractorCompanyFormPage';

import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/_layout/contractorCompanies/$id/edit')({
    loader: ({ params }) => contractorCompanyService.getById(+params.id),
    pendingComponent: () => <Loading />,
    pendingMs: 250,
    component: UpdateContractorCompanyFormPage,
});
