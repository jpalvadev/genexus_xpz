import PlantTablePage from '@/modules/plants/views/PlantTablePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/plants/')({
    component: PlantTablePage,
});
