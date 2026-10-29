import { createFileRoute } from '@tanstack/react-router';

const HomePage = () => (
    <div>
        <h1 className="text-2xl font-semibold">
            Seguridad e Higiene en el Trabajo (SHYMA)
        </h1>
        <p className="text-muted-foreground mt-2">
            Observaciones de Seguridad y maestras de referencia.
        </p>
    </div>
);

export const Route = createFileRoute('/_layout/')({
    component: HomePage,
});
