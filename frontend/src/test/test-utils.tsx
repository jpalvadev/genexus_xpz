import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    createMemoryHistory,
    createRouter,
    RouterProvider,
} from '@tanstack/react-router';
import { ThemeProvider } from '@/components/ThemeProvider';
import { routeTree } from '@/routeTree.gen';

export interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    queryClient?: QueryClient;
}

export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
            mutations: {
                retry: false,
                gcTime: 0,
            },
        },
    });
}

export function renderWithProviders(
    ui: ReactElement,
    {
        queryClient = createTestQueryClient(),
        ...renderOptions
    }: ExtendedRenderOptions = {}
) {
    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                    {children}
                </ThemeProvider>
            </QueryClientProvider>
        );
    }

    const renderResult = render(ui, {
        wrapper: Wrapper,
        ...renderOptions,
    });

    return {
        ...renderResult,
        queryClient,
        user: userEvent.setup(),
    };
}

export async function renderWithRouter(
    initialRoute: string = '/',
    {
        queryClient = createTestQueryClient(),
        ...renderOptions
    }: ExtendedRenderOptions = {}
) {
    const history = createMemoryHistory({
        initialEntries: [initialRoute],
    });

    const router = createRouter({
        routeTree,
        history,
    });

    await router.load();

    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                    {children}
                </ThemeProvider>
            </QueryClientProvider>
        );
    }

    const renderResult = render(
        <Wrapper>
            <RouterProvider router={router} />
        </Wrapper>,
        renderOptions
    );

    return {
        ...renderResult,
        queryClient,
        router,
        user: userEvent.setup(),
    };
}

export * from '@testing-library/react';
export { userEvent };
