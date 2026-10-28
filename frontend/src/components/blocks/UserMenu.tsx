import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ModeToggle } from '@/components/blocks/ModeToggle';
import { useLogout } from '@/modules/auth/hooks/useLogout';
import { Link } from '@tanstack/react-router';
import { useAuthUser } from '@/hooks/useAuthUser';
import { resolveFileUrl } from '@/utils/resolveFileUrl';

export default function UserMenu() {
    const { data: user } = useAuthUser();
    const logout = useLogout();

    const initials =
        `${(user?.firstName || '')[0]}${(user?.lastName || '')[0]}`.toUpperCase() ||
        'U';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-accent cursor-pointer">
                    <Avatar className="h-8 w-8">
                        {user?.avatarUrl && (
                            <AvatarImage
                                src={resolveFileUrl(user.avatarUrl)}
                                alt={user?.firstName || 'Avatar'}
                            />
                        )}
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">
                        {user?.firstName && user?.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {user?.email}
                    </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile" className="cursor-pointer">Mi perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <ModeToggle />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/about" className="cursor-pointer">Sobre Nosotros</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                    onClick={logout}
                >
                    Cerrar sesión
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
