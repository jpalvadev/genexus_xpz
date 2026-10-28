import SectorTablePage from '@/modules/sectors/views/SectorTablePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/sectors/')({
    component: SectorTablePage,
});
