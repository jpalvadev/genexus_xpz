import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
    className?: string;
    size?: number;
    text?: string;
}

export default function Loading({
    className,
    size = 80,
    text = 'Espere por favor...',
}: LoadingProps) {
    return (
        <div
            className={cn(
                'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
                className,
            )}
        >
            <div className="flex flex-col items-center space-y-4">
                <Loader2 size={size} className="animate-spin text-primary" />
                {text && (
                    <p className="text-md text-muted-foreground animate-pulse">
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
}
