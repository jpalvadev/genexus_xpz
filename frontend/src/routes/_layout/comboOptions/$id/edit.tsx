import { createFileRoute } from '@tanstack/react-router';

import Loading from '@/components/Loading';
import EditComboOptionPage from '@/modules/comboOptions/views/EditComboOptionPage';
import { comboOptionService } from '@/modules/comboOptions/comboOptions.config';

export const Route = createFileRoute('/_layout/comboOptions/$id/edit')({
    loader: ({ params }) => comboOptionService.getById(+params.id),
    pendingComponent: () => <Loading />,
    pendingMs: 250,
    component: EditComboOptionPage,
});
