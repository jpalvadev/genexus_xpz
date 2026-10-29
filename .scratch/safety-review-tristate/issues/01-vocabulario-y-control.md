# 01: Vocabulario y control: enum tri-estado, ToggleGroup y campo del GenericForm

**What to build:** El producto gana, sin que nada existente cambie de comportamiento, el
vocabulario y el control con los que se responde una **Revisión de Seguridad** en tri-estado:
el término **Respuesta de Revisión de Seguridad** (`Sí` / `No` / `N/A`, con la distinción
**N/A ≠ sin respuesta**) queda escrito en el glosario junto con ADR-0006; existe el tipo
de dominio `SafetyReviewAnswer` con su único mapa al/al desde los literales `"SI"`, `"NO"`,
`"N/A"`; y un campo `toggle-group` de selección única está disponible en el formulario
genérico, visible en un test que lo renderiza **a través del formulario genérico** igual que
los demás campos. Una persona que abre cualquier formulario del repo sigue viendo lo de
siempre; quien construye un formulario ya tiene el ButtonGroup.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] El glosario describe la Revisión de Seguridad como checklist Sí/No/N/A, define
      **Respuesta de Revisión de Seguridad**, afirma "N/A ≠ sin respuesta", elimina el
      booleano *Inmediato* (campo inexistente en el código) y ajusta la línea de "contrato en
      inglés" a lo que el código hace: identificadores ingleses, enums C# serializados como
      número, valores de dominio visibles en español (precedente: labels de Combo Option).
- [ ] ADR-0006 publicado: por qué una respuesta obligatoria es un string español tri-estado,
      con las alternativas rechazadas (nullable bool, string sin validar, enum en el DTO con
      400 del framework) y el trade-off.
- [ ] El tipo de dominio existe con mapa string↔tipo en un solo lugar, y la convención de
      persistencia (columna TEXT con los literales, nullable, sin default) queda definida.
- [ ] El formulario genérico renderiza un campo `toggle-group` de selección única
      (`variant outline`, `size sm`, label arriba, `null` = nada presionado, `disabled` en
      modos de solo lectura, callback de cambio de valor), con las primitivas Shadcn
      canónicas del registro y ningún campo actual modificado: los checkboxes siguen
      siendo checkboxes.
- [ ] Test del campo nuevo vía formulario genérico (patrón de los tests de campo actuales):
      nada presionado con valor nulo, la selección única reemplaza el valor anterior,
      disabled en modo view, callback disparado.
- [ ] Suite frontend verde y `tsc -b` + lint de staged en verde; el push de este ticket
      llega a `origin` en verde (es 100 % aditivo).
