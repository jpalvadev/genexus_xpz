import CreateComboOptionFormPage from '@/modules/comboOptions/views/CreateComboOptionFormPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/comboOptions/new')({
    component: CreateComboOptionFormPage,
});
