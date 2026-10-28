import {
    type AuthUser,
    type UserPermission,
} from '@/modules/auth/types/auth.type';
import { authService } from '@/modules/auth/services/auth.service';
import { useQueryClient } from '@tanstack/react-query';

export function usePermissions(): UserPermission[] {
    const queryClient = useQueryClient();
    const user = queryClient.getQueryData<AuthUser>(['auth', 'user']);
    return user?.permissions ?? authService.getUser()?.permissions ?? [];
}

export function usePermission(
    module: string,
    role: string,
    scope?: string,
): boolean {
    const permissions = usePermissions();
    if (permissions.some((p) => p.module === 'general' && p.role === 'admin'))
        return true;

    return permissions.some(
        (p) =>
            p.module === module &&
            p.role === role &&
            (p.scope === null || !scope || p.scope === scope),
    );
}

export function useHasModuleAccess(module: string): boolean {
    const permissions = usePermissions();
    if (permissions.some((p) => p.module === 'general' && p.role === 'admin'))
        return true;

    return permissions.some((p) => p.module === module);
}
