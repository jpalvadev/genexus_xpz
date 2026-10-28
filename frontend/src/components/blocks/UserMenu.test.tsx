import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen } from '@/test/test-utils';
import UserMenu from './UserMenu';

const mockLogout = vi.fn();

vi.mock('@/modules/auth/hooks/useLogout', () => ({
    useLogout: () => mockLogout,
}));

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
        Link: ({
            children,
            onClick,
            to,
            className,
            ...props
        }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }) => (
            <a href={to} onClick={onClick} className={className} {...props}>
                {children}
            </a>
        ),
    };
});

describe('UserMenu', () => {
    const mockUser = {
        email: 'juan.perez@itrion.com',
        firstName: 'Juan',
        lastName: 'Perez',
        roles: ['admin'],
        permissions: [{ module: 'general', role: 'admin', scope: null }],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderiza el avatar con las iniciales del usuario y su información en el menú', async () => {
        const { user } = renderWithProviders(<UserMenu />, { user: mockUser });

        const triggerButton = screen.getByRole('button');
        expect(triggerButton).toBeInTheDocument();
        expect(screen.getByText('JP')).toBeInTheDocument();

        await user.click(triggerButton);

        expect(await screen.findByText('Juan Perez')).toBeInTheDocument();
        expect(screen.getAllByText('juan.perez@itrion.com').length).toBeGreaterThan(0);
    });

    it('ejecuta logout al hacer click en Cerrar sesión', async () => {
        const { user } = renderWithProviders(<UserMenu />, { user: mockUser });

        const triggerButton = screen.getByRole('button');
        await user.click(triggerButton);

        const logoutItem = await screen.findByRole('menuitem', { name: 'Cerrar sesión' });
        await user.click(logoutItem);

        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('B12 - depura las opciones del menú evitando duplicación de links a /profile', async () => {
        const { user } = renderWithProviders(<UserMenu />, { user: mockUser });

        const triggerButton = screen.getByRole('button');
        await user.click(triggerButton);

        const profileItem = await screen.findByRole('menuitem', { name: 'Mi perfil' });
        expect(profileItem).toBeInTheDocument();
        expect(profileItem).toHaveAttribute('href', '/profile');

        // B12: No debe existir un ítem "Configuración" apuntando redundantemente a /profile
        expect(screen.queryByRole('menuitem', { name: 'Configuración' })).not.toBeInTheDocument();

        // Debe haber un único link hacia /profile en todo el menú
        const linksToProfile = screen.getAllByRole('menuitem').filter((item) =>
            item.getAttribute('href') === '/profile'
        );
        expect(linksToProfile).toHaveLength(1);
    });

    it('B13 - provee affordance interactivo cursor-pointer en trigger y opciones del menú', async () => {
        const { user } = renderWithProviders(<UserMenu />, { user: mockUser });

        const triggerButton = screen.getByRole('button');
        // El trigger button del avatar debe tener affordance cursor-pointer
        expect(triggerButton).toHaveClass('cursor-pointer');

        await user.click(triggerButton);

        const profileItem = await screen.findByRole('menuitem', { name: 'Mi perfil' });
        expect(profileItem).toHaveClass('cursor-pointer');

        const aboutItem = screen.getByRole('menuitem', { name: 'Sobre Nosotros' });
        expect(aboutItem).toHaveClass('cursor-pointer');

        const logoutItem = screen.getByRole('menuitem', { name: 'Cerrar sesión' });
        expect(logoutItem).toHaveClass('cursor-pointer');
    });

    it('renderiza la imagen del avatar cuando el usuario tiene avatarUrl configurado', async () => {
        renderWithProviders(<UserMenu />, {
            user: {
                ...mockUser,
                avatarUrl: '/uploads/images/1/avatar/foto-user.webp',
            },
        });

        const avatarImg = await screen.findByRole('img');
        expect(avatarImg).toHaveAttribute('src', expect.stringContaining('/uploads/images/1/avatar/foto-user.webp'));
    });
});
