/**
 * DateRangeFilter
 *
 * Componente extraído de GenericTable. Maneja su propio estado local
 * de fromDate/toDate y comunica hacia arriba a través de onFilterChange.
 *
 * Las fechas siempre son filtros exactos:
 *   from → field>=value
 *   to   → field<=value
 */

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { Label } from '@/components/ui/label';
import { type FilterVariant, type Operator } from '@/utils/gridifyFilter';

type OnFilterChange = (
    field: string,
    value: string,
    options?: { variant?: FilterVariant; operator?: Operator },
) => void;

type Props = {
    label: string;
    filterKey: string;
    onFilterChange: OnFilterChange;
};

export function DateRangeFilter({ label, filterKey, onFilterChange }: Props) {
    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();

    const handleFromSelect = (value: Date | undefined) => {
        setFromDate(value);
        pushFilter(value, toDate);
    };

    const handleToSelect = (value: Date | undefined) => {
        setToDate(value);
        pushFilter(fromDate, value);
    };

    const pushFilter = (from: Date | undefined, to: Date | undefined) => {
        const parts: string[] = [];

        if (from && to) {
            parts.push(from.toISOString());
            parts.push(`${filterKey}<=${to.toISOString()}`);
            onFilterChange(filterKey, parts.join(','), {
                variant: 'date',
                operator: '>=',
            });
            return;
        }

        if (from) {
            onFilterChange(filterKey, from ? from.toISOString() : '', {
                variant: 'date',
                operator: '>=',
            });
            return;
        }

        if (to) {
            onFilterChange(filterKey, to ? to.toISOString() : '', {
                variant: 'date',
                operator: '<=',
            });
            return;
        }

        onFilterChange(filterKey, '', {
            variant: 'date',
        });
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <Label>Filtro {label}</Label>

            <h2 className="text-sm font-medium">Desde</h2>
            <Calendar
                mode="single"
                defaultMonth={fromDate}
                selected={fromDate}
                disabled={toDate ? { after: toDate } : undefined}
                onSelect={handleFromSelect}
                locale={es}
                captionLayout="dropdown"
                className="rounded-md border w-full"
            />

            <h2 className="text-sm font-medium">Hasta</h2>
            <Calendar
                mode="single"
                defaultMonth={toDate}
                selected={toDate}
                disabled={fromDate ? { before: fromDate } : undefined}
                onSelect={handleToSelect}
                locale={es}
                captionLayout="dropdown"
                className="rounded-md border w-full"
            />
        </div>
    );
}
