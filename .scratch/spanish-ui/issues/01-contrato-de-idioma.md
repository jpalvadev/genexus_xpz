# 01: Contrato de idioma: GLOSSARY en español + ADR-0005

**What to build:** El repo declara oficialmente que el idioma del dominio visible es el
español. Un agente o desarrollador que abra GLOSSARY.md encuentra los términos
canónicos en español (Observación de Seguridad, Observador, Planta, Sector, Empresa
Contratista, Registro Maestro, Lugar, Tarea, Safety Review→Revisión de Seguridad…) con
el identifier inglés (Security Observation, Observer…) reconocido como nombre técnico
de código, y un ADR-0005 en español que documenta la inversión de la política
("visible=español, contrato JSON/C# = inglés, sin framework i18n, marca visible
SHYMA").

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] GLOSSARY.md reescrito en español: términos canónicos españoles con el identifier
      inglés como nombre técnico; se invierte el header que declaraba "the language is
      English"; las entradas `_Avoid_` quedan coherentes con la nueva política.
- [x] El glosario incluye la tabla canónica de labels de Combo Options (fuente de
      verdad única para seeds, fixtures, sweeps y smoke tests):
      - gestionRiesgo: Charla de Riesgo Diario (DRT) · Análisis de Seguridad del
        Trabajo (JSA) · Permiso de Trabajo · Charla de Toolbox
      - protocolosMortales: Trabajo en Altura · Aislamiento de Energía (LOTO) · Ingreso
        a Espacio Confinado · Trabajo en Caliente · Equipo Móvil en Movimiento · Excavación
      - clasificacionObservacion: Acto Seguro · Condición Segura · Acto de Riesgo ·
        Control Defensivo
      - relacionObservacion: Relacionado con APR · Relacionado con ATR · Relacionado con
        la Tarea · Relacionado con Condiciones del Sitio
- [x] Los hallazgos del Safety Review y los 4 multiselects tienen su denominación
      española fijada en el glosario (APR revisado, Revisión de ATR necesaria,
      Controles críticos, Gestión de Riesgo, Protocolos Mortales, Clasificación,
      Relación).
- [x] ADR-0005 (docs/adr, en español) documenta la decisión: visible español /
      contrato inglés / sin i18n / marca SHYMA en UI; referenciando ADR-0001 y el
      GLOSSARY.
- [x] AGENTS.md, CODING_STANDARDS.md y ADRs 0001–0004 NO se traducen (quedan en
      inglés).
- [x] Commit con gates verdes; merge a master y push (regla de ship de AGENTS.md).

## Answer

GLOSSARY.md reescrito íntegramente en español: header invertido (idioma del dominio
visible = español; inglés solo en el contrato técnico), términos canónicos con su
nombre técnico inglés entre paréntesis, denominaciones españolas de la Revisión de
Seguridad (12 campos + Controles Críticos) y de los 4 multiselects, y tabla canónica de
labels de Combo Options por ComboKey (`gestionRiesgo`, `protocolosMortales`,
`clasificacionObservacion`, `relacionObservacion`) como fuente única de seeds, fixtures,
sweeps y smokes. Sección final "Idioma visible" fija qué se traduce y qué no. ADR-0005
(`docs/adr/0005-idioma-visible-espanol-contrato-ingles.md`) documenta la inversión
(visible español / contrato inglés / sin i18n / marca SHYMA) referenciando ADR-0001 y el
GLOSSARY. AGENTS.md, CODING_STANDARDS.md y ADRs 0001–0004 quedan en inglés, intactos.
