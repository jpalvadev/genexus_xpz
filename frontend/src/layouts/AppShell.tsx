import Loading from '@/components/Loading';
import logoLight from '@/assets/itrion-logo.png';
import logoDark from '@/assets/itrion-logo_dark.png';
import UserMenu from '@/components/blocks/UserMenu';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { useMenuNavigation } from '@/hooks/useMenuNavigation';
import { useSidebar } from '@/components/ui/sidebar';
import type { INavigationConfig } from '@/config/navigation';

import { Link } from '@tanstack/react-router';
import { ChevronRightIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type AppShellProps = {
    children: ReactNode;
};

function RecursiveMenuItem({
    item,
}: {
    item: INavigationConfig;
}) {
    const { setOpenMobile } = useSidebar();
    const hasChildren = item.menus && item.menus.length > 0;

    if (hasChildren) {
        return (
            <Collapsible defaultOpen={false} className="group/collapsible">
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {item!.menus!.map((child, childIndex) => (
                                <RecursiveMenuItem
                                    key={childIndex}
                                    item={child}
                                />
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        );
    }

    return (
        <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
                <Link
                    to={item.to!}
                    className="[&.active]:font-bold [&.active>svg]:stroke-3"
                    onClick={() => setOpenMobile(false)}
                >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
            {item.badge && (
                <SidebarMenuBadge className="bg-primary/10 rounded-full">
                    {item.badge}
                </SidebarMenuBadge>
            )}
        </SidebarMenuItem>
    );
}

const AppShell = ({ children }: AppShellProps) => {
    // const logout = useLogout();
    const { menu, isPending } = useMenuNavigation();

    if (isPending) return <Loading />;

    return (
        <div className="flex min-h-dvh w-full">
            <SidebarProvider>
                <Sidebar className="print:hidden">
                    <SidebarContent>
                        {menu.map((navMainMenu, navMainMenuIndex) => (
                            <SidebarGroup key={navMainMenuIndex}>
                                {navMainMenu.title && (
                                    <SidebarGroupLabel>
                                        {navMainMenu.title}
                                    </SidebarGroupLabel>
                                )}
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {navMainMenu?.menus?.map(
                                            (menu, menuIndex) => (
                                                <RecursiveMenuItem
                                                    key={menuIndex}
                                                    item={menu}
                                                />
                                            ),
                                        )}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        ))}
                    </SidebarContent>
                </Sidebar>
                <div className="flex flex-1 flex-col min-w-0 md:bg-main-background print:bg-white">
                    <header className="bg-card sticky top-0 z-50 border-b print:hidden">
                        <div className="mx-auto flex items-center justify-between gap-6 px-4 py-2 sm:px-6 ">
                            <div className="flex items-center gap-4">
                                <SidebarTrigger className="[&_svg]:!size-5" />
                                <Separator
                                    orientation="vertical"
                                    className="hidden !h-4 sm:block"
                                />
                                {/* Se muestra en modo claro, se oculta en dark */}
                                <img
                                    src={logoLight}
                                    alt="Itrion"
                                    className="h-8 w-auto object-contain dark:hidden"
                                />
                                {/* Se oculta por defecto, se muestra en dark */}
                                <img
                                    src={logoDark}
                                    alt="Itrion"
                                    className="h-8 w-auto object-contain hidden dark:block"
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <UserMenu />
                            </div>
                        </div>
                    </header>
                    {/* Main Content - Outlet */}
                    <main className="mx-auto size-full max-w-480 flex-1 p-4 sm:px-6 print:p-0 print:m-0 print:max-w-none">
                        {children}
                    </main>
                    {/* Footer */}
                    <footer className="print:hidden">
                        <div className="text-muted-foreground mx-auto flex size-full max-w-7xl items-center justify-center gap-3 px-4 py-3">
                            <p className="text-sm text-center">
                                {`©${new Date().getFullYear()} `}Itrion. Todos
                                los derechos reservados.
                            </p>
                        </div>
                    </footer>
                </div>
            </SidebarProvider>
        </div>
    );
};

export default AppShell;
