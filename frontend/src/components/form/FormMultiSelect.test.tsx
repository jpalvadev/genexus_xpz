import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent, waitFor } from '@/test/test-utils';
import GenericForm, { type FieldConfig } from '../GenericForm';
import { MultiSelectItem } from '@/components/ui/multi-select';
import { MultiSelectItems } from './FormMultiSelect';
import { z } from 'zod';

const mockNavigate = vi.fn();
const mockBack = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tanstack/react-router')>();
    return {
        ...actual,
        useRouter: () => ({
            navigate: mockNavigate,
            history: { back: mockBack },
        }),
        useCanGoBack: () => true,
    };
});

// ResizeObserver mock para jsdom (requerido por MultiSelectValue)
class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}
window.ResizeObserver = ResizeObserverMock as any;

describe('FormMultiSelect component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('modo single: true (selección única)', () => {
        const singleSchema = z.object({
            sectorId: z.coerce.number().nullable().optional(),
        });
        type SingleForm = z.infer<typeof singleSchema>;

        it('muestra el placeholder cuando no hay nada seleccionado', () => {
            const fields: FieldConfig<SingleForm>[] = [
                {
                    name: 'sectorId',
                    label: 'Sector',
                    formField: 'multi-select',
                    single: true,
                    placeholder: 'Seleccionar sector...',
                    children: (
                        <>
                            <MultiSelectItem value="1">Sector Norte</MultiSelectItem>
                            <MultiSelectItem value="2">Sector Sur</MultiSelectItem>
                        </>
                    ),
                },
            ];

            renderWithProviders(
                <GenericForm<SingleForm>
                    initialData={{ sectorId: null }}
                    mode="create"
                    schema={singleSchema}
                    fields={fields}
                    isPending={false}
                    onSubmit={vi.fn()}
                />
            );

            expect(screen.getByRole('combobox')).toHaveTextContent('Seleccionar sector...');
        });

        it('muestra la etiqueta plana del item preseleccionado en modo edición sin badges con cruz', () => {
            const fields: FieldConfig<SingleForm>[] = [
                {
                    name: 'sectorId',
                    label: 'Sector',
                    formField: 'multi-select',
                    single: true,
                    children: (
                        <>
                            <MultiSelectItem value="1">Sector Norte</MultiSelectItem>
                            <MultiSelectItem value="2">Sector Sur</MultiSelectItem>
                        </>
                    ),
                },
            ];

            renderWithProviders(
                <GenericForm<SingleForm>
                    initialData={{ sectorId: 2 }}
                    mode="update"
                    schema={singleSchema}
                    fields={fields}
                    isPending={false}
                    onSubmit={vi.fn()}
                />
            );

            // Muestra "Sector Sur" directamente en el botón combobox
            expect(screen.getByRole('combobox')).toHaveTextContent('Sector Sur');
        });

        it('envía un valor escalar al hacer submit tras seleccionar una opción', async () => {
            const handleSubmit = vi.fn();
            const fields: FieldConfig<SingleForm>[] = [
                {
                    name: 'sectorId',
                    label: 'Sector',
                    formField: 'multi-select',
                    single: true,
                    children: (
                        <>
                            <MultiSelectItem value="1">Sector Norte</MultiSelectItem>
                            <MultiSelectItem value="2">Sector Sur</MultiSelectItem>
                        </>
                    ),
                },
            ];

            renderWithProviders(
                <GenericForm<SingleForm>
                    initialData={{ sectorId: null }}
                    mode="create"
                    schema={singleSchema}
                    fields={fields}
                    isPending={false}
                    onSubmit={handleSubmit}
                />
            );

            // Abrimos el selector haciendo clic en el trigger
            const trigger = screen.getByRole('combobox');
            fireEvent.click(trigger);

            // Seleccionamos Sector 1
            const options = await screen.findAllByText('Sector Norte');
            fireEvent.click(options[0]);

            // Enviamos el formulario
            const submitBtn = screen.getByRole('button', { name: /guardar|crear/i });
            fireEvent.click(submitBtn);

            await waitFor(() => {
                expect(handleSubmit).toHaveBeenCalledTimes(1);
            });

            // Verifica que se guardó escalar 1 (no array [1])
            expect(handleSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ sectorId: 1 })
            );
        });
    });

    describe('modo múltiple (default)', () => {
        const multiSchema = z.object({
            recipientIds: z.array(z.coerce.number()),
        });
        type MultiForm = z.infer<typeof multiSchema>;

        it('muestra badges con chips para selecciones múltiples', () => {
            const fields: FieldConfig<MultiForm>[] = [
                {
                    name: 'recipientIds',
                    label: 'Destinatarios',
                    formField: 'multi-select',
                    children: (
                        <>
                            <MultiSelectItem value="10">Juan Pérez</MultiSelectItem>
                            <MultiSelectItem value="20">María Gómez</MultiSelectItem>
                        </>
                    ),
                },
            ];

            renderWithProviders(
                <GenericForm<MultiForm>
                    initialData={{ recipientIds: [10, 20] }}
                    mode="update"
                    schema={multiSchema}
                    fields={fields}
                    isPending={false}
                    onSubmit={vi.fn()}
                />
            );

            const trigger = screen.getByRole('combobox');
            expect(trigger).toHaveTextContent('Juan Pérez');
            expect(trigger).toHaveTextContent('María Gómez');
        });
    });

    describe('MultiSelectItems con initialItems', () => {
        const schema = z.object({
            sectorId: z.coerce.number().nullable(),
        });
        type FormType = z.infer<typeof schema>;

        it('muestra el nombre del sector preexistente provisto en initialItems', async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                data: [{ id: 1, name: 'Sector 1' }],
                rowCount: 1,
            });

            const fields: FieldConfig<FormType>[] = [
                {
                    name: 'sectorId',
                    label: 'Sector',
                    formField: 'multi-select',
                    single: true,
                    children: (
                        <MultiSelectItems
                            cacheKey="test-items"
                            fetchFn={mockFetch}
                            mapConfig={{ value: 'id', label: 'name' }}
                            initialItems={[{ value: 99, label: 'Sector Remoto 99' }]}
                        />
                    ),
                },
            ];

            renderWithProviders(
                <GenericForm<FormType>
                    initialData={{ sectorId: 99 }}
                    mode="update"
                    schema={schema}
                    fields={fields}
                    isPending={false}
                    onSubmit={vi.fn()}
                />
            );

            // El botón combobox debe mostrar "Sector Remoto 99"
            await waitFor(() => {
                expect(screen.getByRole('combobox')).toHaveTextContent('Sector Remoto 99');
            });
        });
    });
});

