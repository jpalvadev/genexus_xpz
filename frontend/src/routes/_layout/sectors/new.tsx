import { createFileRoute } from '@tanstack/react-router';

import { CreateSectorPage } from '@/modules/sectors/sector.config';

export const Route = createFileRoute('/_layout/sectors/new')({
    component: CreateSectorPage,
});
