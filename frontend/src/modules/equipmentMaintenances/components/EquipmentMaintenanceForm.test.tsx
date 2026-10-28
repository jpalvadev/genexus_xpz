import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor, fireEvent } from '@/test/test-utils';
import EquipmentMaintenanceForm from './EquipmentMaintenanceForm';
import { equipmentMaintenanceService } from '../services/equipmentMaintenance.service';
import { equipmentItemService } from '@/modules/equipmentItems/services/equipmentItem.service';
import { personService } from '@/modules/persons/services/person.service';
import { toast } from 'sonner';

// Mocks para TanStack Router
const mockNavigate = vi.fn();
const mockBack = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tanstack/react-router')>();
    return {
        ...actual,
        useRouter: () => ({
            navigate: mockNavigate,
            history: { back: mockBack },
        }),
        useCanGoBack: () => true,
    };
});

describe('EquipmentMaintenanceForm component', () => {
    const mockEquipmentItems = {
        data: [
            { id: 10, code: 'EQ-01', name: 'Tractor John Deere', status: 1 },
            { id: 20, code: 'EQ-02', name: 'Sembradora', status: 1 },
        ],
        rowCount: 2,
    };

    const mockPersons = {
        data: [
            { id: 5, firstName: 'Juan', lastName: 'Pérez', dni: 12345678, email: 'juan@itrion.com' },
        ],
        rowCount: 1,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        vi.spyOn(equipmentItemService, 'getAll').mockResolvedValue(mockEquipmentItems as any);
        vi.spyOn(personService, 'getAll').mockResolvedValue(mockPersons as any);
        vi.spyOn(equipmentMaintenanceService, 'create').mockResolvedValue({ id: 99 } as any);
        vi.spyOn(equipmentMaintenanceService, 'update').mockResolvedValue(undefined);
        vi.spyOn(equipmentMaintenanceService, 'deleteById').mockResolvedValue(true);
        vi.spyOn(toast, 'success');
        vi.spyOn(toast, 'error');
    });

    it('renderiza el formulario con campos y opciones de selector tras cargar queries', async () => {
        renderWithProviders(
            <EquipmentMaintenanceForm
                mode="create"
                initialData={undefined}
            />
        );

        // Esperamos que termine de cargar los datos de useQuery (equipos y personas)
        await waitFor(() => {
            expect(screen.getByLabelText('Fecha')).toBeInTheDocument();
            expect(screen.getByLabelText('Actividad')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
        });
    });

    it('mantenimiento Correctivo + Completado abre EquipmentStatusDialog y pausa el guardado', async () => {
        // Correctivo = 2, Completado = 2 (requiere closedAt válido)
        renderWithProviders(
            <EquipmentMaintenanceForm
                mode="create"
                initialData={{
                    id: 0,
                    date: '2026-03-01',
                    closedAt: '2026-03-01',
                    type: 2, // Correctivo
                    status: 2, // Completado
                    activity: 'Reparación de motor',
                    equipmentItem: { id: 10, name: 'Tractor', code: 'EQ-01', status: 1 },
                    person: { id: 5, firstName: 'Juan', lastName: 'Pérez', dni: 12345678, email: '' },
                } as any}
            />
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
        });

        const submitBtn = screen.getByRole('button', { name: 'Guardar' });
        fireEvent.submit(submitBtn.closest('form')!);

        // Se debe abrir el diálogo con su título característico
        await waitFor(() => {
            expect(
                screen.getByText('Seleccione el estado final del equipo.')
            ).toBeInTheDocument();
        });

        // La API de create NO debe haberse llamado todavía
        expect(equipmentMaintenanceService.create).not.toHaveBeenCalled();
    });

    it('al seleccionar un estado en el modal ("Operativo") y confirmar, ejecuta la mutación con equipmentStatus', async () => {
        const { user } = renderWithProviders(
            <EquipmentMaintenanceForm
                mode="create"
                initialData={{
                    id: 0,
                    date: '2026-03-01',
                    closedAt: '2026-03-01',
                    type: 2, // Correctivo
                    status: 2, // Completado
                    activity: 'Cambio de correa',
                    equipmentItem: { id: 10, name: 'Tractor', code: 'EQ-01', status: 1 },
                    person: { id: 5, firstName: 'Juan', lastName: 'Pérez', dni: 12345678, email: '' },
                } as any}
            />
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
        });

        const submitBtn = screen.getByRole('button', { name: 'Guardar' });
        fireEvent.submit(submitBtn.closest('form')!);

        await waitFor(() => {
            expect(screen.getByText('Seleccione el estado final del equipo.')).toBeInTheDocument();
        });

        // Clickeamos la opción "Operativo" (status 1)
        const operativoOption = screen.getByRole('button', { name: 'Operativo' });
        await user.click(operativoOption);

        // El botón Confirmar se habilita y lo clickeamos
        const confirmBtn = screen.getByRole('button', { name: 'Confirmar' });
        expect(confirmBtn).not.toBeDisabled();
        await user.click(confirmBtn);

        await waitFor(() => {
            expect(equipmentMaintenanceService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    activity: 'Cambio de correa',
                    type: 2,
                    status: 2,
                    equipmentStatus: 1, // Operativo
                })
            );
            expect(toast.success).toHaveBeenCalledWith('Registro creado correctamente');
        });
    });

    it('al cancelar en el modal EquipmentStatusDialog, se cierra el diálogo sin enviar la mutación', async () => {
        const { user } = renderWithProviders(
            <EquipmentMaintenanceForm
                mode="create"
                initialData={{
                    id: 0,
                    date: '2026-03-01',
                    closedAt: '2026-03-01',
                    type: 2, // Correctivo
                    status: 2, // Completado
                    activity: 'Cambio de aceite',
                    equipmentItem: { id: 10, name: 'Tractor', code: 'EQ-01', status: 1 },
                    person: { id: 5, firstName: 'Juan', lastName: 'Pérez', dni: 12345678, email: '' },
                } as any}
            />
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
        });

        const submitBtn = screen.getByRole('button', { name: 'Guardar' });
        fireEvent.submit(submitBtn.closest('form')!);

        await waitFor(() => {
            expect(screen.getByText('Seleccione el estado final del equipo.')).toBeInTheDocument();
        });

        const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
        await user.click(cancelBtn);

        await waitFor(() => {
            expect(screen.queryByText('Seleccione el estado final del equipo.')).not.toBeInTheDocument();
        });

        expect(equipmentMaintenanceService.create).not.toHaveBeenCalled();
    });

    it('mantenimiento Preventivo no abre el modal y guarda directamente', async () => {
        renderWithProviders(
            <EquipmentMaintenanceForm
                mode="create"
                initialData={{
                    id: 0,
                    date: '2026-03-01',
                    type: 1, // Preventivo
                    status: 1, // Pendiente (no requiere closedAt)
                    activity: 'Mantenimiento de rutina',
                    equipmentItem: { id: 10, name: 'Tractor', code: 'EQ-01', status: 1 },
                    person: { id: 5, firstName: 'Juan', lastName: 'Pérez', dni: 12345678, email: '' },
                } as any}
            />
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
        });

        const submitBtn = screen.getByRole('button', { name: 'Guardar' });
        fireEvent.submit(submitBtn.closest('form')!);

        // El modal nunca se abre y create se ejecuta directamente
        expect(screen.queryByText('Seleccione el estado final del equipo.')).not.toBeInTheDocument();

        await waitFor(() => {
            expect(equipmentMaintenanceService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    activity: 'Mantenimiento de rutina',
                    type: 1,
                    status: 1,
                })
            );
            expect(toast.success).toHaveBeenCalledWith('Registro creado correctamente');
        });
    });

    it('en modo update llama a equipmentMaintenanceService.update', async () => {
        renderWithProviders(
            <EquipmentMaintenanceForm
                mode="update"
                initialData={{
                    id: 42,
                    date: '2026-03-01',
                    type: 1, // Preventivo
                    status: 1, // Pendiente
                    activity: 'Ajuste de tuercas',
                    equipmentItem: { id: 10, name: 'Tractor', code: 'EQ-01', status: 1 },
                    person: { id: 5, firstName: 'Juan', lastName: 'Pérez', dni: 12345678, email: '' },
                } as any}
            />
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
        });

        const submitBtn = screen.getByRole('button', { name: 'Guardar' });
        fireEvent.submit(submitBtn.closest('form')!);

        await waitFor(() => {
            expect(equipmentMaintenanceService.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 42,
                    activity: 'Ajuste de tuercas',
                })
            );
            expect(toast.success).toHaveBeenCalledWith('Registro actualizado correctamente');
        });
    });

    it('en modo delete muestra el botón Eliminar y ejecuta deleteById al procesar la eliminación', async () => {
        renderWithProviders(
            <EquipmentMaintenanceForm
                mode="delete"
                initialData={{
                    id: 42,
                    date: '2026-03-01',
                    type: 1,
                    status: 1,
                    activity: 'Eliminar registro',
                    equipmentItem: { id: 10, name: 'Tractor', code: 'EQ-01', status: 1 },
                    person: { id: 5, firstName: 'Juan', lastName: 'Pérez', dni: 12345678, email: '' },
                } as any}
            />
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();
        });

        const deleteBtn = screen.getByRole('button', { name: 'Eliminar' });
        fireEvent.submit(deleteBtn.closest('form')!);

        await waitFor(() => {
            expect(equipmentMaintenanceService.deleteById).toHaveBeenCalledWith(42);
            expect(toast.success).toHaveBeenCalledWith('Registro eliminado correctamente');
        });
    });
});
