import { createFileRoute } from '@tanstack/react-router';

import { ObserverTablePage } from '@/modules/observers/observers.config';

export const Route = createFileRoute('/_layout/observers/')({
    component: ObserverTablePage,
});
