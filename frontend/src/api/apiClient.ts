import { authService } from '@/modules/auth/services/auth.service';
import axios from 'axios';
import { toast } from 'sonner';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// interceptor de request, agrega el JWT token a cada request que se haga al back
apiClient.interceptors.request.use((config) => {
    const token = authService.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Solo en desarrollo
    if (import.meta.env.DEV) {
        const devTenant = import.meta.env.VITE_API_TENANT_SLUG;
        if (devTenant) {
            config.headers['X-Tenant-Slug'] = devTenant;
        }
    }
    // else {
    //     const host = window.location.hostname; // "ac.itrion.com.ar"
    //     const parts = host.split('.');
    //     if (parts.length > 2 && parts[0] !== 'www') {
    //         config.headers['X-Tenant-Slug'] = parts[0]; // "ac"
    //     }
    // }

    return config;
});

// interceptor de response, si el server devuelve 401, mandamos al login
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        switch (status) {
            case 400:
            case 409:
                if (message) {
                    toast.error(message, { id: `api-error-${message}` });
                }
                break;
            case 401:
                // si estamos en el login no redirigimos
                if (!error.config?.url?.includes('/auth/login')) {
                    const currentPath =
                        window.location.pathname + window.location.search;
                    authService.logout();
                    // guardamos como query param a donde queremos llegar finalmente luego del login
                    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
                }
                break;
            case 403:
                toast.error('No tenés permisos para realizar esta acción', { id: 'forbidden-error' });
                break;
            case 404:
                toast.error(message ?? 'Recurso no encontrado');
                break;

            case 500:
                toast.error('Error interno del servidor', { id: 'server-500-error' });
                break;
            default:
                if (error.code === 'ECONNABORTED') {
                    toast.error(
                        'La solicitud tardó demasiado, intentá de nuevo',
                        { id: 'timeout-error' }
                    );
                } else if (!status) {
                    toast.error('No se pudo conectar al servidor', { id: 'connection-error' });
                }
        }

        return Promise.reject(error);
    },
);
