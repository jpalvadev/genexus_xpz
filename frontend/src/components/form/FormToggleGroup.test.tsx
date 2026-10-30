import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    renderWithProviders,
    screen,
    fireEvent,
    waitFor,
} from '@/test/test-utils';
import GenericForm, { type FieldConfig } from '../GenericForm';
import { z } from 'zod';

const mockNavigate = vi.fn();
const mockBack = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
    const actual =
        await importOriginal<typeof import('@tanstack/react-router')>();
    return {
        ...actual,
        useRouter: () => ({
            navigate: mockNavigate,
            history: { back: mockBack },
        }),
        useCanGoBack: () => true,
    };
});

const TRISTATE_OPTIONS = [
    { label: 'Sí', value: 'SI' },
    { label: 'No', value: 'NO' },
    { label: 'N/A', value: 'N/A' },
];

const tristateSchema = z.object({
    aprReviewed: z.enum(['SI', 'NO', 'N/A']).nullable(),
});
type TristateForm = z.infer<typeof tristateSchema>;

const fields: FieldConfig<TristateForm>[] = [
    {
        name: 'aprReviewed',
        label: '¿Se elaboró el AST?',
        formField: 'toggle-group',
        options: TRISTATE_OPTIONS,
    },
];

function renderTristate(
    mode: 'create' | 'update' | 'view',
    data: Partial<TristateForm> = {}
) {
    return renderWithProviders(
        <GenericForm<TristateForm>
            schema={tristateSchema}
            fields={fields}
            mode={mode}
            initialData={{ aprReviewed: null, ...data }}
            isPending={false}
        />
    );
}

// Radix ToggleGroup (type="single") renderiza cada segmento como role=radio con
// aria-checked; el nombre accesible es la etiqueta visible (Sí/No/N/A).
function getSegment(label: 'Sí' | 'No' | 'N/A') {
    return screen.getByRole('radio', { name: label });
}

describe('FormToggleGroup (tri-estado Sí/No/N/A vía GenericForm)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('con valor null no presiona ningún segmento', () => {
        renderTristate('create', { aprReviewed: null });
        for (const label of ['Sí', 'No', 'N/A'] as const) {
            expect(getSegment(label)).toHaveAttribute(
                'aria-checked',
                'false'
            );
        }
    });

    it('con valor precargado presiona exactamente ese segmento (update)', () => {
        renderTristate('update', { aprReviewed: 'N/A' });
        expect(getSegment('N/A')).toHaveAttribute('aria-checked', 'true');
        expect(getSegment('Sí')).toHaveAttribute('aria-checked', 'false');
        expect(getSegment('No')).toHaveAttribute('aria-checked', 'false');
    });

    it('al pulsar un segmento queda presionado y el anterior se suelta (single)', async () => {
        renderTristate('create', { aprReviewed: null });
        fireEvent.click(getSegment('Sí'));
        await waitFor(() =>
            expect(getSegment('Sí')).toHaveAttribute('aria-checked', 'true')
        );
        fireEvent.click(getSegment('No'));
        await waitFor(() =>
            expect(getSegment('No')).toHaveAttribute('aria-checked', 'true')
        );
        expect(getSegment('Sí')).toHaveAttribute('aria-checked', 'false');
        expect(getSegment('N/A')).toHaveAttribute('aria-checked', 'false');
    });

    it('despresionar el único segmento presionado no vacía el campo (emisión "" ignorada)', async () => {
        renderTristate('create', { aprReviewed: 'NO' });
        expect(getSegment('No')).toHaveAttribute('aria-checked', 'true');
        fireEvent.click(getSegment('No'));
        // Radix emite '' al despresionar en modo single: FormToggleGroup lo
        // ignora y el segmento vuelve a quedar presionado (el campo nunca se
        // vacía desde la UI).
        await waitFor(() =>
            expect(getSegment('No')).toHaveAttribute('aria-checked', 'true')
        );
    });

    it('en modo view los tres segmentos están deshabilitados y el valor se ve', () => {
        renderTristate('view', { aprReviewed: 'NO' });
        expect(getSegment('Sí')).toBeDisabled();
        expect(getSegment('No')).toBeDisabled();
        expect(getSegment('N/A')).toBeDisabled();
        expect(getSegment('No')).toHaveAttribute('aria-checked', 'true');
    });

    it('renderiza el label de la pregunta', () => {
        renderTristate('create', { aprReviewed: null });
        expect(screen.getByText('¿Se elaboró el AST?')).toBeInTheDocument();
    });
});
