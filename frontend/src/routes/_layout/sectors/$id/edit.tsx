import { createFileRoute } from '@tanstack/react-router';

import Loading from '@/components/Loading';
import EditSectorPage from '@/modules/sectors/views/EditSectorPage';
import { sectorService } from '@/modules/sectors/sector.config';

export const Route = createFileRoute('/_layout/sectors/$id/edit')({
    loader: ({ params }) => sectorService.getById(+params.id),
    pendingComponent: () => <Loading />,
    pendingMs: 250,
    component: EditSectorPage,
});
