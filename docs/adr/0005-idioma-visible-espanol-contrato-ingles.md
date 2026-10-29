# ADR-0005: El idioma visible es español; el contrato técnico queda en inglés

Status: Accepted

## Context

El GLOSSARY vigente declaraba que *el idioma del dominio es el inglés* y que el
español era una *copia en el lenguaje local* solo en la capa de presentación. En la
práctica la app mostró siempre un idioma mixto: etiquetas en español mezcladas con
mensajes de validación del backend en inglés ("Name is required"), datos sembrados en
inglés ("North Plant (RNV)", "Safe Act") y listas del Safety Review en inglés. Para un
operador de planta hispanoparlante eso obliga a traducir mentalmente a mitad de
formulario. La política invirtió su dirección: la app es de un solo inquilino y un
solo idioma (ADR-0001), y ese idioma es el español.

## Decision

**Toda la capa visible es español**: etiquetas, definiciones, descripciones,
placeholders, tooltips, estados vacíos, mensajes de validación y de conflicto —
incluidos los que genera el backend (ValidationMessage / ConflictMessage / errores de
referencia y NotFound)—, los datos sembrados (EF `HasData` de Sectores, Plantas,
Empresas Contratistas, Observadores, Combo Options y de la demo de Mantenimiento de
Equipos), los encabezados de las exportaciones a Excel, las fechas con display
argentino (`dd/MM/yyyy`) y la marca, que pasa de "Itrion" a **SHYMA**.

**El contrato técnico queda intacto en inglés**: identificadores de código (C# y
TypeScript), nombres de propiedades JSON, rutas de API, enums serializados (`Active`,
`Inactive`, `New`, `Planned`, status de Observación…), claves de Combo Option
(`Risk Management`, `Life-threatening Protocols`, `Observation Classification`,
`Observation Relationship`) y el archivo `itrion.db`.

**No se introduce framework i18n** (react-intl/lingui/*.json) y no existe selector de
idioma: la traducción es la sustitución directa de los literales en su lugar, una
sola vez. Los strings canónicos del dominio (copias de validación y conflicto del
backend, labels de Combo Options) quedan fijados en el GLOSSARY, y los harnesses
(`master-parity-sweep.sh`, `combo-parity-check.sh`, `observer-deactivation-check.sh`)
los pinean en español.

**Los datos del usuario se preservan**: los seeds EF solo tocan catálogos y demo; las
Observaciones existentes no se modifican, y una base recién creada nace en español
por migración.

## Consequences

- El GLOSSARY declara el español como idioma canónico del dominio; el identificador
  inglés se reconoce como **nombre técnico** de cada término. Toda pieza de lenguaje
  visible se expresa en español.
- Los mensajes de error del backend dejan de ser inglés: cualquier consumidor de la
  API (no solo la app) verá español en el campo `message`. Se acepta: la API es
  interna de un solo inquilino hispanoparlante.
- El contrato JSON no cambia: fixtures, harnesses y scripts solo varían en **valores**
  (cadenas de datos y mensajes), nunca en estructura. Los fixtures MSW se recapturan
  desde la API viva para reflejar el español real.
- No hay forma de agregar un segundo idioma sin reabrir esta decisión: si alguna vez
  se necesitara i18n, este ADR se supersede explícitamente.
- Los tests de contrato (contrato JSON, paridad, cascatas) siguen verdes porque
  pinean estructura; los que pineaban valores literales en inglés (smokes de
  catálogos, barridos, tests de formularios) se repinean a los valores canónicos
  españoles del GLOSSARY.
