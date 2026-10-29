import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { GridifyQuery } from '@/utils/gridifyFilter';
import { securityObservationService } from '../services/securityObservation.service';

export function useSecurityObservationsQuery(gridifyQuery: GridifyQuery) {
    return useQuery({
        queryKey: ['securityObservations', gridifyQuery],
        queryFn: () => securityObservationService.getAllPaginated(gridifyQuery),
        placeholderData: keepPreviousData,
    });
}
