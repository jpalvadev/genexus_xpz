import Loading from '@/components/Loading';
import { comboOptionService } from '@/modules/comboOptions/services/comboOption.service';
import UpdateComboOptionFormPage from '@/modules/comboOptions/views/UpdateComboOptionFormPage';

import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/_layout/comboOptions/$id/edit')({
    loader: ({ params }) => comboOptionService.getById(+params.id),
    pendingComponent: () => <Loading />,
    pendingMs: 250,
    component: UpdateComboOptionFormPage,
});
