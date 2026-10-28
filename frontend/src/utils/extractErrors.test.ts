import { describe, it, expect, vi, beforeEach } from 'vitest';
import extractErrors from './extractErrors';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
    },
}));

describe('extractErrors', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('no hace nada si el error no tiene response o data', () => {
        const error = {} as AxiosError;
        extractErrors(error, 'Error');

        expect(toast.error).not.toHaveBeenCalled();
    });

    it('no hace nada si el objeto response.data no contiene la propiedad errors', () => {
        const error = {
            response: {
                data: { message: 'Algo falló pero sin diccionario errors' },
            },
        } as unknown as AxiosError;

        extractErrors(error, 'Error general');

        expect(toast.error).not.toHaveBeenCalled();
    });

    it('dispara un toast.error por cada mensaje con el formato field: msg', () => {
        const error = {
            response: {
                data: {
                    errors: {
                        Email: ['Formato inválido', 'Ya existe un usuario con este correo'],
                        Password: ['Mínimo 6 caracteres'],
                    },
                },
            },
        } as unknown as AxiosError;

        extractErrors(error, 'Error de validación');

        expect(toast.error).toHaveBeenCalledTimes(3);
        expect(toast.error).toHaveBeenNthCalledWith(1, 'Error de validación', {
            description: 'Email: Formato inválido',
        });
        expect(toast.error).toHaveBeenNthCalledWith(2, 'Error de validación', {
            description: 'Email: Ya existe un usuario con este correo',
        });
        expect(toast.error).toHaveBeenNthCalledWith(3, 'Error de validación', {
            description: 'Password: Mínimo 6 caracteres',
        });
    });

    it('no llama a toast.error si el objeto errors está vacío', () => {
        const error = {
            response: {
                data: {
                    errors: {},
                },
            },
        } as unknown as AxiosError;

        extractErrors(error, 'Error');

        expect(toast.error).not.toHaveBeenCalled();
    });
});

