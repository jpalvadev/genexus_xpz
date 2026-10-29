# Spec: SHYMA completamente en español

Status: ready-for-agent

## Problem Statement

La app muestra hoy un idioma **mixto**: el operador español ve etiquetas en español
("Guardar", "Nombre", "Eliminar") mezcladas con texto en inglés ("Summary is required",
"APR reviewed", "Working at Height"), datos sembrados en inglés ("North Plant (RNV)",
"Preventive Security", "Safe Act") y errores del backend en inglés ("Name is required",
"Plant not found"). Para un usuario de planta hispanoparlante, registrar una
**Observación de Seguridad** exige leer mitad en inglés mitad en español, y los
catálogos maestros (Sectores, Plantas, Empresas Contratistas, Observadores, Combo
Options) muestran valores que no son los que se nombran en el terreno. El GLOSSARY
vigente declara además que el idioma del dominio es el inglés — política que este
trabajo invierte.

## Solution

**Un solo idioma, español, en todo lo que ve el usuario**: vistas, definiciones,
descripciones, mensajes de validación y conflicto (incluso los que nacen en el
backend), datos sembrados, marca y formato de fechas. El contrato técnico queda
intacto: identificadores de código (C#, TypeScript), nombres de propiedades JSON,
rutas de API, enums serializados y el archivo `itrion.db` siguen en inglés; la
traducción vive solo en la capa de presentación y en los **valores de datos**. No se
introduce framework i18n: la app es de un solo inquilino y un solo idioma
(ADR-0001); los strings se reemplazan en su lugar. La marca visible pasa de "Itrion"
a **SHYMA**.

## User Stories

1. Como supervisor de seguridad, quiero ver todas las etiquetas del formulario de
   Observación de Seguridad en español, para registrar observaciones sin traducir
   mentalmente ningún campo.
2. Como supervisor, quiero que los errores de validación del formulario digan
   "Campo obligatorio" (y variantes españolas) en español, para corregir sin
   interpretaciones.
3. Como supervisor, quiero que los errores que devuelve la API (legajo duplicado,
   planta referenciada por observaciones, observador inexistente) lleguen en español,
   para entender qué falló sin depender del frontend.
4. Como supervisor, quiero que los dropdowns de Plantas, Sectores, Empresas
   Contratistas y Observadores muestren valores sembrados en español ("Planta Norte
   (RNV)", "Seguridad Preventiva"), para elegir lo que nombro en la planta.
5. Como supervisor, quiero que cada hallazgo del **Safety Review** se lea en español
   ("APR revisado", "Revisión de ATR necesaria"), para responder sí/no con precisión.
6. Como supervisor, quiero que los cuatro campos multiselect (Gestión de Riesgo,
   Protocolos Mortales, Clasificación, Relación) ofrezcan labels en español
   ("Trabajo en Altura", "Acto Seguro"), para clasificar como clasifica la industria
   local.
7. Como supervisor, quiero ver las columnas de las grillas en español y las fechas en
   formato `dd/MM/yyyy`, para leer los listados sin reformatar nada en la cabeza.
8. Como supervisor, quiero toolbar, botones, placeholders, tooltips y estados vacíos
   en español, para no encontrar jamás texto sin traducir.
9. Como supervisor, quiero que los diálogos de confirmación de eliminación y los
   toasts de éxito/error estén en español, para operar sin sorpresas.
10. Como administrador de catálogos, quiero las pantallas CRUD de los cinco Registros
    Maestros enteramente en español (encabezados, campos, acciones, mensajes), para
    mantener Sectores, Plantas, Empresas, Observadores y Combo Options en mi idioma.
11. Como administrador, quiero Observadores con nombres hispanos y objetivos en
    español, para que los datos de ejemplo reflejen gente real de planta.
12. Como usuario de la función demo (Mantenimiento de Equipos), quiero estados, tipos,
    personas, equipos y actividades en español, porque la app es español en
    **todas** sus pantallas, incluida la demo del contrato compartido.
13. Como usuario, quiero que el título de la app, los logos (texto alternativo) y el
    pie digan **SHYMA**, para reconocer la marca en todos lados.
14. Como usuario, quiero el calendario y el date-picker en español con display
    argentino, para navegar fechas sin fricción.
15. Como usuario que exporta a Excel, quiero que el archivo exportado tenga encabezados
    en español, para compartirlo sin re-titular columnas.
16. Como usuario que migra su base local, quiero que una base recién creada nazca ya en
    español (migración EF nueva), para no editar datos a mano jamás.
17. Como usuario, quiero que **no** exista selector de idioma, para saber que la app es
    español y nada más.
18. Como usuario con datos en su base local, quiero que la migración preserve mis
    Observaciones existentes (los seeds solo tocan catálogos y demo), para no perder
    registros propios al actualizar.
19. Como desarrollador, quiero que GLOSSARY.md declare el español como idioma canónico
    del dominio con los identifiers ingleses como nombres técnicos, para que agentes y
    humanos compartan la misma lengua.
20. Como mantenedor futuro, quiero un ADR que explique la inversión de la política de
    idioma, para entender por qué el código es inglés y la pantalla es español.
21. Como desarrollador, quiero que el contrato JSON (nombres de campos, enums, rutas)
    siga intacto, para que fixtures, harness y scripts solo cambien por valores, no por
    estructura.
22. Como desarrollador, quiero fixtures MSW recapturados desde la API viva en español,
    para que las suites de integración hablen el mismo idioma que el backend real.
23. Como desarrollador, quiero que `master-parity-sweep.sh`, `combo-parity-check.sh` y
    `observer-deactivation-check.sh` pineen labels y copias en español, para que la
    paridad backend↔frontend quede verificada en el idioma definitivo.
24. Como desarrollador, quiero los labels españoles de Combo Options fijados en el
    glosario, para que smoke tests, seeds y sweeps compartan una sola tabla canónica.
25. Como agente que trabaja en este repo, quiero reglas claras de qué se traduce (lo
    visible) y qué no (identificadores), para no tocar código por accidente.
26. Como reviewer, quiero commits por ticket con gates verdes (tsc, lint, suite), para
    verificar cada capa del cambio por separado.

## Implementation Decisions

**Política de idioma (contrato primero)**
- GLOSSARY.md se reescribe en español: términos canónicos españoles (*Observación de
  Seguridad*, *Observador*, *Planta*, *Sector*, *Empresa Contratista*, *Registro
  Maestro*, *Lugar*, *Tarea*…), con el identificador inglés reconocido como nombre de
  código. El header que hoy declara "the language is English" se invierte.
- ADR-0005 (en español) documenta la inversión: visible=español, contrato=inglés,
  sin i18n.

**Idioma único, sin framework**
- Sustitución directa de literales en componentes y configs del frontend. Se rechaza
  react-intl/lingui/locales: un solo idioma por ADR-0001.

**Backend (strings visibles, no identificadores)**
- Todos los mensajes que consume el usuario se traducen dentro de C#: los lambdas de
  validación, `ConflictMessage`, `NotFoundMessage` del adaptador MasterCrud, y los
  `ValidationException`/`ConflictException` de los services (Observadores, Equipos,
  Personas, etc.). Nombres de clases, propiedades, rutas y campos JSON no se tocan.
- Enums serializados (`Operational`, `Completed`, `Gerente/Jefe/Supervisor` ya
  hispano) viajan igual; el frontend los pinta con label-maps
  (`Operativo/En Reparación/Fuera de Servicio`, `Pendiente/Completado`).
- El exportador de Excel ya firma en español; sus encabezados provienen de las configs
  de grilla, que se traducen con el resto.

**Datos sembrados — migración EF nueva**
- Los `HasData` actuales están hornados en la migración inicial; se agrega **una
  migración nueva con `UpdateData`** sobre los valores de seed (historial lineal;
  IDs y códigos parentéticos como `(RNV)` intactos). No toca Observaciones (no hay
  seeds de observaciones), por lo que datos locales del usuario sobreviven.
- Tabla canónica de labels Combo Options (acrónimos de la industria se conservan):
  - `gestionRiesgo`: Charla de Riesgo Diario (DRT) · Análisis de Seguridad del
    Trabajo (JSA) · Permiso de Trabajo · Charla de Toolbox
  - `protocolosMortales`: Trabajo en Altura · Aislamiento de Energía (LOTO) · Ingreso
    a Espacio Confinado · Trabajo en Caliente · Equipo Móvil en Movimiento · Excavación
  - `clasificacionObservacion`: Acto Seguro · Condición Segura · Acto de Riesgo ·
    Control Defensivo
  - `relacionObservacion`: Relacionado con APR · Relacionado con ATR · Relacionado con
    la Tarea · Relacionado con Condiciones del Sitio
- Renombres de seed: plantas `Planta Norte (RNV)` / `Planta Sur (PLS)` / `Planta
  Central (TSS)` / `Planta Muelle (VQG)`; sectores `Seguridad Preventiva` / `Control
  de Acceso` / `Ronda y Vigilancia` / `Respuesta a Emergencias`; empresas `Servicios
  de Seguridad Shield` / `Guardian Staffing → dotar de nombre español equivalente` /
  `Protección de Instalaciones Apex`.
- Personas inventadas en español (IDs, legajos y DNIs no se tocan; emails derivados):
  Observers → Elena Herrera, Rubén Mercado, Javier Sosa, Nora Peralta; demo Persons →
  Iván Quiroga, Selva Rivas, Tomás Bermúdez. Objetivos de observers en español.
- Seed demo de Mantenimiento de Equipos en español (equipos, actividades, personas).

**Vistas**
- Etiquetas, encabezados de grilla, acciones, placeholders, tooltips, estados vacíos,
  diálogos de confirmación, toasts y mensajes zod de formularios: español, dominio
  SHYMA y función demo incluidos, en todas las vistas de Registros Maestros.
- Marca: título del documento, textos alternativos de logos y pie de copyright dicen
  SHYMA. `itrion.db`, connection string y namespace `Itrion.Api` quedan (artefactos
  de código).
- Display de fechas `dd/MM/yyyy` con `date-fns/locale/es` en calendario/date-picker;
  las cadenas ISO técnicas que viajan a la API (`en-CA`) no se tocan.

**Troceo (5 tickets, orden de dependencia)**
1. Contrato de idioma: GLOSSARY.md + ADR-0005.
2. Datos y backend: migración de seeds + mensajes de backend en español + recaptura de
   fixtures + re-pine de sweeps/scripts.
3. Frontend dominio SHYMA.
4. Frontend demo Mantenimiento de Equipos.
5. Marca SHYMA + locales de fecha.

## Testing Decisions

- **Qué es un buen test aquí**: solo comportamiento visible — texto que el usuario ve
  (label del campo, mensaje de error, valor del dropdown, encabezado de grilla,
  formato de fecha) y respuestas HTTP del contrato (400/404/409 con copia española).
  Nada de asserts sobre estructuras internas de label-maps ni sobre literales de
  código.
- **Seamas existentes, cero seamas nuevas**:
  - **Harness de API viva** (`with-api.sh` + barridos): el seam más alto del backend.
    La función `copy()` del barrido de paridad ya assertiona el `message` de
    `ErrorResponse` literal — ahí se pinean los mensajes de backend en español; los
    labels de Combo Options pineados en el barrido pasan a los valores españoles de la
    tabla canónica; el check de desactivación de Observadores se re-pinea en español.
  - **Suite de vitest con fixtures MSW** (smoke tests por módulo, suite profunda de
    Registros Maestros, forms): seam de la capa de presentación; los fixtures se
    **recapturan desde la API viva** tras la migración de seeds, de modo que las
    suites asertan strings españoles contra datos españoles reales.
  - Gates de compilación: `tsc -b` + eslint sobre archivos staged (pre-commit), suite
    vitest en pre-push.
- **Qué se toca en cada suite**: los smoke tests que hoy pinean strings ingleses
  ("Safe Condition", nombres de plantas) se actualizan a los valores canónicos
  españoles — la aserción sigue siendo la misma forma (texto visible), solo cambia el
  idioma.
- **Prior art**: los `*.smoke.test.tsx` de sectors/plants/observers/
  contractorCompanies/comboOptions, la suite profunda del factory de Registros
  Maestros, el form test de Mantenimiento de Equipos, y el barrido de paridad con
  aserción de copia (`copy()`) — todos patrones a imitar, no inventar.
- No existe proyecto de tests en C#: el backend se valida por los scripts del harness;
  no se crea uno.

## Out of Scope

- Framework i18n, selector de idioma, multi-locale.
- Renombrar el contrato JSON de la API (campos, enums serializados, rutas,
  query-params).
- Identificadores de código: namespaces (`Itrion.Api`), nombres de clases/propiedades/
  archivos C# y TS, nombres de rama, `itrion.db` y su connection string.
- Traducir AGENTS.md, CODING_STANDARDS.md y los ADRs 0001–0004 (quedan en inglés;
  ADR-0005 y GLOSSARY.md se escriben en español).
- Migración de datos reales de producción: la app es local de un solo inquilino; no
  hay datos reales que migrar más allá de los seeds y lo que cada desarrollador tenga
  en su `itrion.db` (que la migración preserva).
- Superficies que el dominio no tiene: charts de observaciones y auth (GLOSSARY,
  "Relationships").

## Further Notes

- La tabla canónica de labels del glosario es la **única fuente de verdad**: seeds,
  fixtures, sweeps y smoke tests la consumen; si un label cambia, cambian los cinco.
- El barrido de paridad y el combo-parity-check son el gate de los archivos
  master-catalog del backend (AGENTS.md): deben quedar verdes con los valores
  españoles antes de commitear el ticket 2.
- La base local `itrion.db*` es demo: el harness (`with-api.sh`) la regenera limpia en
  cada corrida; el local del desarrollador se borra y regenera al aplicar la
  migración (sin seeds de observaciones, sus registros propios se preservan de todos
  modos vía `UpdateData` sobre catálogos).
- Ship por ticket: commit con gates verdes, merge de la rama de integración a `master`,
  push de ambos a `origin` (regla de AGENTS.md).
- Decisiones de idioma tomadas en la sesión de grill (Q1–Q15) quedan reflejadas aquí;
  ADR-0005 es su registro formal.
