import { createFileRoute } from '@tanstack/react-router';

import { ComboOptionTablePage } from '@/modules/comboOptions/comboOptions.config';

export const Route = createFileRoute('/_layout/comboOptions/')({
    component: ComboOptionTablePage,
});
