# 08: Mantenimiento de Equipos (demo) al español

**What to build:** La función demo del contrato compartido (Mantenimiento de Equipos)
está 100% en español: base con "Línea Transportadora A", "Montacargas 12", "Caldera 3"
y personas Iván Quiroga, Selva Rivas, Tomás Bermúdez (IDs/DNI intactos, emails
derivados); actividades en español ("Inspección de tensión de bandas y rodillos",
"Reemplazo de bomba hidráulica"); estados y tipos mostrados en español ("Operativo",
"En Reparación", "Fuera de Servicio", "Preventivo", "Correctivo", "Pendiente",
"Completado"); formularios, grillas, validaciones zod y mensajes del backend
("El ítem de equipo está referenciado por mantenimientos de equipos y no puede
eliminarse", "Nombre es obligatorio", "Estado de ítem de equipo inválido", "Persona no
encontrada") en español. Demuestra que el contrato compartido de formularios/tablas
también es español.

**Blocked by:** 01 (Contrato de idioma).

**Status:** resolved

- [x] Migración EF nueva con UpdateData sobre los HasData de Person, EquipmentItem y
      EquipmentMaintenance (IDs, DNIs intactos; enums serializados intactos).
- [x] Mensajes visibles del backend (Equipment Items, Equipment Maintenances, Persons)
      en español.
- [x] Frontend del módulo demo: labels, estados/tipos con label-maps españoles, zod,
      toasts, grillas, estados vacíos en español.
- [x] Tests del form de Mantenimiento de Equipos y smoke de sus catálogos en español;
      fixtures recapturados si aplica.
- [x] Suite completa verde; commit, merge a master, push.

## Answer

Migración `SpanishEquipmentDemoSeed` (UpdateData; IDs y DNIs intactos, enums
serializados intactos): ítems "Línea Transportadora A", "Montacargas 12", "Caldera 3";
personas Iván Quiroga, Selva Rivas, Tomás Bermúdez (email derivado
tomas.bermudez@example.com); actividades "Inspección de tensión de bandas y rodillos" y
"Reemplazo de bomba hidráulica". Backend demo al español: "Estado de ítem de equipo
inválido", "Nombre es obligatorio", "Ítem de equipo no encontrado" (x2), "El ítem de
equipo está referenciado por mantenimientos de equipos y no puede eliminarse", "Nombre y
apellido son obligatorios" (x2), "Persona no encontrada", "La persona está referenciada
por mantenimientos de equipos y no puede eliminarse". Frontend del módulo demo ya estaba
en español (label-maps "Operativo/En Reparación/Fuera de Servicio", "Preventivo/
Correctivo", "Pendiente/Completado", zod, toasts y grillas verificados). No hay fixtures
MSW del módulo demo (no aplica recaptura). Suites del demo verdes; suite completa verde
en pre-push.
