import Loading from '@/components/Loading';
import { sectorService } from '@/modules/sectors/services/sector.service';
import UpdateSectorFormPage from '@/modules/sectors/views/UpdateSectorFormPage';

import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/_layout/sectors/$id/edit')({
    loader: ({ params }) => sectorService.getById(+params.id),
    pendingComponent: () => <Loading />,
    pendingMs: 250,
    component: UpdateSectorFormPage,
});
