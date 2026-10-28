import type { GridifySearchParams } from '@/hooks/useGridifyParams';
// import type { GridifyParams } from '@/utils/gridifyFilter';
import '@tanstack/react-table';

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData, TValue> {
        filterKey?: string;
        filterVariant?: 'string' | 'number' | 'date' | 'select';
        headerText?: string;
        selectOptions?: { label: string; value: string | number }[];
    }
}

export type PaginatedData<T> = {
    data: T[];
    rowCount: number;
};

// export type PaginationParams = { pageIndex: number; pageSize: number };
export type PaginationParams = { Page: number; PageSize: number };
export type SortParams = { orderBy: `${string} ${'asc' | 'desc'}` };
export type Filters<T> = Partial<
    T & PaginationParams & SortParams & GridifySearchParams
>;
