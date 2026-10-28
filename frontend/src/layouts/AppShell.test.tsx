import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/test-utils';
import AppShell from './AppShell';

const mockSetOpenMobile = vi.fn();
const mockToggleSidebar = vi.fn();

// Mock para useSidebar preservando el resto de componentes del sidebar
vi.mock('@/components/ui/sidebar', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/components/ui/sidebar')>();
    return {
        ...actual,
        useSidebar: () => ({
            state: 'expanded',
            open: true,
            setOpen: vi.fn(),
            openMobile: true,
            setOpenMobile: mockSetOpenMobile,
            isMobile: true,
            toggleSidebar: mockToggleSidebar,
        }),
    };
});

// Mock para Link de TanStack Router
vi.mock('@tanstack/react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tanstack/react-router')>();
    return {
        ...actual,
        useRouter: () => ({
            navigate: vi.fn(),
            history: { back: vi.fn() },
        }),
        useCanGoBack: () => true,
        useNavigate: () => vi.fn(),
        Link: ({ children, onClick, to, className }: any) => (
            <a href={to} onClick={onClick} className={className}>
                {children}
            </a>
        ),
    };
});

describe('AppShell Layout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderiza el contenido hijo (children), el header y el pie de página', async () => {
        renderWithProviders(
            <AppShell>
                <div data-testid="child-content">Página Principal de Prueba</div>
            </AppShell>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('child-content')).toBeInTheDocument();
            expect(screen.getByText('Página Principal de Prueba')).toBeInTheDocument();
            expect(
                screen.getByText(
                    new RegExp(`©${new Date().getFullYear()}\\s+Itrion`)
                )
            ).toBeInTheDocument();
        });
    });

    it('renderiza los enlaces de navegación del menú en el sidebar', async () => {
        renderWithProviders(
            <AppShell>
                <div>Contenido</div>
            </AppShell>,
        );

        await waitFor(() => {
            expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
        });
    });

    it('en vista mobile, al hacer click en un enlace de navegación se cierra el sidebar (setOpenMobile(false))', async () => {
        const { user } = renderWithProviders(
            <AppShell>
                <div>Contenido</div>
            </AppShell>,
        );

        await waitFor(() => {
            expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
        });

        const homeLink = screen.getByRole('link', { name: 'Home' });
        await user.click(homeLink);

        // Verifica la especificación de cierre de sidebar mobile (PROGRESS.md)
        expect(mockSetOpenMobile).toHaveBeenCalledWith(false);
    });
});

