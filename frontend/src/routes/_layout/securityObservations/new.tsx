import CreateSecurityObservationFormPage from '@/modules/securityObservations/views/CreateSecurityObservationFormPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/securityObservations/new')({
    component: CreateSecurityObservationFormPage,
});
