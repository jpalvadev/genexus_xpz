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

**Status:** ready-for-agent

- [ ] Formulario de Observación de Seguridad: labels, help text, placeholders, zod y
      mensajes de ventana de fecha en español.
- [ ] Revisión de Seguridad con los denominaciones españolas fijadas en el GLOSSARY.
- [ ] Grilla/listado de observaciones: encabezados, toolbar, filtros, estados vacíos,
      diálogos de confirmación y toasts en español; export a Excel con encabezados
      españoles.
- [ ] Fixtures de security-observation(es) recapturados desde la API viva (valores
      españoles de los tickets 02–06 incluidos).
- [ ] Smoke tests del módulo de observaciones assertionan texto español; suite completa
      verde (pre-push).
- [ ] Commit, merge a master, push de master + rama de integración.
