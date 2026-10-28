import type { AxiosError } from 'axios';
import { toast } from 'sonner';

type ErrorResponse = {
    errors: Record<string, string[]>;
};

export default function extractErrors(error: AxiosError, errorTitle: string) {
    const data = error.response?.data as ErrorResponse;
    const errors = data?.errors;
    if (!errors) return;

    Object.entries(errors).forEach(([field, messages]) => {
        messages.forEach((msg) => {
            toast.error(errorTitle, {
                description: `${field}: ${msg}`,
            });
        });
    });
}
