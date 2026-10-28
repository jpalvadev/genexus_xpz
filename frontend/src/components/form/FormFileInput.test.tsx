import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent } from '@/test/test-utils';
import GenericForm, { type FieldConfig } from '../GenericForm';
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

const schema = z.object({
    avatar: z.any().optional(),
});

type FormData = z.infer<typeof schema>;

vi.mock('@/components/common/ImageCropperDialog', () => ({
    default: ({ isOpen, onClose, onSave, title }: any) => {
        if (!isOpen) return null;
        return (
            <div data-testid="mock-cropper-dialog">
                <span>{title}</span>
                <button
                    type="button"
                    onClick={() =>
                        onSave(new File(['cropped-data'], 'cropped.jpg', { type: 'image/jpeg' }))
                    }
                >
                    Confirmar recorte
                </button>
                <button type="button" onClick={onClose}>
                    Cancelar recorte
                </button>
            </div>
        );
    },
}));

const fileFields: FieldConfig<FormData>[] = [
    {
        name: 'avatar',
        label: 'Foto de perfil',
        formField: 'fileInput',
        accept: 'image/*',
        description: 'Seleccioná una imagen para tu foto de perfil (opcional)',
    },
];

describe('FormFileInput component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock URL.createObjectURL / revokeObjectURL for jsdom
        window.URL.createObjectURL = vi.fn(() => 'blob:mock-image-url');
        window.URL.revokeObjectURL = vi.fn();
    });

    it('en modo create renderiza el input de archivo y permite seleccionar y quitar una imagen', () => {
        renderWithProviders(
            <GenericForm<FormData>
                initialData={{ avatar: null }}
                mode="create"
                schema={schema}
                fields={fileFields}
                isPending={false}
                onSubmit={vi.fn()}
            />
        );

        const input = screen.getByLabelText(/Foto de perfil/i);
        expect(input).toBeInTheDocument();
        expect(screen.getByText(/Seleccioná una imagen para tu foto de perfil/i)).toBeInTheDocument();

        // Al seleccionar un archivo
        const file = new File(['content'], 'avatar.png', { type: 'image/png' });
        fireEvent.change(input, { target: { files: [file] } });

        // Aparece la vista previa y el botón de quitar
        expect(screen.getByAltText('Vista previa')).toBeInTheDocument();
        const clearBtn = screen.getByTitle('Quitar archivo');
        expect(clearBtn).toBeInTheDocument();

        // Al presionar el botón de quitar, se limpia la vista previa
        fireEvent.click(clearBtn);
        expect(screen.queryByAltText('Vista previa')).not.toBeInTheDocument();
    });

    it('B10: en modo view no debe renderizar leyendas instructivas de selección y debe mostrar badge si no hay imagen', () => {
        // En modo view (solo lectura), la leyenda instructiva "Seleccioná una imagen..." confunde al usuario
        // porque no está habilitada la carga ni selección. Si no hay imagen, debe mostrar un placeholder tipo "Sin imagen registrada".
        const { rerender } = renderWithProviders(
            <GenericForm<FormData>
                initialData={{ avatar: null }}
                mode="view"
                schema={schema}
                fields={fileFields}
                isPending={false}
                onSubmit={vi.fn()}
            />
        );

        expect(
            screen.queryByText(/Seleccioná una imagen para tu foto de perfil/i)
        ).not.toBeInTheDocument();
        expect(screen.getByText(/Sin imagen registrada/i)).toBeInTheDocument();

        // Si ya hay una imagen cargada en modo view, muestra la vista previa pero sin leyendas instructivas
        rerender(
            <GenericForm<FormData>
                initialData={{ avatar: '/uploads/images/avatar.webp' }}
                mode="view"
                schema={schema}
                fields={fileFields}
                isPending={false}
                onSubmit={vi.fn()}
            />
        );
        expect(
            screen.queryByText(/Seleccioná una imagen para tu foto de perfil/i)
        ).not.toBeInTheDocument();
        expect(screen.getByAltText('Vista previa')).toBeInTheDocument();
    });

    it('B10: en modo update con imagen existente no debe mostrar input nativo con "sin archivos seleccionados" sino controles claros de imagen actual', () => {
        // En modo update con una URL existente, el input nativo del navegador expone "Sin archivos seleccionados"
        // junto a una cruz de eliminación y la imagen previa, lo cual es confuso.
        // Se espera que oculte el selector nativo y presente controles claros como "Imagen actual" y "Cambiar imagen".
        renderWithProviders(
            <GenericForm<FormData>
                initialData={{ avatar: '/uploads/images/avatar.webp' }}
                mode="update"
                schema={schema}
                fields={fileFields}
                isPending={false}
                onSubmit={vi.fn()}
            />
        );

        expect(screen.getByAltText('Vista previa')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cambiar imagen/i })).toBeInTheDocument();
        expect(screen.queryByDisplayValue('')).not.toBeInTheDocument();
    });

    it('cuando enableCrop está activo, al seleccionar una imagen abre el diálogo de recorte y al confirmar actualiza la vista previa', () => {
        const cropFields: FieldConfig<FormData>[] = [
            {
                name: 'avatar',
                label: 'Logo del tenant',
                formField: 'fileInput',
                accept: 'image/*',
                enableCrop: true,
                cropShape: 'rect',
                defaultAspect: 16 / 9,
                aspectRatios: [
                    { label: '16:9', value: 16 / 9 },
                    { label: '4:3', value: 4 / 3 },
                    { label: '1:1', value: 1 },
                ],
            },
        ];

        renderWithProviders(
            <GenericForm<FormData>
                initialData={{ avatar: null }}
                mode="create"
                schema={schema}
                fields={cropFields}
                isPending={false}
                onSubmit={vi.fn()}
            />
        );

        const input = screen.getByLabelText(/Logo del tenant/i);
        const file = new File(['raw-image'], 'tenant-logo.png', { type: 'image/png' });
        fireEvent.change(input, { target: { files: [file] } });

        // Se abre el modal de recorte
        expect(screen.getByTestId('mock-cropper-dialog')).toBeInTheDocument();
        expect(screen.getByText('Recortar logo del tenant')).toBeInTheDocument();

        // Al confirmar el recorte
        const confirmBtn = screen.getByText('Confirmar recorte');
        fireEvent.click(confirmBtn);

        // Se cierra el modal y aparece la vista previa
        expect(screen.queryByTestId('mock-cropper-dialog')).not.toBeInTheDocument();
        expect(screen.getByAltText('Vista previa')).toBeInTheDocument();
    });

    it('cuando enableCrop está activo, al cancelar el diálogo de recorte no guarda la imagen', () => {
        const cropFields: FieldConfig<FormData>[] = [
            {
                name: 'avatar',
                label: 'Logo del tenant',
                formField: 'fileInput',
                accept: 'image/*',
                enableCrop: true,
            },
        ];

        renderWithProviders(
            <GenericForm<FormData>
                initialData={{ avatar: null }}
                mode="create"
                schema={schema}
                fields={cropFields}
                isPending={false}
                onSubmit={vi.fn()}
            />
        );

        const input = screen.getByLabelText(/Logo del tenant/i);
        const file = new File(['raw-image'], 'tenant-logo.png', { type: 'image/png' });
        fireEvent.change(input, { target: { files: [file] } });

        expect(screen.getByTestId('mock-cropper-dialog')).toBeInTheDocument();

        // Al cancelar el recorte
        const cancelBtn = screen.getByText('Cancelar recorte');
        fireEvent.click(cancelBtn);

        // No hay vista previa cargada
        expect(screen.queryByTestId('mock-cropper-dialog')).not.toBeInTheDocument();
        expect(screen.queryByAltText('Vista previa')).not.toBeInTheDocument();
    });
});


