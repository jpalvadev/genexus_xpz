import axios from 'axios';
import { toast } from 'sonner';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de response: toast en 400/409 (reglas de negocio del backend) y
// errores genéricos de transporte. Sin auth: no hay 401 ni redirección a login.
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
