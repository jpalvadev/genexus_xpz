import { createFileRoute } from '@tanstack/react-router';

import Loading from '@/components/Loading';
import EditPlantPage from '@/modules/plants/views/EditPlantPage';
import { plantService } from '@/modules/plants/plant.config';

export const Route = createFileRoute('/_layout/plants/$id/edit')({
    loader: ({ params }) => plantService.getById(+params.id),
    pendingComponent: () => <Loading />,
    pendingMs: 250,
    component: EditPlantPage,
});
