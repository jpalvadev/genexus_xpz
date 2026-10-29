import { createFileRoute } from '@tanstack/react-router';

import { CreateObserverPage } from '@/modules/observers/observers.config';

export const Route = createFileRoute('/_layout/observers/new')({
    component: CreateObserverPage,
});
