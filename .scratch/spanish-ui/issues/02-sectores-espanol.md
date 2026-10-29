# 02: Sectores al español (tracer bullet de catálogos)

**What to build:** El Registro Maestro de Sectores funciona 100% en español de punta a
punta: una base recién creada nace con "Seguridad Preventiva", "Control de Acceso",
"Ronda y Vigilancia", "Respuesta a Emergencias"; crear/editar un Sector muestra
validaciones y conflictos en español ("Nombre es obligatorio", "El sector está
referenciado por observaciones de seguridad y no puede eliminarse", "Sector no
encontrado"); la pantalla del catálogo (encabezados, campos, acciones, estados vacíos)
está en español. Este ticket establece el PATRÓN repetible para 03–06.

**Blocked by:** 01 (Contrato de idioma).

**Status:** resolved

- [x] Migración EF nueva con UpdateData sobre los HasData de Sector (IDs intactos;
      `dotnet ef migrations add`; historial lineal aditivo).
- [x] Mensajes visibles del backend de Sectores en español (Validation, ConflictMessage,
      NotFoundMessage del adaptador MasterCrud). Identificadores, rutas y JSON intactos.
- [x] Config del Registro Maestro de Sectores en el frontend: labels, encabezados,
      placeholders, mensajes de validación zod en español.
- [x] Fixtures MSW de sectors recapturados desde la API viva (scripts/capture-fixtures.py
      bajo scripts/with-api.sh).
- [x] Smoke test de sectors assertiona los labels/values españoles; la función copy() y
      los pins del barrido de paridad quedan verdes para sectors
      (scripts/master-parity-sweep.sh sectors).
- [x] Suite completa verde (vitest serial por config), gates de pre-commit verdes;
      commit, merge a master, push de master + rama de integración.

## Answer

Migración `SpanishSectorsSeed` (UpdateData sobre los 4 HasData, IDs intactos, Down
reversible). Backend: SectorService → "Nombre es obligatorio" / "El sector está
referenciado por observaciones de seguridad y no puede eliminarse"; SectorsController →
"Sector no encontrado". Frontend: zod de sector.config.ts → "Nombre es obligatorio".
Sweep: nueva función `validation_copy_for` por recurso + pins sectors en español
(sweep sectors: 0 fallos). Fixtures recapturados desde la API viva (sectors y SO en
español). Smoke de sectors asserts "Seguridad Preventiva" + columna "Nombre";
masterRecordModule.test y SecurityObservationForm.test repineados a los valores
españoles. Suite completa verde (175 tests).
