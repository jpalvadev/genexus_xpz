import AppShell from '@/layouts/AppShell';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout')({
    component: () => (
        <AppShell>
            <Outlet />
        </AppShell>
    ),
});
