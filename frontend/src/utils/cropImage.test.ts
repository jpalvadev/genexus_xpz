import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCroppedImgFile, type PixelCrop } from './cropImage';

describe('cropImage utility', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('recorta la imagen usando un canvas y devuelve un archivo File', async () => {
        // Mock de Image
        const originalImage = window.Image;
        class MockImage {
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null;
            src: string = '';
            addEventListener(event: string, callback: () => void) {
                if (event === 'load') this.onload = callback;
                if (event === 'error') this.onerror = callback;
            }
            setAttribute() {}
            constructor() {
                setTimeout(() => {
                    if (this.onload) this.onload();
                }, 0);
            }
        }
        window.Image = MockImage as unknown as typeof Image;

        // Mock de Canvas y 2D context
        const mockDrawImage = vi.fn();
        const mockToBlob = vi.fn((callback: (blob: Blob | null) => void) => {
            const blob = new Blob(['mock-image-data'], { type: 'image/jpeg' });
            callback(blob);
        });

        const originalCreateElement = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
            if (tagName.toLowerCase() === 'canvas') {
                return {
                    width: 0,
                    height: 0,
                    getContext: (contextId: string) => {
                        if (contextId === '2d') {
                            return {
                                drawImage: mockDrawImage,
                            } as unknown as CanvasRenderingContext2D;
                        }
                        return null;
                    },
                    toBlob: mockToBlob,
                } as unknown as HTMLCanvasElement;
            }
            return originalCreateElement(tagName);
        });

        const pixelCrop: PixelCrop = {
            x: 10,
            y: 20,
            width: 100,
            height: 100,
        };

        const resultFile = await getCroppedImgFile('blob:test-image', pixelCrop, 'test-avatar.jpg');

        expect(resultFile).toBeInstanceOf(File);
        expect(resultFile.name).toBe('test-avatar.jpg');
        expect(resultFile.type).toBe('image/jpeg');
        expect(mockDrawImage).toHaveBeenCalledWith(
            expect.anything(),
            10,
            20,
            100,
            100,
            0,
            0,
            100,
            100,
        );

        window.Image = originalImage;
    });

    it('lanza un error si el canvas no puede proveer un blob', async () => {
        const originalImage = window.Image;
        class MockImage {
            onload: (() => void) | null = null;
            addEventListener(event: string, callback: () => void) {
                if (event === 'load') this.onload = callback;
            }
            setAttribute() {}
            constructor() {
                setTimeout(() => {
                    if (this.onload) this.onload();
                }, 0);
            }
        }
        window.Image = MockImage as unknown as typeof Image;

        vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
            if (tagName.toLowerCase() === 'canvas') {
                return {
                    width: 0,
                    height: 0,
                    getContext: () => ({
                        drawImage: vi.fn(),
                    }),
                    toBlob: (callback: (blob: Blob | null) => void) => {
                        callback(null);
                    },
                } as unknown as HTMLCanvasElement;
            }
            return document.createElement(tagName);
        });

        const pixelCrop: PixelCrop = { x: 0, y: 0, width: 50, height: 50 };

        await expect(getCroppedImgFile('blob:test', pixelCrop)).rejects.toThrow(
            'Canvas export produced empty blob',
        );

        window.Image = originalImage;
    });
});

