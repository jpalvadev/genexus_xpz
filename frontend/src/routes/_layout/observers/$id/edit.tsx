import Loading from '@/components/Loading';
import { observerService } from '@/modules/observers/services/observer.service';
import UpdateObserverFormPage from '@/modules/observers/views/UpdateObserverFormPage';

import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/_layout/observers/$id/edit')({
    loader: ({ params }) => observerService.getById(+params.id),
    pendingComponent: () => <Loading />,
    pendingMs: 250,
    component: UpdateObserverFormPage,
});
