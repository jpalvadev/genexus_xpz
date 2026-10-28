// ─── Types ────────────────────────────────────────────────────────────────────

export type Operator = '=' | '>' | '<' | '>=' | '<=';

/**
 * Variantes de filtro — determina si se usa LIKE o exacto al serializar.
 * - 'text'   → LIKE  (field=*value)
 * - 'number' → exacto o con operador (field=value / field>=value)
 * - 'date'   → exacto con operador  (field>=value)
 */
export type FilterVariant = 'string' | 'number' | 'date' | 'select';

export type FilterCondition = {
    field: string;
    operator: Operator;
    value: string;
    /** true → se serializa como field=*value  (LIKE, solo prefijo) */
    isLike: boolean;
};

export type GridifyQuery = {
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
    Filter?: string;
};

// ─── Parse / Serialize ────────────────────────────────────────────────────────

export function parseFilter(filter?: string): FilterCondition[] {
    if (!filter) return [];

    return filter
        .split(',')
        .map((cond): FilterCondition | null => {
            const match = cond.trim().match(/^([\w.]+)([=><]+)(\*?)(.+)$/);
            if (!match) return null;

            const [, field, operator, prefixStar, value] = match;
            const isLike = prefixStar === '*';

            return {
                field,
                operator: operator as Operator,
                value,
                isLike,
            };
        })
        .filter((c): c is FilterCondition => c !== null);
}

function serializeCondition(c: FilterCondition): string {
    if (c.isLike) return `${c.field}=*${c.value}`;
    return `${c.field}${c.operator}${c.value}`;
}

function serializeFilter(conditions: FilterCondition[]): string {
    return conditions.map(serializeCondition).join(',');
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Inserta o actualiza un único campo en el string de filtro.
 * - Si `value` está vacío, elimina el campo.
 * - `variant` controla si se usa LIKE o exacto:
 *     'text'   → isLike: true  → field=*value
 *     'number' → isLike: false → field=value  (o con el operador que pases)
 *     'date'   → isLike: false → field>=value (pasá el operador explícitamente)
 */
export function upsertFilter(
    existing: string | undefined,
    field: string,
    value: string,
    {
        variant = 'string',
        operator = '=',
    }: { variant?: FilterVariant; operator?: Operator } = {},
): string {
    const conditions = parseFilter(existing).filter((c) => c.field !== field);

    if (value && value.trim() !== '') {
        conditions.push({
            field,
            operator,
            value,
            isLike: variant === 'string',
        });
    }

    return serializeFilter(conditions);
}

/**
 * Elimina todos los filtros cuyo campo empiece con `prefix`.
 * Útil para limpiar filtros de fecha (ej: "createdAt.from", "createdAt.to").
 */
export function removeFiltersByPrefix(
    existing: string | undefined,
    prefix: string,
): string {
    const conditions = parseFilter(existing).filter(
        (c) => !c.field.startsWith(prefix),
    );
    return serializeFilter(conditions);
}

/**
 * Retorna el valor de un campo específico dentro del filter string,
 * o undefined si no existe.
 */
export function getFilterValue(
    filter: string | undefined,
    field: string,
): string | undefined {
    return parseFilter(filter).find((c) => c.field === field)?.value;
}
