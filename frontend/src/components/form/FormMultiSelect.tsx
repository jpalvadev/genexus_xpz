import { type ReactNode } from 'react';
import { FormBase, type FormControlProps } from './FormBase';
import { useFieldContext } from './hooks';

import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue,
    useMultiSelectContext,
} from '@/components/ui/multi-select';
import { useLookup } from '@/hooks/useLookup';
import type { PaginatedData } from '@/types/table.type';

type OverflowBehavior = 'wrap-when-open' | 'wrap' | 'cutoff';

export type FormMultiSelectProps = FormControlProps & {
    children: ReactNode;
    single?: boolean;
    placeholder?: string;
    shouldFilter?: boolean;
};

export default function FormMultiSelect({
    children,
    disabled = false,
    single = false,
    placeholder,
    shouldFilter,
    ...props
}: FormMultiSelectProps) {
    // Permite manejar tanto array (multi) como escalar (single) en el estado del formulario
    const field = useFieldContext<any>();
    const overflowBehavior: OverflowBehavior = 'wrap';

    const rawValue = field.state.value;
    const values: string[] = single
        ? rawValue != null && rawValue !== ''
            ? [String(rawValue)]
            : []
        : Array.isArray(rawValue)
          ? rawValue.map(String)
          : rawValue != null && rawValue !== ''
            ? [String(rawValue)]
            : [];

    const handleValuesChange = (newValues: string[]) => {
        if (single) {
            const first = newValues[0];
            field.handleChange(first !== undefined ? first : null);
        } else {
            field.handleChange(newValues);
        }
    };

    return (
        <FormBase {...props}>
            <MultiSelect
                single={single}
                onValuesChange={handleValuesChange}
                values={values}
            >
                <MultiSelectTrigger
                    id={field.name}
                    aria-label={props.label}
                    className="w-full"
                    disabled={disabled}
                >
                    <MultiSelectValue
                        overflowBehavior={overflowBehavior}
                        placeholder={
                            placeholder ??
                            (single ? 'Seleccionar...' : undefined)
                        }
                    />
                </MultiSelectTrigger>
                <MultiSelectContent
                    shouldFilter={shouldFilter}
                    search={{
                        emptyMessage: 'No hay resultados',
                        placeholder: 'Búsqueda...',
                    }}
                >
                    <MultiSelectGroup>{children}</MultiSelectGroup>
                </MultiSelectContent>
            </MultiSelect>
        </FormBase>
    );
}

export type MultiSelectItemsProps<T> = {
    cacheKey: string;
    fetchFn: (params: Record<string, string>) => Promise<PaginatedData<T>>;
    mapConfig: { label: keyof T; value: keyof T };
    initialItems?: { label: ReactNode; value: string | number }[];
    pageSize?: number;
    debounceMs?: number;
    renderLabel?: (item: T) => string;
};

export function MultiSelectItems<T>({
    cacheKey,
    fetchFn,
    mapConfig,
    initialItems,
    pageSize = 20,
    debounceMs = 300,
    renderLabel,
}: MultiSelectItemsProps<T>) {
    const { searchValue } = useMultiSelectContext();

    const lookupInitialItems = initialItems?.map((item) => ({
        label: typeof item.label === 'string' ? item.label : String(item.label),
        value: item.value,
    }));

    const { lookups, isPending } = useLookup(
        cacheKey,
        fetchFn,
        searchValue,
        mapConfig,
        {
            pageSize,
            debounceMs,
            initialItems: lookupInitialItems,
            renderLabel,
        },
    );

    if (isPending && lookups.length === 0) {
        return (
            <p className="p-2 text-sm text-muted-foreground">Cargando...</p>
        );
    }

    return lookups.map((item) => (
        <MultiSelectItem key={item.value} value={item.value.toString()}>
            {item.label}
        </MultiSelectItem>
    ));
}
