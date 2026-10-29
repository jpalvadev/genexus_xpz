import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { renderWithProviders } from '@/test/test-utils';
import {
    fixtureComboOptions,
    fixtureCompanies,
    fixtureObservers,
    fixturePlants,
    fixtureSectors,
    fixtureSecurityObservation,
} from '@/test/msw/fixtures';

import SecurityObservationForm from './SecurityObservationForm';
import { securityObservationService } from '../services/securityObservation.service';
import { plantService } from '@/modules/plants/plant.config';
import { sectorService } from '@/modules/sectors/sector.config';
import { contractorCompanyService } from '@/modules/contractorCompanies/contractorCompanies.config';
import { comboOptionService } from '@/modules/comboOptions/comboOptions.config';

vi.mock('../services/securityObservation.service', () => ({
    securityObservationService: {
        create: vi.fn(async () => ({})),
        update: vi.fn(async () => ({})),
    },
}));
// Spread the real config so the route-tree chain (which imports the module's page
// components from these files) resolves; only the feed service is faked.
vi.mock(import('@/modules/plants/plant.config'), async (importOriginal) => {
    const real = await importOriginal();
    return { ...real, plantService: { ...real.plantService, getAll: vi.fn(async () => fixturePlants) } };
});
vi.mock(import('@/modules/sectors/sector.config'), async (importOriginal) => {
    const real = await importOriginal();
    return { ...real, sectorService: { ...real.sectorService, getAll: vi.fn(async () => fixtureSectors) } };
});
vi.mock(import('@/modules/contractorCompanies/contractorCompanies.config'), async (importOriginal) => {
    const real = await importOriginal();
    return {
        ...real,
        contractorCompanyService: { ...real.contractorCompanyService, getAll: vi.fn(async () => fixtureCompanies) },
    };
});
vi.mock(import('@/modules/comboOptions/comboOptions.config'), async (importOriginal) => {
    const real = await importOriginal();
    return {
        ...real,
        comboOptionService: {
            ...real.comboOptionService,
            getAll: vi.fn(async () => fixtureComboOptions),
            getByKey: vi.fn(async (comboKey: string) =>
                fixtureComboOptions.filter((item) => item.comboKey === comboKey),
            ),
        },
    };
});
vi.mock(import('@/modules/observers/observers.config'), async (importOriginal) => {
    const real = await importOriginal();
    return {
        ...real,
        observerService: {
            ...real.observerService,
            lookup: vi.fn(async () => ({ data: fixtureObservers, rowCount: fixtureObservers.length })),
        },
    };
});

const mockRouter = { invalidate: vi.fn(), navigate: vi.fn() };
vi.mock('@tanstack/react-router', async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    useRouter: () => mockRouter,
    useCanGoBack: () => true,
}));

describe('SecurityObservationForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.spyOn(toast, 'success');
        vi.spyOn(toast, 'error');
    });

    it('renderiza el formulario con los campos principales tras cargar los catálogos', async () => {
        renderWithProviders(<SecurityObservationForm mode="create" />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
        });

        expect(plantService.getAll).toHaveBeenCalledTimes(1);
        expect(sectorService.getAll).toHaveBeenCalledTimes(1);
        expect(contractorCompanyService.getAll).toHaveBeenCalledTimes(1);
        expect(comboOptionService.getAll).toHaveBeenCalledTimes(1);

        expect(screen.getByText('Fecha de Observación')).toBeInTheDocument();
        expect(screen.getByText('Observadores')).toBeInTheDocument();
        expect(screen.getByText('Safety Review')).toBeInTheDocument();
        expect(screen.getByLabelText('APR reviewed')).toBeInTheDocument();
        expect(screen.getByLabelText('Gestión de Riesgo (Risk Management)')).toBeInTheDocument();
        expect(screen.getByText(/Rango permitido: \d{4}-\d{2}-\d{2} a \d{4}-\d{2}-\d{2}/)).toBeInTheDocument();
    });

    it('create: rechaza la vacía con los mensajes de regla y no llama al servicio', async () => {
        renderWithProviders(<SecurityObservationForm mode="create" />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
        });

        fireEvent.submit(screen.getByRole('button', { name: 'Guardar' }).closest('form')!);

        expect(await screen.findByText('Task is required')).toBeInTheDocument();
        expect(await screen.findByText('Plant is required')).toBeInTheDocument();
        expect(await screen.findByText('At least one observer is required')).toBeInTheDocument();
        expect(await screen.findAllByText('Every Safety Review answer is required')).toHaveLength(12);
        expect(await screen.findByText('At least one label is required for Risk Management')).toBeInTheDocument();
        expect(await screen.findByText('Summary is required')).toBeInTheDocument();

        expect(securityObservationService.create).not.toHaveBeenCalled();
    });

    it('create: completa el formulario y envía el payload mapeado a la API', { timeout: 20000 }, async () => {
        const { user } = renderWithProviders(<SecurityObservationForm mode="create" />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
        });

        // Textos
        await user.type(screen.getByLabelText('Tarea'), 'Cambio de esmeril');
        await user.type(screen.getByLabelText('Lugar'), 'Planta Norte - taller');

        // Selects de catálogo (Radix, portal)
        await user.click(screen.getByRole('combobox', { name: 'Planta' }));
        await user.click(await screen.findByRole('option', { name: 'Planta Norte (RNV)' }));
        await user.click(screen.getByRole('combobox', { name: 'Sector' }));
        await user.click(await screen.findByRole('option', { name: 'Control de Acceso' }));
        await user.click(screen.getByRole('combobox', { name: 'Empresa Contratista' }));
        await user.click(await screen.findByRole('option', { name: 'Protección de Instalaciones Apex' }));

        // Observadores: un solo checkbox
        await user.click(screen.getByRole('combobox', { name: 'Observadores' }));
        const observerOption = await screen.findByRole('option', { name: 'Elena Herrera — 1001' });
        await user.click(observerOption);
        await user.keyboard('{Escape}');

        // Safety Review completo
        for (const label of [
            'APR reviewed',
            'Task realized as planned',
            'Requires ATR review',
            'TRC risk',
            'Impact risk controlled',
            'Hand injury measures',
            'Injury measures',
            'Tools reviewed',
            'Mobile equipment reviewed',
            'Energy reviewed',
            'Ladder reviewed',
            'Electrical equipment circuit breaker',
        ]) {
            await user.click(screen.getByLabelText(label));
        }

        // Combos: una etiqueta por familia
        const pickCombo = async (fieldLabel: string, itemLabel: string) => {
            await user.click(screen.getByRole('combobox', { name: fieldLabel }));
            await user.click(await screen.findByRole('option', { name: itemLabel }));
            await user.keyboard('{Escape}');
        };
        await pickCombo('Gestión de Riesgo (Risk Management)', 'Daily Risk Talk (DRT)');
        await pickCombo('Protocolos Mortales (Fatal-Risk Protocols)', 'Working at Height');
        await pickCombo('Clasificación de Observación (Observation Classification)', 'Safe Condition');
        await pickCombo('Relación de Observación (Observation Relation)', 'Related to Task');

        // Textareas de detalle
        await user.type(screen.getByLabelText('Resumen de la Observación'), 'Se detectó disco vencido');
        await user.type(screen.getByLabelText('Acción Detallada (AI)'), 'Reemplazo programado');
        await user.type(screen.getByLabelText('Descripción de Acción Inmediata (AC)'), 'Equipo retirado de servicio');

        fireEvent.submit(screen.getByRole('button', { name: 'Guardar' }).closest('form')!);

        await waitFor(() => {
            expect(securityObservationService.create).toHaveBeenCalledTimes(1);
        });

        expect(securityObservationService.create).toHaveBeenCalledWith({
            observationDate: format(new Date(), 'yyyy-MM-dd'),
            task: 'Cambio de esmeril',
            lugar: 'Planta Norte - taller',
            plantId: 1,
            sectorId: 2,
            contractorCompanyId: 3,
            observers: [{ observerId: 1 }],
            aprReviewed: true,
            taskRealized: true,
            requiresAtrReview: true,
            trcRisk: true,
            impactRiskControlled: true,
            handInjuryMeasures: true,
            injuryMeasures: true,
            toolsReviewed: true,
            mobileEquipmentReviewed: true,
            energyReviewed: true,
            ladderReviewed: true,
            electricalEquipmentCircuitBreaker: true,
            controlesCriticos: '',
            gestionRiesgo: ['Daily Risk Talk (DRT)'],
            protocolosMortales: ['Working at Height'],
            clasificacionObservacion: ['Safe Condition'],
            relacionObservacion: ['Related to Task'],
            resumenObservacion: 'Se detectó disco vencido',
            detalleAI: 'Reemplazo programado',
            descripcionAC: 'Equipo retirado de servicio',
        });

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Observación creada correctamente');
        });
        expect(mockRouter.invalidate).toHaveBeenCalledTimes(1);
        expect(mockRouter.navigate).toHaveBeenCalledWith({ to: '/securityObservations' });
    });

    it('update: envía el registro precargado mapeado con su id', async () => {
        renderWithProviders(
            <SecurityObservationForm mode="update" initialData={fixtureSecurityObservation} />,
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
        });

        fireEvent.submit(screen.getByRole('button', { name: 'Guardar' }).closest('form')!);

        await waitFor(() => {
            expect(securityObservationService.update).toHaveBeenCalledTimes(1);
        });

        expect(securityObservationService.update).toHaveBeenCalledWith(
            fixtureSecurityObservation.id,
            expect.objectContaining({
                observationDate: fixtureSecurityObservation.observationDate,
                plantId: fixtureSecurityObservation.plant.id,
                sectorId: fixtureSecurityObservation.sector.id,
                contractorCompanyId: fixtureSecurityObservation.contractorCompany?.id ?? null,
                observers: fixtureSecurityObservation.observers.map((o) => ({ observerId: o.id })),
                resumenObservacion: fixtureSecurityObservation.resumenObservacion,
            }),
        );
        expect(securityObservationService.create).not.toHaveBeenCalled();
    });

    it('update: rechaza una Fecha de Observación fuera de la ventana sin llamar al servicio', async () => {
        renderWithProviders(
            <SecurityObservationForm
                mode="update"
                initialData={{ ...fixtureSecurityObservation, observationDate: '2020-01-01' }}
            />,
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
        });

        fireEvent.submit(screen.getByRole('button', { name: 'Guardar' }).closest('form')!);

        expect(
            await screen.findByText(/Observation Date must be between \d{4}-\d{2}-\d{2} and \d{4}-\d{2}-\d{2}/),
        ).toBeInTheDocument();

        expect(securityObservationService.update).not.toHaveBeenCalled();
    });
});
