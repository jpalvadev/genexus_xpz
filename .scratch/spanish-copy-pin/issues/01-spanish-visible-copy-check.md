# 01 — Pin de copia visible en español

**Status:** resolved

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

## Comments

Resuelto: `scripts/spanish-visible-copy-check.sh` (scan estático bash+python3, sin
llamadas a la API; nace verde sobre la base spanish-ui).

- **Mecanismo elegido: allowlist de contextos de copia**, con la lista de marcadores
  ingleses aplicada solo a los literales capturados (el camino con menos falsos
  positivos: los literales developer-facing —guardas `InvalidOperationException`,
  logs, órdenes Gridify `"name asc"`, contratos JSON/enum— no se capturan nunca; una
  lista negra sobre todos los literales los flaggaría a todos).
- **Superficie barrida** (derivada por contenido, no por lista fija de archivos, para
  que un sitio de copia nuevo entre sola): todos los `.cs` de `Genexus/Features/` +
  `Genexus/Common/MasterCrud/`; contextos capturados: región `Validation =` (400 del
  adapter), `ConflictMessage =` (409), `NotFoundMessage =>` (404), literales de
  `new ValidationException("…")/ConflictException("…")/ErrorResponse("…")`, y los
  literales `return "…"` de los validators tipados `string`/`Task<string?>`
  (`SecurityObservationRules.FirstViolation`, `ValidateReferencesAsync`). Base actual:
  57 archivos, 15 sitios de copia, 0 fallos.
- **Discriminador**: marcadores de palabra inglesa case-insensitive con límites de
  palabra; los huecos de interpolación (`{min:dd/MM/yyyy}`) se eliminan (son código,
  no copia) solo cuando el literal tiene huecos, de modo que una copia inglesa
  compuesta con `string.Format` sí se flagga. Loanwords del GLOSSARY ("label",
  "combo") no son marcadores; "no" es español y nunca marca.
- **Completitud**: guardas de cobertura (sitios `Validation =`/`ConflictMessage`/
  `NotFoundMessage`/firmas de validator vs. parses exitosos; región Validation sin
  literal = hueco; superficie vacía = hueco) salen ≠0 ante formas nuevas no cubiertas
  — el check se ensancha a mano, nunca en silencio.
- **No-vacuidad**: self-test embebido con fixtures canónicos (español debe pasar,
  inglés debe flagarse 10/10 en los 6 contextos, la guarda `InvalidOperationException`
  no debe barrerse) corre en cada ejecución.
- Cableado en `scripts/closeout-harness-pass.sh` (pase completo verde bajo
  `scripts/with-api.sh "$PWD/scripts/closeout-harness-pass.sh"`, arranque único con
  recapture + cuatro pins + wire spot checks); AGENTS.md actualizado a "four pin
  scripts" con la regla que pinea.
