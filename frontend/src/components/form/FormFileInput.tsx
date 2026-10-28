import { useState, useRef } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FormBase, type FormControlProps } from './FormBase';
import { useFieldContext } from './hooks';
import { FileText, Upload, Trash2 } from 'lucide-react';
import ImageCropperDialog, { type AspectRatioOption } from '@/components/common/ImageCropperDialog';

export function resolveFileUrl(url: string): string {
    if (!url) return '';
    if (
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('blob:') ||
        url.startsWith('data:')
    ) {
        return url;
    }
    const rawApiUrl =
        import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_URL ||
        '';

    let origin = rawApiUrl;
    try {
        const parsed = new URL(rawApiUrl);
        origin = parsed.origin;
    } catch {
        origin = rawApiUrl.replace(/\/api\/v1\/?$/, '');
    }

    return `${origin.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
}

export interface FormFileInputProps extends FormControlProps {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    enableCrop?: boolean;
    cropShape?: 'round' | 'rect';
    aspectRatios?: AspectRatioOption[];
    defaultAspect?: number;
}

export default function FormFileInput(props: FormFileInputProps) {
    const [preview, setPreview] = useState<string>('');
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const field = useFieldContext<File | string | null>();
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.currentTarget.files?.[0] || null;
        if (!file) {
            field.handleChange(null);
            setPreview('');
            if (props.onChange) {
                props.onChange(e);
            }
            return;
        }

        const isImage = file.type.startsWith('image/');
        if (props.enableCrop && isImage) {
            const objectUrl = URL.createObjectURL(file);
            setCropImageSrc(objectUrl);
            setIsCropperOpen(true);
            return;
        }

        field.handleChange(file);
        if (isImage) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        } else {
            setPreview('');
        }

        if (props.onChange) {
            props.onChange(e);
        }
    }

    function handleCropSave(croppedFile: File) {
        field.handleChange(croppedFile);
        const url = URL.createObjectURL(croppedFile);
        setPreview(url);
        setIsCropperOpen(false);
        if (cropImageSrc) {
            URL.revokeObjectURL(cropImageSrc);
            setCropImageSrc(null);
        }
    }

    function handleCropClose() {
        setIsCropperOpen(false);
        if (cropImageSrc) {
            URL.revokeObjectURL(cropImageSrc);
            setCropImageSrc(null);
        }
        if (!field.state.value && inputRef.current) {
            inputRef.current.value = '';
        }
    }

    function handleClear() {
        field.handleChange(null);
        setPreview('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }

    function handleTriggerChange() {
        const tempInput = document.createElement('input');
        tempInput.type = 'file';
        if (props.accept) {
            tempInput.accept = props.accept;
        }
        tempInput.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0] || null;
            if (!file) return;

            const isImage = file.type.startsWith('image/');
            if (props.enableCrop && isImage) {
                const objectUrl = URL.createObjectURL(file);
                setCropImageSrc(objectUrl);
                setIsCropperOpen(true);
                return;
            }

            field.handleChange(file);
            if (isImage) {
                setPreview(URL.createObjectURL(file));
            } else {
                setPreview('');
            }
            if (props.onChange) {
                props.onChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
            }
        };
        tempInput.click();
    }

    const currentValue = field.state.value;
    const isFileInstance = currentValue instanceof File;
    const isStringUrl = typeof currentValue === 'string' && currentValue.trim() !== '';

    const isImageMode =
        (props.accept && props.accept.includes('image')) ||
        (isFileInstance && currentValue.type.startsWith('image/')) ||
        (isStringUrl &&
            (/\.(webp|jpg|jpeg|png|gif|svg|jfif|heic)(\?.*)?$/i.test(currentValue) ||
                currentValue.startsWith('data:image/') ||
                currentValue.includes('/images/')));

    const displayUrl = preview
        ? preview
        : isStringUrl
          ? resolveFileUrl(currentValue)
          : '';

    const fileName = isFileInstance
        ? currentValue.name
        : isStringUrl
          ? currentValue.split('/').pop()?.split('?')[0] || 'Archivo adjunto'
          : '';

    const hasActiveFile = Boolean(currentValue || preview);

    return (
        <FormBase {...props} description={props.disabled ? undefined : props.description}>
            <div className="flex flex-col gap-2">
                {/* Modo lectura / deshabilitado */}
                {props.disabled ? (
                    <>
                        {!displayUrl && !fileName && (
                            <div className="flex items-center gap-2 mt-1">
                                <Badge
                                    variant="outline"
                                    className="text-muted-foreground font-normal py-1 px-2.5 h-auto text-xs"
                                >
                                    {isImageMode
                                        ? 'Sin imagen registrada'
                                        : 'Sin archivo registrado'}
                                </Badge>
                            </div>
                        )}
                    </>
                ) : (
                    /* Modo interactivo */
                    <>
                        {!hasActiveFile ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    ref={inputRef}
                                    id={field.name}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={handleChange}
                                    aria-invalid={isInvalid}
                                    disabled={props.disabled}
                                    type={props.type || 'file'}
                                    accept={props.accept}
                                    className="file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:cursor-pointer"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTriggerChange}
                                    className="flex items-center gap-1.5"
                                >
                                    <Upload className="w-4 h-4" />
                                    {isImageMode ? 'Cambiar imagen' : 'Cambiar archivo'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClear}
                                    title="Quitar archivo"
                                    aria-label="Quitar archivo"
                                    className="flex items-center gap-1.5 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Eliminar</span>
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {/* Previsualización para imagen */}
                {isImageMode && displayUrl && (
                    <div className="mt-2 w-full flex justify-start">
                        <img
                            src={displayUrl}
                            alt="Vista previa"
                            className="w-full max-h-[520px] object-contain rounded-md"
                        />
                    </div>
                )}

                {/* Previsualización para documento genérico */}
                {!isImageMode && (currentValue || fileName) && (
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/10 text-sm mt-1">
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate flex-1 font-mono text-xs">
                            {fileName}
                        </span>
                        {isStringUrl && (
                            <a
                                href={displayUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-primary underline shrink-0"
                            >
                                Ver
                            </a>
                        )}
                    </div>
                )}
            </div>

            {props.enableCrop && (
                <ImageCropperDialog
                    isOpen={isCropperOpen}
                    onClose={handleCropClose}
                    imageSrc={cropImageSrc}
                    onSave={handleCropSave}
                    cropShape={props.cropShape ?? 'rect'}
                    aspect={props.defaultAspect ?? (props.aspectRatios?.[0]?.value ?? 1)}
                    aspectRatios={props.aspectRatios}
                    title={props.label ? `Recortar ${props.label.toLowerCase()}` : 'Recortar imagen'}
                    outputFileName="imagen.jpg"
                />
            )}
        </FormBase>
    );
}
