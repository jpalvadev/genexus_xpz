/**
 * Resuelve una ruta de archivo relativa devuelta por el servidor (ej: /uploads/images/...)
 * hacia una URL absoluta apuntando al backend, o retorna la URL original si ya es absoluta.
 */
export function resolveFileUrl(path: string | null | undefined): string | undefined {
    if (!path || typeof path !== 'string') return undefined;

    const trimmed = path.trim();
    if (!trimmed) return undefined;

    if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('blob:') ||
        trimmed.startsWith('data:')
    ) {
        return trimmed;
    }

    const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
    if (!apiBase) {
        return trimmed;
    }

    // Remueve sufijos de api como "/api/v1" o "/api" para obtener el host del backend
    const backendOrigin = apiBase.replace(/\/api(\/v\d+)?\/?$/i, '');
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

    return `${backendOrigin}${cleanPath}`;
}

