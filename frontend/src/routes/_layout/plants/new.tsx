import { createFileRoute } from '@tanstack/react-router';

import { CreatePlantPage } from '@/modules/plants/plant.config';

export const Route = createFileRoute('/_layout/plants/new')({
    component: CreatePlantPage,
});
