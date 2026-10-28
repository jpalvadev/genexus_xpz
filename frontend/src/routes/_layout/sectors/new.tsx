import CreateSectorFormPage from '@/modules/sectors/views/CreateSectorFormPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/sectors/new')({
    component: CreateSectorFormPage,
});
