import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageCropperDialog from './ImageCropperDialog';
import * as cropImageUtil from '@/utils/cropImage';

vi.mock('react-easy-crop', () => {
    return {
        default: ({ onCropComplete, aspect, cropShape }: any) => {
            return (
                <div data-testid="mock-cropper" data-aspect={aspect} data-shape={cropShape}>
                    <button
                        type="button"
                        onClick={() =>
                            onCropComplete(
                                { x: 0, y: 0, width: 100, height: 100 },
                                { x: 10, y: 10, width: 200, height: 200 },
                            )
                        }
                    >
                        Simular recorte
                    </button>
                </div>
            );
        },
    };
});

describe('ImageCropperDialog', () => {
    const aspectRatios = [
        { label: '16:9', value: 16 / 9 },
        { label: '4:3', value: 4 / 3 },
        { label: '1:1', value: 1 },
    ];

    it('renderiza título personalizado, selector de aspect ratio y controles de zoom', () => {
        render(
            <ImageCropperDialog
                isOpen={true}
                onClose={vi.fn()}
                imageSrc="blob:test-tenant-logo"
                onSave={vi.fn()}
                title="Recortar logo de empresa"
                aspect={16 / 9}
                aspectRatios={aspectRatios}
            />,
        );

        expect(screen.getByText('Recortar logo de empresa')).toBeInTheDocument();
        expect(screen.getByTestId('mock-cropper')).toBeInTheDocument();
        expect(screen.getByText('Relación de aspecto')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '16:9' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '4:3' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '1:1' })).toBeInTheDocument();
        expect(screen.getByLabelText('Zoom')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /aplicar recorte/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('permite cambiar la relación de aspecto al hacer clic en las píldoras', async () => {
        const user = userEvent.setup();
        render(
            <ImageCropperDialog
                isOpen={true}
                onClose={vi.fn()}
                imageSrc="blob:test-tenant-logo"
                onSave={vi.fn()}
                aspect={16 / 9}
                aspectRatios={aspectRatios}
            />,
        );

        const cropper = screen.getByTestId('mock-cropper');
        expect(cropper.getAttribute('data-aspect')).toBe((16 / 9).toString());

        const button43 = screen.getByRole('button', { name: '4:3' });
        await user.click(button43);

        expect(cropper.getAttribute('data-aspect')).toBe((4 / 3).toString());

        const button11 = screen.getByRole('button', { name: '1:1' });
        await user.click(button11);

        expect(cropper.getAttribute('data-aspect')).toBe('1');
    });

    it('llama a onClose al cancelar', async () => {
        const user = userEvent.setup();
        const onCloseMock = vi.fn();

        render(
            <ImageCropperDialog
                isOpen={true}
                onClose={onCloseMock}
                imageSrc="blob:test-tenant-logo"
                onSave={vi.fn()}
            />,
        );

        const cancelButton = screen.getByRole('button', { name: /cancelar/i });
        await user.click(cancelButton);

        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('cambia el zoom mediante el slider', () => {
        render(
            <ImageCropperDialog
                isOpen={true}
                onClose={vi.fn()}
                imageSrc="blob:test-tenant-logo"
                onSave={vi.fn()}
            />,
        );

        const slider = screen.getByLabelText('Zoom');
        fireEvent.change(slider, { target: { value: '2.5' } });

        expect(screen.getByText('250%')).toBeInTheDocument();
    });

    it('llama a onSave con el archivo recortado al guardar', async () => {
        const user = userEvent.setup();
        const onSaveMock = vi.fn().mockResolvedValue(undefined);
        const dummyFile = new File(['cropped-data'], 'logo.jpg', { type: 'image/jpeg' });

        vi.spyOn(cropImageUtil, 'getCroppedImgFile').mockResolvedValue(dummyFile);

        render(
            <ImageCropperDialog
                isOpen={true}
                onClose={vi.fn()}
                imageSrc="blob:test-tenant-logo"
                onSave={onSaveMock}
                outputFileName="logo.jpg"
                saveLabel="Confirmar logo"
            />,
        );

        const triggerCropBtn = screen.getByText('Simular recorte');
        await user.click(triggerCropBtn);

        const saveButton = screen.getByRole('button', { name: /confirmar logo/i });
        await user.click(saveButton);

        expect(cropImageUtil.getCroppedImgFile).toHaveBeenCalledWith(
            'blob:test-tenant-logo',
            { x: 10, y: 10, width: 200, height: 200 },
            'logo.jpg',
        );
        expect(onSaveMock).toHaveBeenCalledWith(dummyFile);
    });
});

