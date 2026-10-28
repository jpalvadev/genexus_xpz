import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface SignatureInputProps {
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    className?: string;
    height?: number;
    label?: string;
    description?: string;
}

export const SignatureInput: React.FC<SignatureInputProps> = ({
    value,
    onChange,
    disabled = false,
    className = '',
    height = 160,
    label,
    description,
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isDrawingRef = useRef(false);
    const [isEmpty, setIsEmpty] = useState(true);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
    }, []);

    const initCanvasSize = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        const width = rect.width || 400;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#09090B'; // zinc-950
            ctx.lineWidth = 2.5;

            if (value && value.startsWith('data:image')) {
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    setIsEmpty(false);
                };
                img.src = value;
            } else {
                clearCanvas();
            }
        }
    }, [height, value, clearCanvas]);

    useEffect(() => {
        initCanvasSize();

        const handleResize = () => {
            initCanvasSize();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [initCanvasSize]);

    // Handle initial / external value changes
    useEffect(() => {
        if (!value) {
            clearCanvas();
        } else if (value.startsWith('data:image')) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const container = containerRef.current;
            const width = container?.getBoundingClientRect().width || 400;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const img = new Image();
            img.onload = () => {
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
                ctx.drawImage(img, 0, 0, width, height);
                setIsEmpty(false);
            };
            img.src = value;
        }
    }, [value, clearCanvas, height]);

    const getCoordinates = (
        e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ): { x: number; y: number } | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();

        if ('touches' in e) {
            const touch = e.touches[0];
            if (!touch) return null;
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
            };
        } else {
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        }
    };

    const startDrawing = (
        e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
        if (disabled) return;
        const coords = getCoordinates(e);
        if (!coords) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        isDrawingRef.current = true;
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    };

    const draw = (
        e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
        if (!isDrawingRef.current || disabled) return;
        const coords = getCoordinates(e);
        if (!coords) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        setIsEmpty(false);
    };

    const stopDrawing = () => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');
        if (onChange) {
            onChange(dataUrl);
        }
    };

    const handleClear = () => {
        if (disabled) return;
        clearCanvas();
        if (onChange) {
            onChange('');
        }
    };

    return (
        <div ref={containerRef} className={`flex flex-col gap-1.5 w-full ${className}`}>
            <div
                className={`relative border rounded-md overflow-hidden bg-background ${
                    disabled ? 'opacity-70 cursor-not-allowed bg-muted/30' : ''
                }`}
                style={{ height }}
            >
                <canvas
                    ref={canvasRef}
                    style={{ touchAction: 'none' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    onTouchCancel={stopDrawing}
                    className={`block w-full h-full ${disabled ? '' : 'cursor-crosshair'}`}
                />

                {isEmpty && !disabled && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-muted-foreground/40 select-none">
                        Firme aquí utilizando el mouse o el dedo
                    </div>
                )}
            </div>

            <div className="flex items-start justify-between gap-4 px-0.5">
                <div className="flex flex-col min-w-0">
                    {label && (
                        <span className="text-sm font-medium text-foreground leading-tight">
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className="text-xs text-muted-foreground leading-normal mt-0.5">
                            {description}
                        </span>
                    )}
                </div>

                {!disabled && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                        disabled={isEmpty}
                        className="h-8 text-xs gap-1.5 shrink-0"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Limpiar firma
                    </Button>
                )}
            </div>
        </div>
    );
};
