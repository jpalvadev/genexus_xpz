import { authService } from '@/modules/auth/services/auth.service';
import { useQuery } from '@tanstack/react-query';

export function useAuthUser() {
    return useQuery({
        queryKey: ['auth', 'user'],
        queryFn: () => authService.getUser(),
        initialData: () => authService.getUser() ?? undefined,
        staleTime: Infinity, // el usuario nunca se considera stale
        retry: false, // no reintentar porque si falla es porque no está logueado
    });
}

/*
Lo que esto quiere decir es que en caso de refresh, la cache se va y va a ir a la funcion getUser, que se encarga
de leer el token del localStorage y devolver los datos del user, y sus roles.
Entonces, usamos este hook donde lo necesitemos para traer los datos, del usuario, en caso de estar la data de 
usuario y sus roles en la cache, devuelve eso, en caso de no estar (por refresh con F5), va al token y
lo decodifica

Entonces, para traer los datos del user hacemos algo así:

const { data: user } = useAuthUser();

  user.email, user.roles disponibles siempre
en F5 se reconstruye del token automáticamente

*/
