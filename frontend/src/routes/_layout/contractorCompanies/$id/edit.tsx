import { createFileRoute } from '@tanstack/react-router';

import Loading from '@/components/Loading';
import EditContractorCompanyPage from '@/modules/contractorCompanies/views/EditContractorCompanyPage';
import { contractorCompanyService } from '@/modules/contractorCompanies/contractorCompanies.config';

export const Route = createFileRoute('/_layout/contractorCompanies/$id/edit')({
    loader: ({ params }) => contractorCompanyService.getById(+params.id),
    pendingComponent: () => <Loading />,
    pendingMs: 250,
    component: EditContractorCompanyPage,
});
