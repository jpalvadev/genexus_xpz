import { useState, useCallback, useEffect } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getCroppedImgFile, type PixelCrop } from '@/utils/cropImage';
import { ZoomIn, ZoomOut, Loader2 } from 'lucide-react';

export interface AspectRatioOption {
    label: string;
    value: number;
}

export interface ImageCropperDialogProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string | null;
    onSave: (croppedFile: File) => Promise<void> | void;
    isSaving?: boolean;
    cropShape?: 'round' | 'rect';
    aspect?: number;
    aspectRatios?: AspectRatioOption[];
    title?: string;
    outputFileName?: string;
    saveLabel?: string;
}

export default function ImageCropperDialog({
    isOpen,
    onClose,
    imageSrc,
    onSave,
    isSaving = false,
    cropShape = 'rect',
    aspect = 1,
    aspectRatios,
    title = 'Recortar imagen',
    outputFileName = 'image.jpg',
    saveLabel = 'Aplicar recorte',
}: ImageCropperDialogProps) {
    const initialAspect = aspectRatios && aspectRatios.length > 0 ? (aspectRatios.find(a => a.value === aspect)?.value ?? aspectRatios[0].value) : aspect;
    const [currentAspect, setCurrentAspect] = useState<number>(initialAspect);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);

    // Reset aspect ratio and zoom when opening with a new image or aspect
    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setCrop({ x: 0, y: 0 });
            setCurrentAspect(initialAspect);
        }
    }, [isOpen, initialAspect]);

    const onCropComplete = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
        setCroppedAreaPixels(currentCroppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        try {
            const file = await getCroppedImgFile(
                imageSrc,
                croppedAreaPixels,
                outputFileName,
            );
            await onSave(file);
        } catch (error) {
            console.error('Error al recortar la imagen:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    {/* Contenedor del Cropper */}
                    <div className="relative w-full h-72 rounded-md overflow-hidden bg-muted select-none">
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={currentAspect}
                                cropShape={cropShape}
                                showGrid={cropShape !== 'round'}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        )}
                    </div>

                    {/* Selector de relación de aspecto (píldoras / botones segmentados) */}
                    {aspectRatios && aspectRatios.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-muted-foreground font-medium">Relación de aspecto</span>
                            <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Relación de aspecto">
                                {aspectRatios.map((option) => {
                                    const isSelected = Math.abs(currentAspect - option.value) < 0.001;
                                    return (
                                        <Button
                                            key={option.label}
                                            type="button"
                                            size="sm"
                                            variant={isSelected ? 'default' : 'outline'}
                                            className="h-8 px-3 text-xs font-medium"
                                            disabled={isSaving}
                                            onClick={() => setCurrentAspect(option.value)}
                                        >
                                            {option.label}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Control de Zoom */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <Label htmlFor="zoom-slider">Zoom</Label>
                            <span>{Math.round(zoom * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ZoomOut className="size-4 text-muted-foreground shrink-0" />
                            <input
                                id="zoom-slider"
                                type="range"
                                min={1}
                                max={3}
                                step={0.05}
                                value={zoom}
                                aria-label="Zoom"
                                disabled={isSaving}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <ZoomIn className="size-4 text-muted-foreground shrink-0" />
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || !croppedAreaPixels}
                    >
                        {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                        {isSaving ? 'Guardando...' : saveLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
