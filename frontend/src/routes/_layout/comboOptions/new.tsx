import { createFileRoute } from '@tanstack/react-router';

import { CreateComboOptionPage } from '@/modules/comboOptions/comboOptions.config';

export const Route = createFileRoute('/_layout/comboOptions/new')({
    component: CreateComboOptionPage,
});
