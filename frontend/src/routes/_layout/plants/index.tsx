import { createFileRoute } from '@tanstack/react-router';

import { PlantTablePage } from '@/modules/plants/plant.config';

export const Route = createFileRoute('/_layout/plants/')({
    component: PlantTablePage,
});
