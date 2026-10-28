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
import type { AuthUser, UserPermission } from '@/modules/auth/types/auth.type';
import { routeTree } from '@/routeTree.gen';

export interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    user?: Partial<AuthUser> | null;
    permissions?: UserPermission[];
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

function seedUserCache(
    queryClient: QueryClient,
    user?: Partial<AuthUser> | null,
    permissions?: UserPermission[]
) {
    if (user !== undefined) {
        if (user === null) {
            queryClient.setQueryData(['auth', 'user'], null);
        } else {
            const fullUser: AuthUser = {
                email: user.email ?? 'test@itrion.com',
                firstName: user.firstName ?? 'Test',
                lastName: user.lastName ?? 'User',
                roles: user.roles ?? ['admin'],
                permissions: permissions ?? user.permissions ?? [
                    { module: 'general', role: 'admin', scope: null },
                ],
                avatarUrl: user.avatarUrl ?? null,
                mustChangePassword: user.mustChangePassword ?? false,
            };
            queryClient.setQueryData(['auth', 'user'], fullUser);
        }
    } else if (permissions !== undefined) {
        queryClient.setQueryData(['auth', 'user'], {
            email: 'test@itrion.com',
            firstName: 'Test',
            lastName: 'User',
            roles: ['user'],
            permissions,
            avatarUrl: null,
        });
    }
}

export function renderWithProviders(
    ui: ReactElement,
    {
        user,
        permissions,
        queryClient = createTestQueryClient(),
        ...renderOptions
    }: ExtendedRenderOptions = {}
) {
    seedUserCache(queryClient, user, permissions);

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
        user,
        permissions,
        queryClient = createTestQueryClient(),
        ...renderOptions
    }: Omit<ExtendedRenderOptions, 'initialRoute' | 'withRouter'> = {}
) {
    seedUserCache(queryClient, user, permissions);

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
