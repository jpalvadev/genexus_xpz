import CreatePlantFormPage from '@/modules/plants/views/CreatePlantFormPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/plants/new')({
    component: CreatePlantFormPage,
});
