import ObserverTablePage from '@/modules/observers/views/ObserverTablePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/observers/')({
    component: ObserverTablePage,
});
