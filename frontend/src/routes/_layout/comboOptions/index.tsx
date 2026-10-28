import ComboOptionsTablePage from '@/modules/comboOptions/views/ComboOptionsTablePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/comboOptions/')({
    component: ComboOptionsTablePage,
});
