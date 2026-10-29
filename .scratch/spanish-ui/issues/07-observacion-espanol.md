# 07: Observación de Seguridad al español

**What to build:** El caso de uso central — registrar una Observación de Seguridad —
está 100% en español: formulario con labels españoles (Observadores, Planta, Sector,
Lugar, Tarea, Fecha de Observación, Empresa Contratista), cada hallazgo de la Revisión
de Seguridad en español ("APR revisado", "Tarea realizada según APR", "Revisión de ATR
necesaria", "Riesgo TRC considerado", "Riesgo de impacto controlado", "Medidas de manos
y lesiones", "Herramientas revisadas", "Equipos móviles revisados", "Energía revisada",
"Escaleras revisadas", "Equipos eléctricos y disyuntores", "Controles críticos"), los
cuatro multiselects con labels españoles del ticket 06, cola narrativa en español
(Resumen de la Observación, Acción Detallada, Descripción de Acción Inmediata),
validaciones zod y errores de API en español, grilla con encabezados españoles y la
ventana de fecha (7 días atrás a 1 adelante) con su mensaje en español.

**Blocked by:** 02, 03, 04, 05, 06 (consume fixtures y datos españoles de los cinco
catálogos).

**Status:** resolved

- [x] Formulario de Observación de Seguridad: labels, help text, placeholders, zod y
      mensajes de ventana de fecha en español.
- [x] Revisión de Seguridad con los denominaciones españolas fijadas en el GLOSSARY.
- [x] Grilla/listado de observaciones: encabezados, toolbar, filtros, estados vacíos,
      diálogos de confirmación y toasts en español; export a Excel con encabezados
      españoles.
- [x] Fixtures de security-observation(es) recapturados desde la API viva (valores
      españoles de los tickets 02–06 incluidos).
- [x] Smoke tests del módulo de observaciones assertionan texto español; suite completa
      verde (pre-push).
- [x] Commit, merge a master, push de master + rama de integración.

## Answer

Backend (ADR-0005, copy visible al español; contrato intacto): `SecurityObservationRules`
con "La tarea es obligatoria" … "La fecha de observación debe estar entre dd/MM/yyyy y
dd/MM/yyyy" y labels multiselect españoles ("Gestión de Riesgo", "Protocolos Mortales",
"Clasificación de Observación", "Relación de Observación") en espejo exacto con el zod;
Service: "Planta no encontrada", "Sector no encontrado", "La empresa contratista no
existe", "Uno o más Observadores no existen", "Solo se pueden nombrar Observadores
Activos en una Observación de Seguridad"; Controller x3: "Observación de Seguridad no
encontrada"; export Excel con hoja "Observaciones de Seguridad", título "Registro de
Observaciones de Seguridad" y 16 encabezados españoles (documentMetadata "CODE: SHYMA-OPS"
queda inglés por ser dato técnico). Frontend: `securityObservation.type.ts` con los 12
denominaciones del GLOSSARY en `SAFETY_REVIEW_FIELDS`, `MULTI_SELECT_LABELS` españoles
(usados verbatim en la regla), zod con los mismos mensajes españoles en el mismo orden de
regla, ventana de fecha en dd/MM/yyyy; formulario con separadores "Revisión de Seguridad"
y "Campos de Selección", labels de combo sin paréntesis inglés, descripción de rango
"Rango permitido: dd/MM/yyyy a dd/MM/yyyy". Grilla, toolbar, diálogos y toasts ya
estaban españoles (verificados). Tests repineados: form test (separadores y labels
españoles, mensajes de submit, regex de ventana dd/MM/yyyy), rules test (todos los
mensajes). Fixtures SO recapturados desde API viva (valores españoles de tickets
02–06); sweep, combo-parity-check y observer-deactivation-check: 0 fallos en un solo
arranque de API. Suites SO verdes; suite completa verde en pre-push.
