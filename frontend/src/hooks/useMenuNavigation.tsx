// hooks/useNavigation.ts
import { navigationConfig, type INavigationConfig } from '@/config/navigation';
import { useAuthUser } from '@/hooks/useAuthUser';
import { usePermissions } from '@/hooks/usePermission';

export const useMenuNavigation = () => {
    const { data: user, isPending } = useAuthUser();
    const permissions = usePermissions();
    const hasModulePermissions = permissions.length > 0;
    const hasGeneralAdmin = permissions.some(
        (p) => p.module === "general" && p.role === "admin",
    );

    const hasModulePermission = (module: string, role: string) => {
        if (hasGeneralAdmin) return true;
        return permissions.some((p) => p.module === module && p.role === role);
    };

    const hasFlatRole = (roles: string[]) => {
        if (hasGeneralAdmin) return true;
        if (!user) return false;
        return user.roles.some((role) => roles.includes(role));
    };

    const filterItems = (items: INavigationConfig[]): INavigationConfig[] => {
        return items
            .filter((item) => {
                if (
                    hasModulePermissions &&
                    item.requiredModule &&
                    item.requiredRole
                ) {
                    if (
                        hasModulePermission(
                            item.requiredModule,
                            item.requiredRole,
                        )
                    )
                        return true;
                    if (item.allowedRoles && hasFlatRole(item.allowedRoles))
                        return true;
                    return false;
                }
                if (item.allowedRoles) {
                    return hasFlatRole(item.allowedRoles);
                }
                return true;
            })
            .map((item) => ({
                ...item,
                menus: item.menus ? filterItems(item.menus) : undefined,
            }))
            .filter((item) => !item.menus || item.menus.length > 0);
    };

    return {
        isPending,
        menu: isPending ? [] : filterItems(navigationConfig),
    };
};
