import { useQuery } from '@tanstack/react-query';
import type { Lookup } from '@/types/lookup.type';
import type { PaginatedData } from '@/types/table.type';
import { useDebounce } from './useDebounce';
import { useMemo } from 'react';

export type UseLookupOptions<T = any> = {
    pageSize?: number;
    debounceMs?: number;
    initialItems?: Lookup[];
    renderLabel?: (item: T) => string;
};

export function useLookup<T>(
    cacheKey: string,
    fetchFn: (params: Record<string, string>) => Promise<PaginatedData<T>>,
    searchValue: string,
    mapConfig: { value: keyof T; label: keyof T },
    options?: UseLookupOptions<T>,
) {
    const pageSize = options?.pageSize ?? 20;
    const debounceMs = options?.debounceMs ?? 300;
    const initialItems = options?.initialItems;
    const renderLabel = options?.renderLabel;

    const debouncedSearch = useDebounce(searchValue, debounceMs);

    const query = useQuery({
        queryKey: [cacheKey, 'lookup', debouncedSearch, pageSize],
        queryFn: () => {
            const params: Record<string, string> = {
                pageSize: pageSize.toString(),
            };
            const trimmed = debouncedSearch.trim();
            if (trimmed) {
                params[mapConfig.label as string] = trimmed;
            }
            return fetchFn(params);
        },
        placeholderData: (previousData) => previousData,
    });

    const lookups: Lookup[] = useMemo(() => {
        const fetchedList: Lookup[] =
            query.data?.data.map((item) => ({
                label: renderLabel
                    ? renderLabel(item)
                    : String(item[mapConfig.label]),
                value: item[mapConfig.value] as unknown as string | number,
            })) ?? [];

        if (!initialItems || initialItems.length === 0) {
            return fetchedList;
        }

        // Unificar initialItems y fetchedList preservando que initialItems estén presentes sin duplicados
        const map = new Map<string, Lookup>();
        for (const item of initialItems) {
            map.set(String(item.value), item);
        }
        for (const item of fetchedList) {
            map.set(String(item.value), item);
        }

        return Array.from(map.values());
    }, [query.data?.data, initialItems, mapConfig.label, mapConfig.value, renderLabel]);

    return {
        lookups,
        isPending: query.isPending,
    };
}
