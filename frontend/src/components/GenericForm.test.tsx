import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor, fireEvent } from '@/test/test-utils';
import GenericForm, { type FieldConfig } from './GenericForm';
import { z } from 'zod';

const mockNavigate = vi.fn();
const mockBack = vi.fn();
let mockCanGoBackValue = true;

vi.mock('@tanstack/react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tanstack/react-router')>();
    return {
        ...actual,
        useRouter: () => ({
            navigate: mockNavigate,
            history: { back: mockBack },
        }),
        useCanGoBack: () => mockCanGoBackValue,
    };
});

const testSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    age: z.coerce.number().min(18, 'Debe ser mayor de 18 años'),
});

type TestFormData = z.infer<typeof testSchema>;

const testFields: FieldConfig<TestFormData>[] = [
    {
        name: 'name',
        label: 'Nombre completo',
        formField: 'input',
        type: 'text',
        colSpan: 12,
    },
    {
        name: 'age',
        label: 'Edad',
        formField: 'input',
        type: 'number',
        colSpan: 12,
    },
];

describe('GenericForm component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCanGoBackValue = true;
    });

    it('renderiza los campos y labels con los datos iniciales', () => {
        renderWithProviders(
            <GenericForm<TestFormData>
                initialData={{ name: 'Carlos Gomez', age: 25 }}
                mode="create"
                schema={testSchema}
                fields={testFields}
                isPending={false}
                onSubmit={vi.fn()}
            />
        );

        expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument();
        expect(screen.getByLabelText('Edad')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Carlos Gomez')).toBeInTheDocument();
        expect(screen.getByDisplayValue('25')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
    });

    it('muestra errores de validación de Zod al enviar datos inválidos', async () => {
        const onSubmitMock = vi.fn();

        renderWithProviders(
            <GenericForm<TestFormData>
                initialData={{ name: '', age: 10 }}
                mode="create"
                schema={testSchema}
                fields={testFields}
                isPending={false}
                onSubmit={onSubmitMock}
            />
        );

        const submitBtn = screen.getByRole('button', { name: 'Guardar' });
        fireEvent.submit(submitBtn.closest('form')!);

        await waitFor(() => {
            expect(screen.getByText('El nombre debe tener al menos 3 caracteres')).toBeInTheDocument();
            expect(screen.getByText('Debe ser mayor de 18 años')).toBeInTheDocument();
        });

        expect(onSubmitMock).not.toHaveBeenCalled();
    });

    it('onSubmit recibe los valores parseados cuando los datos son válidos', async () => {
        const onSubmitMock = vi.fn();

        const { user } = renderWithProviders(
            <GenericForm<TestFormData>
                initialData={{ name: '', age: 0 }}
                mode="create"
                schema={testSchema}
                fields={testFields}
                isPending={false}
                onSubmit={onSubmitMock}
            />
        );

        const nameInput = screen.getByLabelText('Nombre completo');
        const ageInput = screen.getByLabelText('Edad');
        const submitBtn = screen.getByRole('button', { name: 'Guardar' });

        await user.type(nameInput, 'Mariana López');
        await user.type(ageInput, '28');

        fireEvent.submit(submitBtn.closest('form')!);

        await waitFor(() => {
            expect(onSubmitMock).toHaveBeenCalledWith({
                name: 'Mariana López',
                age: 28,
            });
        });
    });

    it('onBeforeSubmit que devuelve false cancela el submit e impide la llamada a onSubmit', async () => {
        const onSubmitMock = vi.fn();
        const onBeforeSubmitMock = vi.fn().mockResolvedValue(false);

        const { user } = renderWithProviders(
            <GenericForm<TestFormData>
                initialData={{ name: 'Lucas', age: 22 }}
                mode="create"
                schema={testSchema}
                fields={testFields}
                isPending={false}
                onBeforeSubmit={onBeforeSubmitMock}
                onSubmit={onSubmitMock}
            />
        );

        const submitBtn = screen.getByRole('button', { name: 'Guardar' });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(onBeforeSubmitMock).toHaveBeenCalledWith({
                name: 'Lucas',
                age: 22,
            });
        });

        expect(onSubmitMock).not.toHaveBeenCalled();
    });

    it('onBeforeSubmit que devuelve true permite continuar con el submit', async () => {
        const onSubmitMock = vi.fn();
        const onBeforeSubmitMock = vi.fn().mockResolvedValue(true);

        const { user } = renderWithProviders(
            <GenericForm<TestFormData>
                initialData={{ name: 'Lucas', age: 22 }}
                mode="create"
                schema={testSchema}
                fields={testFields}
                isPending={false}
                onBeforeSubmit={onBeforeSubmitMock}
                onSubmit={onSubmitMock}
            />
        );

        const submitBtn = screen.getByRole('button', { name: 'Guardar' });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(onBeforeSubmitMock).toHaveBeenCalled();
            expect(onSubmitMock).toHaveBeenCalledWith({
                name: 'Lucas',
                age: 22,
            });
        });
    });

    it('en modo "view" los campos quedan deshabilitados', () => {
        renderWithProviders(
            <GenericForm<TestFormData>
                initialData={{ name: 'Solo Lectura', age: 40 }}
                mode="view"
                schema={testSchema}
                fields={testFields}
                isPending={false}
                onSubmit={vi.fn()}
            />
        );

        const nameInput = screen.getByLabelText('Nombre completo');
        const ageInput = screen.getByLabelText('Edad');

        expect(nameInput).toBeDisabled();
        expect(ageInput).toBeDisabled();
    });

    it('el botón Volver navega hacia atrás si canGoBack es true', async () => {
        mockCanGoBackValue = true;
        const { user } = renderWithProviders(
            <GenericForm<TestFormData>
                initialData={{ name: 'Test', age: 30 }}
                mode="create"
                schema={testSchema}
                fields={testFields}
                isPending={false}
                onSubmit={vi.fn()}
            />
        );

        const backBtn = screen.getByRole('button', { name: 'Volver' });
        await user.click(backBtn);

        expect(mockBack).toHaveBeenCalledTimes(1);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('el botón Volver navega a "/" si canGoBack es false', async () => {
        mockCanGoBackValue = false;
        const { user } = renderWithProviders(
            <GenericForm<TestFormData>
                initialData={{ name: 'Test', age: 30 }}
                mode="create"
                schema={testSchema}
                fields={testFields}
                isPending={false}
                onSubmit={vi.fn()}
            />
        );

        const backBtn = screen.getByRole('button', { name: 'Volver' });
        await user.click(backBtn);

        expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
        expect(mockBack).not.toHaveBeenCalled();
    });

    it('oculta el botón Volver y el contenedor de acciones cuando showBackButton es false en modo view', () => {
        renderWithProviders(
            <GenericForm<TestFormData>
                initialData={{ name: 'Test', age: 30 }}
                mode="view"
                schema={testSchema}
                fields={testFields}
                isPending={false}
                showBackButton={false}
            />
        );

        expect(screen.queryByRole('button', { name: 'Volver' })).not.toBeInTheDocument();
    });

    it('renderiza el botón Volver con texto personalizado según backLabel', () => {
        renderWithProviders(
            <GenericForm<TestFormData>
                initialData={{ name: 'Test', age: 30 }}
                mode="create"
                schema={testSchema}
                fields={testFields}
                isPending={false}
                backLabel="Regresar"
                onSubmit={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: 'Regresar' })).toBeInTheDocument();
    });

    describe('Indicador de campo requerido (asterisco rojo)', () => {
        const requiredTestSchema = z.object({
            requiredField: z.string().min(1),
            optionalField: z.string().optional(),
        });

        type RequiredTestFormData = z.infer<typeof requiredTestSchema>;

        const fieldsWithMixedRequirements: FieldConfig<RequiredTestFormData>[] = [
            {
                name: 'requiredField',
                label: 'Campo Obligatorio',
                formField: 'input',
            },
            {
                name: 'optionalField',
                label: 'Campo Opcional',
                formField: 'input',
            },
        ];

        it('muestra el asterisco rojo y la clase print:hidden en campos requeridos por Zod en modo create', () => {
            renderWithProviders(
                <GenericForm<RequiredTestFormData>
                    initialData={{ requiredField: '', optionalField: '' }}
                    mode="create"
                    schema={requiredTestSchema}
                    fields={fieldsWithMixedRequirements}
                    isPending={false}
                    onSubmit={vi.fn()}
                />
            );

            const reqLabel = screen.getByText('Campo Obligatorio');
            expect(reqLabel).toBeInTheDocument();
            const asterisk = reqLabel.parentElement?.querySelector('span');
            expect(asterisk).toBeInTheDocument();
            expect(asterisk?.textContent).toBe('*');
            expect(asterisk).toHaveClass('text-destructive');
            expect(asterisk).toHaveClass('print:hidden');

            const optLabel = screen.getByText('Campo Opcional');
            expect(optLabel.parentElement?.querySelector('span')).toBeNull();
        });

        it('oculta el asterisco en modo view y delete aun cuando el campo sea requerido', () => {
            const { unmount } = renderWithProviders(
                <GenericForm<RequiredTestFormData>
                    initialData={{ requiredField: 'Valor', optionalField: '' }}
                    mode="view"
                    schema={requiredTestSchema}
                    fields={fieldsWithMixedRequirements}
                    isPending={false}
                />
            );

            expect(screen.getByText('Campo Obligatorio').parentElement?.querySelector('span')).toBeNull();
            unmount();

            renderWithProviders(
                <GenericForm<RequiredTestFormData>
                    initialData={{ requiredField: 'Valor', optionalField: '' }}
                    mode="delete"
                    schema={requiredTestSchema}
                    fields={fieldsWithMixedRequirements}
                    isPending={false}
                />
            );

            expect(screen.getByText('Campo Obligatorio').parentElement?.querySelector('span')).toBeNull();
        });

        it('permite sobrescribir la obligatoriedad explícitamente mediante FieldConfig.required', () => {
            const overriddenFields: FieldConfig<RequiredTestFormData>[] = [
                {
                    name: 'requiredField',
                    label: 'Campo Obligatorio Forzado Opcional',
                    formField: 'input',
                    required: false, // Forzar que no sea requerido
                },
                {
                    name: 'optionalField',
                    label: 'Campo Opcional Forzado Requerido',
                    formField: 'input',
                    required: true, // Forzar que sea requerido
                },
            ];

            renderWithProviders(
                <GenericForm<RequiredTestFormData>
                    initialData={{ requiredField: '', optionalField: '' }}
                    mode="create"
                    schema={requiredTestSchema}
                    fields={overriddenFields}
                    isPending={false}
                    onSubmit={vi.fn()}
                />
            );

            const falseReqLabel = screen.getByText('Campo Obligatorio Forzado Opcional');
            expect(falseReqLabel.parentElement?.querySelector('span')).toBeNull();

            const forcedReqLabel = screen.getByText('Campo Opcional Forzado Requerido');
            const asterisk = forcedReqLabel.parentElement?.querySelector('span');
            expect(asterisk).toBeInTheDocument();
            expect(asterisk?.textContent).toBe('*');
            expect(asterisk).toHaveClass('text-destructive');
        });
    });

    describe('formField button', () => {
        it('renderiza un botón con su texto, variante, descripción y llama a onClick sin disparar submit', async () => {
            const onClickMock = vi.fn();
            const onSubmitMock = vi.fn();

            const buttonFields: FieldConfig<TestFormData>[] = [
                {
                    name: 'name',
                    label: 'Nombre',
                    formField: 'input',
                },
                {
                    name: 'testAction' as any,
                    label: 'Acción personalizada',
                    formField: 'button',
                    buttonText: 'Ejecutar acción',
                    buttonVariant: 'outline',
                    description: 'Descripción de la acción.',
                    onClick: onClickMock,
                },
            ];

            const { user } = renderWithProviders(
                <GenericForm<TestFormData>
                    initialData={{ name: 'Juan', age: 30 }}
                    mode="update"
                    schema={testSchema}
                    fields={buttonFields}
                    isPending={false}
                    onSubmit={onSubmitMock}
                />
            );

            expect(screen.getByText('Acción personalizada')).toBeInTheDocument();
            expect(screen.getByText('Descripción de la acción.')).toBeInTheDocument();
            const actionButton = screen.getByRole('button', { name: /ejecutar acción/i });
            expect(actionButton).toBeInTheDocument();
            expect(actionButton).toHaveAttribute('type', 'button');

            await user.click(actionButton);

            expect(onClickMock).toHaveBeenCalledTimes(1);
            expect(onClickMock).toHaveBeenCalledWith(expect.objectContaining({ name: 'Juan', age: 30 }));
            expect(onSubmitMock).not.toHaveBeenCalled();
        });

        it('deshabilita el botón si mode es view o f.disabled es true', () => {
            const buttonFields: FieldConfig<TestFormData>[] = [
                {
                    name: 'testAction' as any,
                    formField: 'button',
                    buttonText: 'Acción deshabilitada',
                    onClick: vi.fn(),
                },
            ];

            renderWithProviders(
                <GenericForm<TestFormData>
                    initialData={{ name: 'Juan', age: 30 }}
                    mode="view"
                    schema={testSchema}
                    fields={buttonFields}
                    isPending={false}
                    onSubmit={vi.fn()}
                />
            );

            const actionButton = screen.getByRole('button', { name: /acción deshabilitada/i });
            expect(actionButton).toBeDisabled();
        });
    });
});

