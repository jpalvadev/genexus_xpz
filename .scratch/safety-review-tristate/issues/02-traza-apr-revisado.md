# 02: Traza: "APR revisado" se responde Sí / No / N/A de punta a punta

**What to build:** Una **Observación de Seguridad** se registra eligiendo **Sí**, **No** o
**N/A** en la pregunta *APR revisado*: el valor viaja por la API como literal español, se
persiste como literal español, y al reabrir la Observación el botón correspondiente aparece
presionado. Seguir sin responder esa pregunta bloquea el guardado con el mensaje español
existente ("Todas las respuestas de la Revisión de Seguridad son obligatorias"), idéntico en
frontend y backend. Las otras 11 preguntas de la Revisión siguen siendo checkboxes y se
responden como hoy: la traza es un campo, no el bloque.

**Blocked by:** 01 (vocabulario y control).

**Status:** ready-for-agent (reclamada: rama integration/safety-review-tristate)

- [ ] La pregunta responde con `"SI"` / `"NO"` / `"N/A"` por la API y queda persistida con
      ese literal; "sin responder" sigue siendo ausencia de valor, no un literal.
- [ ] Migración que **convierte** el dato existente: verdadero → `"SI"`, falso → `"NO"`,
      sin valor → sin valor. Una Observación histórica conserva su respuesta al reabrirla.
- [ ] El campo aparece como ButtonGroup de tres botones en el formulario de alta/edición,
      con su asterisco de obligatorio, deshabilitado en modo view; los 11 campos restantes
      conservan su checkbox.
- [ ] El espejo de reglas del frontend acepta los tres literales, rechaza un valor fuera del
      set con el mismo orden de reglas del backend, y mantiene intacto el mensaje de
      obligatoriedad.
- [ ] Fixtures de contrato recapturados desde la API viva bajo el harness (deriva de solo
      marcas de tiempo descartada) y los scripts del harness que crean Observaciones
      migrados para este campo.
- [ ] Suite frontend verde y empujable en verde: el árbol queda consistente campo por
      campo, sin rama roja.
