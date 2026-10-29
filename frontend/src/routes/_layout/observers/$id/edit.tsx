import { createFileRoute } from '@tanstack/react-router';

import Loading from '@/components/Loading';
import EditObserverPage from '@/modules/observers/views/EditObserverPage';
import { observerService } from '@/modules/observers/observers.config';

export const Route = createFileRoute('/_layout/observers/$id/edit')({
    loader: ({ params }) => observerService.getById(+params.id),
    pendingComponent: () => <Loading />,
    pendingMs: 250,
    component: EditObserverPage,
});
