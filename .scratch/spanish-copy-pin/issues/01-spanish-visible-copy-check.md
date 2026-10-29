# 01 — Pin de copia visible en español

**Status:** ready-for-agent

Crear `scripts/spanish-visible-copy-check.sh` (patrón: `scripts/observer-deactivation-check.sh`,
bajo el harness) y cablearlo en `scripts/closeout-harness-pass.sh`.

Diseño a resolver en el ticket:

- **Superficie barrida**: los strings de copia visible — validación y copy de conflicto en
  `Genexus/Common/MasterCrud/` (validación 400, FK-conflict 409) y los validators de
  `Genexus/Features/` que construyen mensajes de regla.
- **Discriminador**: copia visible (llega al UI verbatim → español) vs copia
  developer-facing (mensajes `InvalidOperationException`, guardas `useX must be used
  within…`, logs → inglés, permitidos). Elegir mecanismo: allowlist de patrones/files
  frente a lista negra de frases en inglés; el que dé menos falsos positivos.
- **Criterio de completitud**: toda cadena de mensaje que viaja en el body de una 400/409
  del master-catalog barido está cubierta por el check; el script sale ≠0 ante string
  inglés visible y =0 con la base actual (la base está en español desde el epic
  spanish-ui — el pin nace verde).
- Cablear en closeout-harness-pass.sh y verificar el pase completo bajo
  `scripts/with-api.sh scripts/closeout-harness-pass.sh`.

Referencias: ADR-0005 (`docs/adr/0005-idioma-visible-espanol-contrato-ingles.md`),
CODING_STANDARDS.md "Rule messages are Spanish end to end", GLOSSARY.md.
