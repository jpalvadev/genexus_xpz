import { Button } from '@/components/ui/button';
import { useRouter } from '@tanstack/react-router';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="h-full flex items-center justify-center bg-background">
            <div className="text-center space-y-6 max-w-md mx-auto px-4">
                <div className="space-y-2">
                    <h1 className="text-9xl font-bold text-muted-foreground">
                        404
                    </h1>
                    <h2 className="text-2xl font-semibold">
                        Página no encontrada
                    </h2>
                    <p className="text-muted-foreground">
                        La página que está buscando no existe o fue movida.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={() => router.history.back()}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Volver
                    </Button>

                    <Button
                        onClick={() => router.navigate({ to: '/' })}
                        className="flex items-center gap-2"
                    >
                        <Home size={16} />
                        Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
