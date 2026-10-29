import { createFileRoute } from '@tanstack/react-router';

import { SectorTablePage } from '@/modules/sectors/sector.config';

export const Route = createFileRoute('/_layout/sectors/')({
    component: SectorTablePage,
});
