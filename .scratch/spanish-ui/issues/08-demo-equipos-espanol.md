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

**Status:** ready-for-agent

- [ ] Migración EF nueva con UpdateData sobre los HasData de Person, EquipmentItem y
      EquipmentMaintenance (IDs, DNIs intactos; enums serializados intactos).
- [ ] Mensajes visibles del backend (Equipment Items, Equipment Maintenances, Persons)
      en español.
- [ ] Frontend del módulo demo: labels, estados/tipos con label-maps españoles, zod,
      toasts, grillas, estados vacíos en español.
- [ ] Tests del form de Mantenimiento de Equipos y smoke de sus catálogos en español;
      fixtures recapturados si aplica.
- [ ] Suite completa verde; commit, merge a master, push.
