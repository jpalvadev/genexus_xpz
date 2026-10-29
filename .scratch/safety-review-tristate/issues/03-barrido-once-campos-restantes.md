# 03: Barrido: los otros 11 campos de la Revisión de Seguridad

**What to build:** El bloque completo de la **Revisión de Seguridad** se responde con
ButtonGroups: las doce preguntas (*APR revisado*, *Tarea realizada según APR*, *Revisión de
ATR necesaria*, *Riesgo TRC considerado*, *Riesgo de impacto controlado*, *Medidas de manos
y lesiones*, *Medidas de lesiones*, *Herramientas revisadas*, *Equipos móviles revisados*,
*Energía revisada*, *Escaleras revisadas*, *Equipos eléctricos y disyuntores*) muestran **Sí
/ No / N/A**, dos preguntas por fila, con asterisco por pregunta y la obligación declarada
en el separador. Una Observación con las doce en **N/A** es una Observación válida y
guardable: la tarea a la que ninguna medida aplicaba es un registro legítimo. Una
Observación con respuestas verdaderas/falsas anteriores muestra **Sí**/**No** presionados al
abrirla. En modo view el bloque se ve completo y deshabilitado.

**Blocked by:** 02 (la traza fijó el patrón de campo, de migración y de repin).

**Status:** ready-for-agent

- [ ] Once respuestas restantes migran a literales `"SI"` / `"NO"` / `"N/A"` en base, API,
      formulario y tests; ninguna queda como booleano.
- [ ] Migración conversora para las once columnas restantes, con la misma regla de
      conversión que la traza.
- [ ] Layout del bloque: dos preguntas por fila, `variant outline` / `size sm`, ancho
      natural, asterisco por pregunta, sin desmarque una vez respondida (solo
      re-asignación).
- [ ] Regla de obligatoriedad intacta (mismo mensaje, mismo orden) con sus tests de espejo
      repineados, y test de Observación con las doce respuestas en `N/A` aceptada.
- [ ] Payloads de los scripts del harness que crean Observaciones en literales, con al
      menos un `"N/A"` en el dato sembrado por el recapture; fixtures recapturados y tests
      de contrato y de formulario repineados.
- [ ] Suite frontend verde y empujable en verde.
