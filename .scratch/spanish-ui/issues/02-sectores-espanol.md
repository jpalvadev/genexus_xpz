# 02: Sectores al español (tracer bullet de catálogos)

**What to build:** El Registro Maestro de Sectores funciona 100% en español de punta a
punta: una base recién creada nace con "Seguridad Preventiva", "Control de Acceso",
"Ronda y Vigilancia", "Respuesta a Emergencias"; crear/editar un Sector muestra
validaciones y conflictos en español ("Nombre es obligatorio", "El sector está
referenciado por observaciones de seguridad y no puede eliminarse", "Sector no
encontrado"); la pantalla del catálogo (encabezados, campos, acciones, estados vacíos)
está en español. Este ticket establece el PATRÓN repetible para 03–06.

**Blocked by:** 01 (Contrato de idioma).

**Status:** ready-for-agent

- [ ] Migración EF nueva con UpdateData sobre los HasData de Sector (IDs intactos;
      `dotnet ef migrations add`; historial lineal aditivo).
- [ ] Mensajes visibles del backend de Sectores en español (Validation, ConflictMessage,
      NotFoundMessage del adaptador MasterCrud). Identificadores, rutas y JSON intactos.
- [ ] Config del Registro Maestro de Sectores en el frontend: labels, encabezados,
      placeholders, mensajes de validación zod en español.
- [ ] Fixtures MSW de sectors recapturados desde la API viva (scripts/capture-fixtures.py
      bajo scripts/with-api.sh).
- [ ] Smoke test de sectors assertiona los labels/values españoles; la función copy() y
      los pins del barrido de paridad quedan verdes para sectors
      (scripts/master-parity-sweep.sh sectors).
- [ ] Suite completa verde (vitest serial por config), gates de pre-commit verdes;
      commit, merge a master, push de master + rama de integración.
