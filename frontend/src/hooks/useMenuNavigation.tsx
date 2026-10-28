import { navigationConfig } from '@/config/navigation';

export const useMenuNavigation = () => ({
    isPending: false,
    menu: navigationConfig,
});
