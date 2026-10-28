import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from './apiClient';
import { toast } from 'sonner';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

describe('apiClient response interceptor', () => {
    const originalLocation = window.location;

    function mockLocation(urlStr: string) {
        const parsed = new URL(urlStr);
        let currentHref = parsed.href;
        const locationMock = {
            get href() {
                return currentHref;
            },
            set href(val: string) {
                currentHref = val;
            },
            pathname: parsed.pathname,
            search: parsed.search,
            origin: parsed.origin,
            host: parsed.host,
            hostname: parsed.hostname,
            port: parsed.port,
            protocol: parsed.protocol,
            assign: vi.fn(),
            replace: vi.fn(),
            reload: vi.fn(),
        };
        delete (window as any).location;
        window.location = locationMock as any;
        return locationMock;
    }

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        mockLocation('http://localhost:5173/');
    });

    afterEach(() => {
        delete (window as any).location;
        (window as any).location = originalLocation;
    });

    it('no agrega header Authorization (no hay interceptor de request con token)', async () => {
        let authHeader: string | null = 'init';
        server.use(
            http.get('*/api/v1/test-no-auth', ({ request }) => {
                authHeader = request.headers.get('Authorization');
                return HttpResponse.json({ ok: true });
            })
        );

        await apiClient.get('/test-no-auth');

        expect(authHeader).toBeNull();
    });

    it('ante un 404: muestra toast con el mensaje del backend', async () => {
        server.use(
            http.get('*/api/v1/missing-device', () => {
                return HttpResponse.json({ message: 'Dispositivo 999 no existe' }, { status: 404 });
            })
        );

        await expect(apiClient.get('/missing-device')).rejects.toBeDefined();

        expect(toast.error).toHaveBeenCalledWith('Dispositivo 999 no existe');
    });

    it('ante un 404 sin mensaje específico: muestra "Recurso no encontrado"', async () => {
        server.use(
            http.get('*/api/v1/empty-404', () => {
                return new HttpResponse(null, { status: 404 });
            })
        );

        await expect(apiClient.get('/empty-404')).rejects.toBeDefined();

        expect(toast.error).toHaveBeenCalledWith('Recurso no encontrado');
    });

    it('ante un 400 con mensaje: muestra toast con el mensaje devuelto', async () => {
        server.use(
            http.get('*/api/v1/bad-request', () => {
                return HttpResponse.json({ message: 'La cantidad debe ser mayor a cero.' }, { status: 400 });
            })
        );

        await expect(apiClient.get('/bad-request')).rejects.toBeDefined();

        expect(toast.error).toHaveBeenCalledWith('La cantidad debe ser mayor a cero.', { id: 'api-error-La cantidad debe ser mayor a cero.' });
    });

    it('ante un 409 con mensaje: muestra toast con el mensaje de conflicto', async () => {
        server.use(
            http.get('*/api/v1/conflict', () => {
                return HttpResponse.json({ message: 'Legajo already exists' }, { status: 409 });
            })
        );

        await expect(apiClient.get('/conflict')).rejects.toBeDefined();

        expect(toast.error).toHaveBeenCalledWith('Legajo already exists', { id: 'api-error-Legajo already exists' });
    });

    it('ante un 500: muestra toast de error interno del servidor con id anti-duplicado', async () => {
        server.use(
            http.get('*/api/v1/server-crash', () => {
                return HttpResponse.json({ message: 'Crash' }, { status: 500 });
            })
        );

        await expect(apiClient.get('/server-crash')).rejects.toBeDefined();

        expect(toast.error).toHaveBeenCalledWith(
            'Error interno del servidor',
            { id: 'server-500-error' }
        );
    });

    it('ante un timeout de Axios (ECONNABORTED): muestra toast de tiempo agotado', async () => {
        const timeoutError = {
            code: 'ECONNABORTED',
            message: 'timeout of 10000ms exceeded',
        };

        const responseInterceptor = (apiClient.interceptors.response as any).handlers[0];
        await expect(responseInterceptor.rejected(timeoutError)).rejects.toEqual(timeoutError);

        expect(toast.error).toHaveBeenCalledWith(
            'La solicitud tardó demasiado, intentá de nuevo',
            { id: 'timeout-error' }
        );
    });

    it('ante un error de red sin respuesta del servidor: muestra toast de conexión', async () => {
        server.use(
            http.get('*/api/v1/network-down', () => {
                return HttpResponse.error();
            })
        );

        await expect(apiClient.get('/network-down')).rejects.toBeDefined();

        expect(toast.error).toHaveBeenCalledWith(
            'No se pudo conectar al servidor',
            { id: 'connection-error' }
        );
    });
});
