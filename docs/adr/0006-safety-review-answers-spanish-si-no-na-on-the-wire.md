# ADR-0006 — Safety Review answers: Spanish `SI`/`NO`/`N/A` on the wire, English property names

- Status: Accepted
- Date: 2026-10-29
- Context: Safety Review tri-state answers spec (`.scratch/safety-review-tristate/spec.md`) + grilling (2026-10-29).
- Precedents: ADR-0005 (visible language is Spanish end-to-end, English lives only in the technical contract). Complements GLOSSARY "Revisión de Seguridad" / "Respuesta de Revisión de Seguridad".

## Context

Las doce preguntas de la Revisión de Seguridad de la Observación de Seguridad eran
checkboxes booleanos. El negocio necesita un tercer estado — *no aplica* — y la
pantalla debe mostrar **Sí / No / N/A**, en español, como el resto de la copia
visible (ADR-0005). La pregunta de contrato: ¿cómo viajan esos tres estados por el
API sin violar la convención "nombres en inglés, copia en español", y qué es una
respuesta?

## Decision

1. **El valor respondido es copia visible: viaja en español.** Los doce campos de
   la Revisión son, en el wire, strings con el conjunto cerrado
   `"SI" | "NO" | "N/A"` — literales byte-idénticos en API, tipos TS, payloads de
   prueba y fixtures. Los tres valores presentados al usuario son españoles por
   construction (ADR-0005); N/A es un valor *español por omisión*: la forma
   internacional, la que el personal de campo escribe en un checklist, se mantiene
   sin traducir.
2. **El identificador sigue en inglés.** Los nombres de propiedad (`aprReviewed`,
   `replanificarPausarSiNo`, …), los tipos (`SafetyReviewAnswer`) y las rutas no se
   tocan: el inglés vive solo en el contrato técnico (ADR-0005, GLOSSARY "Contrato
   en inglés"). La convención "nombres de propiedad en inglés" **no se rompe**: el
   nombre es inglés y el valor es español, igual que `"Gestión de Riesgo"` es un
   valor de categoría visible con propiedad `category` inglesa.
3. **NULL significa ausencia; `"N/A"` es una respuesta.** Sin respuesta es NULL en
   la entidad, `null` en el form y `null`/ausente en el wire. Para Observaciones,
   cualquier NULL es error de completitud; `"N/A"` satisface la regla. Las doce en
   `"N/A"` es una Observación válida (no se exige al menos un Sí).
4. **Dominio tipado, límite string.** La entidad persiste los doce campos como
   `SafetyReviewAnswer?` (enum con `ValueConverter` a TEXT); los DTOs de request y
   response siguen siendo `string?` en el límite del framework. La regla de
   validación del servicio rechaza cualquier string que no sea uno de los tres
   literales con copia 100 % española, **antes** de la regla de obligatoriedad, y
   el espejo zod del frontend envía el mismo mensaje en el mismo orden (ADR-0005,
   "Rule messages are Spanish end to end").
5. **El formato de persistencia es TEXT con conversión explícita y sin default.**
   Los doce campos de la tabla `SecurityObservations` son columna TEXT con
   `ValueConverter` `SafetyReviewAnswer? ↔ string`; sin default de columna. Las
   migraciones SQL Server no son un caso especial: la conversión es SQL escrita a
   mano (`CAST` + `CASE` 1→'SI', 0→'NO', NULL→NULL), no una reconstrucción de tabla
   SQLite con post-procesamiento.

## Consequences

- El wire es legible en español para el único consumidor que mira los valores
  (personas, inspectores de export); los consumidores de *nombres* (código, JSON)
  siguen en inglés.
- Un valor inválido ("YES", "Sí", "1", "NA") es rechazado en ambos lados con el
  mismo mensaje español; no existe camino mudo.
- El costo: doce columnas pasan de INTEGER a TEXT con migración de datos
  1→"SI", 0→"NO", NULL→NULL; los tipos base y los fixtures se recapturan.

## Consideradas y descartadas

- **Bool + flag separado `...NA`** (dos campos por pregunta): 24 campos, un
  estado por dos bits que el dominio dice que es uno; descartada.
- **Numéricos 1/0/-1 o 2/1/0**: ocultan el significado; el contrato queda menos
  legible que el string español; descarta.
- **Enums en inglés `YES`/`NO`/`NA` serializados (estilo `Active`/`Inactive`)**:
  consistencia técnica a costa de exponer el valor respondido en inglés, que la
  conversación con el negocio rechazó explícitamente: lo que se respondió es
  respuesta visible.
- **`"SÍ"` acentuado como literal**: byte-fragil por acentos en JSON/SQL/curl
  payload; se elige `"SI"` sin acento (el checklist se lee igual), y UI muestra
  "Sí".
- **N/A restringido a subconjunto de preguntas**: el negocio respondió que las
  doce admiten N/A; una lista de excepciones sería un maestro invisible
  (filosofía ADR-0004). Descartada.
