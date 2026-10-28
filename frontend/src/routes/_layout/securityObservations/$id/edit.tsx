import Loading from '@/components/Loading';
import { securityObservationService } from '@/modules/securityObservations/services/securityObservation.service';
import UpdateSecurityObservationFormPage from '@/modules/securityObservations/views/UpdateSecurityObservationFormPage';

import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/_layout/securityObservations/$id/edit')({
    loader: ({ params }) => securityObservationService.getById(+params.id),
    pendingComponent: () => <Loading />,
    pendingMs: 250,
    component: UpdateSecurityObservationFormPage,
});
