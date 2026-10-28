import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveFileUrl } from './resolveFileUrl';

describe('resolveFileUrl utility', () => {
    beforeEach(() => {
        vi.unstubAllEnvs();
    });

    it('devuelve undefined para valores falsy o vacíos', () => {
        expect(resolveFileUrl(null)).toBeUndefined();
        expect(resolveFileUrl(undefined)).toBeUndefined();
        expect(resolveFileUrl('')).toBeUndefined();
        expect(resolveFileUrl('   ')).toBeUndefined();
    });

    it('devuelve la URL sin modificar si ya es absoluta o blob', () => {
        expect(resolveFileUrl('https://example.com/foto.jpg')).toBe('https://example.com/foto.jpg');
        expect(resolveFileUrl('http://example.com/foto.jpg')).toBe('http://example.com/foto.jpg');
        expect(resolveFileUrl('blob:http://localhost:5173/uuid')).toBe('blob:http://localhost:5173/uuid');
        expect(resolveFileUrl('data:image/png;base64,...')).toBe('data:image/png;base64,...');
    });

    it('convierte una ruta relativa de /uploads a la URL absoluta del backend', () => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://192.168.101.9:5273/api/v1');

        const resolved = resolveFileUrl('/uploads/images/1/avatar/foto.webp');
        expect(resolved).toBe('http://192.168.101.9:5273/uploads/images/1/avatar/foto.webp');
    });

    it('soporta VITE_API_BASE_URL con sufijo /api sin versión', () => {
        vi.stubEnv('VITE_API_BASE_URL', 'https://api.itrion.com.ar/api');

        const resolved = resolveFileUrl('/uploads/images/1/avatar/foto.webp');
        expect(resolved).toBe('https://api.itrion.com.ar/uploads/images/1/avatar/foto.webp');
    });

    it('añade barra inicial si la ruta relativa no la tiene', () => {
        vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:5273/api/v1');

        const resolved = resolveFileUrl('uploads/images/1/avatar/foto.webp');
        expect(resolved).toBe('http://localhost:5273/uploads/images/1/avatar/foto.webp');
    });
});

