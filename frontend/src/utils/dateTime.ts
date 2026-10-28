/**
 * Utilidades centralizadas para formateo de fecha y hora.
 * Garantizan hora local y formato de 24 horas estricto (00:00 - 23:59) en toda la aplicación.
 */

export interface FormatDateTimeOptions {
    includeSeconds?: boolean;
    separator?: string;
}

function parseToDate(value: Date | string | number | null | undefined): Date | null {
    if (value === null || value === undefined || value === '') return null;
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * Formatea una fecha en formato 24 horas: 'dd/MM/yyyy HH:mm' (o con segundos si se solicita).
 */
export function formatDateTime(
    value: Date | string | number | null | undefined,
    options?: FormatDateTimeOptions,
): string {
    const date = parseToDate(value);
    if (!date) return '';

    const pad = (n: number) => n.toString().padStart(2, '0');
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    const timePart = options?.includeSeconds
        ? `${hours}:${minutes}:${pad(date.getSeconds())}`
        : `${hours}:${minutes}`;

    const sep = options?.separator ?? ' ';
    return `${day}/${month}/${year}${sep}${timePart}`;
}

/**
 * Formatea una fecha únicamente como día/mes/año: 'dd/MM/yyyy'.
 */
export function formatDate(
    value: Date | string | number | null | undefined,
): string {
    const date = parseToDate(value);
    if (!date) return '';

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/**
 * Formatea una hora en formato estricto de 24 horas: 'HH:mm' (o 'HH:mm:ss').
 * Soporta cadenas 'HH:mm', objetos Date o cadenas ISO.
 */
export function formatTime(
    value: Date | string | number | null | undefined,
    options?: { includeSeconds?: boolean },
): string {
    if (typeof value === 'string' && /^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(value.trim())) {
        const parts = value.trim().split(':');
        const h = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        if (options?.includeSeconds && parts[2]) {
            return `${h}:${m}:${parts[2].padStart(2, '0')}`;
        }
        return `${h}:${m}`;
    }

    const date = parseToDate(value);
    if (!date) return '';

    const pad = (n: number) => n.toString().padStart(2, '0');
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return options?.includeSeconds
        ? `${hours}:${minutes}:${pad(date.getSeconds())}`
        : `${hours}:${minutes}`;
}
