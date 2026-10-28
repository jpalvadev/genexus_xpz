import NotFound from '@/components/NotFound';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Toaster } from 'sonner';

import { useIsMobile } from '@/hooks/use-mobile';

import { TooltipProvider } from '@/components/ui/tooltip';

const RootLayout = () => {
    const isMobile = useIsMobile();

    return (
        <TooltipProvider>
            <Outlet />
            <TanStackRouterDevtools />
            <Toaster
                expand
                position={isMobile ? 'bottom-center' : 'bottom-right'}
                richColors
            />
        </TooltipProvider>
    );
};

export const Route = createRootRoute({
    component: RootLayout,
    notFoundComponent: NotFound,
});
