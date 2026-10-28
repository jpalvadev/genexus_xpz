import type { SecurityObservationFilters } from '@/modules/securityObservations/types/securityObservation.type';
import SecurityObservationsTablePage from '@/modules/securityObservations/views/SecurityObservationsTablePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/securityObservations/')({
    component: SecurityObservationsTablePage,
    validateSearch: () => ({}) as SecurityObservationFilters,
});
