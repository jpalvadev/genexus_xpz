import CreateObserverFormPage from '@/modules/observers/views/CreateObserverFormPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/observers/new')({
    component: CreateObserverFormPage,
});
