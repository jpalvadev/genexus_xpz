import { useAuthUser } from '@/hooks/useAuthUser';
import { usePermissions } from '@/hooks/usePermission';
import React from 'react';

type AuthorizedProps = {
    allowedRoles?: string[];
    requiredModule?: string;
    requiredRole?: string;
    scope?: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
};

const Authorized = ({
    allowedRoles,
    requiredModule,
    requiredRole,
    scope,
    children,
    fallback = null,
}: AuthorizedProps) => {
    const { data: user, isPending } = useAuthUser();
    const permissions = usePermissions();

    if (isPending) return <p>Cargando...</p>;

    if (!user) return <>{fallback}</>;

    const hasAdminBypass = permissions.some(
        (p) => p.module === 'general' && p.role === 'admin',
    );

    if (requiredModule && requiredRole) {
        const hasPermission =
            hasAdminBypass ||
            permissions.some(
                (p) =>
                    p.module === requiredModule &&
                    p.role === requiredRole &&
                    (p.scope === null || !scope || p.scope === scope),
            );
        return hasPermission ? <>{children}</> : <>{fallback}</>;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const hasPermission =
            hasAdminBypass ||
            user.roles.some((role) => allowedRoles.includes(role));
        return hasPermission ? <>{children}</> : <>{fallback}</>;
    }

    return <>{fallback}</>;
};

export default Authorized;
