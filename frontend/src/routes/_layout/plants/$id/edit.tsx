import Loading from '@/components/Loading';
import { plantService } from '@/modules/plants/services/plant.service';
import UpdatePlantFormPage from '@/modules/plants/views/UpdatePlantFormPage';

import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/_layout/plants/$id/edit')({
    loader: ({ params }) => plantService.getById(+params.id),
    pendingComponent: () => <Loading />,
    pendingMs: 250,
    component: UpdatePlantFormPage,
});
