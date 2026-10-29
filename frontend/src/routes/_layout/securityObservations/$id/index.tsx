import Loading from '@/components/Loading';
import { securityObservationService } from '@/modules/securityObservations/services/securityObservation.service';
import GetSecurityObservationByIdFormPage from '@/modules/securityObservations/views/GetSecurityObservationByIdFormPage';

import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/_layout/securityObservations/$id/')({
    loader: ({ params }) => securityObservationService.getById(+params.id),
    pendingComponent: () => <Loading />,
    pendingMs: 250,
    component: GetSecurityObservationByIdFormPage,
});
