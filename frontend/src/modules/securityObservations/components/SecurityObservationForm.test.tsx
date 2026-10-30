import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
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
        expect(screen.getByText('Revisión de Seguridad')).toBeInTheDocument();
        expect(
            screen.getByRole('radiogroup', { name: 'APR revisado' })
        ).toBeInTheDocument();
        expect(screen.getByLabelText('Gestión de Riesgo')).toBeInTheDocument();
        expect(screen.getByText(/Rango permitido: \d{2}\/\d{2}\/\d{4} a \d{2}\/\d{2}\/\d{4}/)).toBeInTheDocument();
    });

    it('create: rechaza la vacía con los mensajes de regla y no llama al servicio', async () => {
        renderWithProviders(<SecurityObservationForm mode="create" />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
        });

        fireEvent.submit(screen.getByRole('button', { name: 'Guardar' }).closest('form')!);

        expect(await screen.findByText('La tarea es obligatoria')).toBeInTheDocument();
        expect(await screen.findByText('La planta es obligatoria')).toBeInTheDocument();
        expect(await screen.findByText('Se requiere al menos un observador')).toBeInTheDocument();
        expect(await screen.findAllByText('Todas las respuestas de la Revisión de Seguridad son obligatorias')).toHaveLength(12);
        expect(await screen.findByText('Se requiere al menos un label para Gestión de Riesgo')).toBeInTheDocument();
        expect(await screen.findByText('El resumen es obligatorio')).toBeInTheDocument();

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

        // Safety Review: APR revisado es tri-estado (ticket 02) — Sí en su segmento
        await user.click(
            within(screen.getByLabelText('APR revisado')).getByRole('radio', {
                name: 'Sí',
            })
        );
        for (const label of [
            'Tarea realizada según APR',
            'Revisión de ATR necesaria',
            'Riesgo TRC considerado',
            'Riesgo de impacto controlado',
            'Medidas de manos y lesiones',
            'Medidas de lesiones',
            'Herramientas revisadas',
            'Equipos móviles revisados',
            'Energía revisada',
            'Escaleras revisadas',
            'Equipos eléctricos y disyuntores',
        ]) {
            await user.click(screen.getByLabelText(label));
        }

        // Combos: una etiqueta por familia
        const pickCombo = async (fieldLabel: string, itemLabel: string) => {
            await user.click(screen.getByRole('combobox', { name: fieldLabel }));
            await user.click(await screen.findByRole('option', { name: itemLabel }));
            await user.keyboard('{Escape}');
        };
        await pickCombo('Gestión de Riesgo', 'Charla de Riesgo Diario (DRT)');
        await pickCombo('Protocolos Mortales', 'Trabajo en Altura');
        await pickCombo('Clasificación de Observación', 'Condición Segura');
        await pickCombo('Relación de Observación', 'Relacionado con la Tarea');

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
            aprReviewed: 'SI',
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
            gestionRiesgo: ['Charla de Riesgo Diario (DRT)'],
            protocolosMortales: ['Trabajo en Altura'],
            clasificacionObservacion: ['Condición Segura'],
            relacionObservacion: ['Relacionado con la Tarea'],
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
            await screen.findByText(/La fecha de observación debe estar entre \d{2}\/\d{2}\/\d{4} y \d{2}\/\d{2}\/\d{4}/),
        ).toBeInTheDocument();

        expect(securityObservationService.update).not.toHaveBeenCalled();
    });
});
