# GLOSSARY — itrion

> **Idioma del dominio: español.** Toda la lengua visible —etiquetas, definiciones,
> descripciones, mensajes de validación y conflicto (incluso los que nacen en el
> backend), datos sembrados, marca y formato de fechas— es **español**. El inglés vive
> únicamente en el **contrato técnico**: identificadores de código (C# y TypeScript),
> nombres de propiedades JSON, rutas de API, enums serializados y el archivo
> `itrion.db`. El identificador inglés se reconoce como **nombre técnico** de cada
> término (entre paréntesis en este glosario). No existe framework i18n ni selector de
> idioma (ADR-0001, ADR-0005). La marca visible es **SHYMA**.

## Observación de Seguridad (Security Observation)

Un evento de seguridad de un solo día reportado por un equipo de Observadores. La
unidad central de negocio: el objeto que un Observador registra cuando ve algo inseguro,
seguro o cercano en la planta. Responde tres preguntas: **qué** se observó, **qué se
hizo de inmediato** para controlarlo, y **qué acción correctiva** se tomó a
continuación. Es referenciada por la planta y el sector, nomina entre uno y diez
Observadores, y puede opcionalmente nombrar una Empresa Contratista.

- **Observación Activada (Activated Observation)**: la Observación está activa; es la
  única que aparece en los listados (S1).
- **Observación Desactivada (Deactivated Observation)**: la Observación está
  desactivada y **no aparece** en ningún listado — queda invisible para todos los
  usuarios, incluidos los administradores. Su historial persiste en la base, intacto y
  auditable, como el expediente de una persona fallecida.
- **Campo multiselect (Multi-select Field)**: un campo cuya lista de opciones es una
  Registro Maestro editable por el administrador (Opción de Combo) y cuya selección
  admite varios valores a la vez. Las cuatro categorías de una Observación son campos
  multiselect: *Gestión de Riesgo*, *Protocolos Mortales*, *Clasificación de
  Observación* y *Relación de Observación*.
- **Revisión de Seguridad (Safety Review)**: checklist sobre las medidas de seguridad
  verificadas antes y durante la tarea: *APR revisado*,
  *Tarea realizada según APR*, *Revisión de ATR necesaria*, *Riesgo TRC considerado*,
  *Riesgo de impacto controlado*, *Medidas de manos y lesiones*, *Medidas de lesiones*,
  *Herramientas revisadas*, *Equipos móviles revisados*, *Energía revisada*,
  *Escaleras revisadas* y *Equipos eléctricos y disyuntores*. Cada una de las doce
  preguntas se responde con una **Respuesta de Revisión de Seguridad** tri-estado —
  Sí, No o N/A — nunca con un checkbox de confirmación.
- **Respuesta de Revisión de Seguridad (Safety Review Answer)**: respuesta de una
  pregunta de la Revisión con valor **Sí**, **No** o **N/A**, presentada al usuario en
  español (ADR-0005). En el wire y en las propiedades JSON usa los literales `"SI"`,
  `"NO"`, `"N/A"` — valores en español con propiedad en inglés (ADR-0006) — y la
  entidad los guarda como texto. **N/A es una respuesta válida** ("no aplica"); sin
  respuesta es ausencia: NULL, y para Observaciones es error de completitud. Las doce
  preguntas admiten N/A sin excepciones (la lista de preguntas que lo admiten es la
  lista completa), y una Observación con las doce respuestas en N/A es válida: la
  completitud exige que las doce respondan, no que haya al menos un Sí.
  "N/A" ≠ sin respuesta.
- **Controles Críticos (Critical Controls)**: texto libre del bloque de la Revisión de
  Seguridad que describe los controles críticos aplicados a la tarea.
- **Acción Inmediata (Immediate Action)**: texto libre que describe la acción de
  control de riesgo tomada *en el momento* de la observación — la primera acción en el
  terreno para neutralizar el riesgo, no la corrección posterior ni el seguimiento
  (eso es la Acción Detallada). Es campo de texto libre, no multiselect.
- **Resumen (Summary)**: texto libre que describe *qué* se observó: el hallazgo en sí.
- **Acción Detallada (Detailed Action)**: texto libre que describe la acción
  correctiva tomada *después* del momento de la observación — el seguimiento de
  gestión. Complementa al Resumen, que describe el hallazgo.

**Relationships**
- Es referenciada por la Planta y el Sector.
- Puede referenciar opcionalmente a la Empresa Contratista.
- Referencia a una lista de Observadores (entre 1 y 10).
- Contiene exactamente una Revisión de Seguridad de doce Respuestas de Revisión de
  Seguridad (Sí/No/N/A).
- Referencia a una lista de Labels de *Gestión de Riesgo* (categoría `gestionRiesgo`).
- Referencia a una lista de Labels de *Protocolos Mortales* (categoría `protocolosMortales`).
- Referencia a una lista de Labels de *Clasificación de Observación* (categoría `clasificacionObservacion`).
- Referencia a una lista de Labels de *Relación de Observación* (categoría `relacionObservacion`).

**Example dialogue**
- **Usuario:** "Veo un operario sin EPP en la Planta Norte (RNV)."
- **Sistema:** "Registro la Observación de Seguridad."
- **Usuario:** "¿Tengo que elegir un solo Observador?"
- **Sistema:** "No. Entre uno y diez Observadores firman la Observación."
- **Usuario:** "¿Dónde registro la seguridad de la tarea?"
- **Sistema:** "En la **Revisión de Seguridad**."
- **Usuario:** "El observador hizo algo seguro."
- **Sistema:** "Clasifícala como Acto Seguro."

**Key distinctions**
- Resumen = qué observaste. Acción Detallada = qué se hizo después. Acción Inmediata =
  qué se hizo *en el momento*.
- Inmediato (booleano) = **si** se controló el riesgo en el momento. Acción Inmediata =
  **qué** se hizo en ese momento.
- Revisión de Seguridad = confirmaciones sobre las medidas preventivas de la tarea.
  Clasificación = la naturaleza del hallazgo. Gestión de Riesgo = el mecanismo de
  control en juego.

## Observador (Observer)

Una persona autorizada para registrar Observaciones de Seguridad. Es un Registro
Maestro con nombre completo, objetivo y un status interno (`Active` / `Inactive`) que
controla su elegibilidad: solo los Observadores **Activos** pueden ser nombrados en
una Observación de Seguridad nueva o editada.

- **Status del Observador (Observation Status)**: el estado de un Observador,
  visible "Activo" / "Inactivo" (el valor en el contrato es `Active` / `Inactive`).
- **Regla de elegibilidad del Observador (Observer Eligibility Rule)**: solo los
  Observadores Activos pueden aparecer en el select de Observadores de una Observación
  de Seguridad nueva o editada.

**Relationships**
- Referencia a una lista de Observadores.
- El Observador es una Registro Maestro: se crea y edita en su propia pantalla de
  administración (ver *Registro Maestro*).

**Example dialogue**
- **Usuario:** "¿Por qué Carlos Gutiérrez no aparece en el select?"
- **Sistema:** "Porque su **Status del Observador** es Inactivo. Solo los Observadores
  Activos son elegibles."
- **Usuario:** "¿Puedo guardar una Observación sin Observadores?"
- **Sistema:** "No. Se requiere al menos un Observador."

**Key distinctions**
- Status = elegibilidad en nuevas Observaciones; no es visibilidad en listados, que
  dependen de la Observación.
- Nombre = etiqueta visible; Objetivo = propósito del Observador en la organización.

## Revisión de Seguridad (Safety Review)

El checklist de confirmaciones Sí/No sobre las medidas de seguridad de la tarea
observada (lista de doce campos en *Observación de Seguridad*). Es un bloque de datos
propio de la Observación. No es una Registro Maestro.

**Relationships**
- Contiene exactamente una Revisión de Seguridad.

**Example dialogue**
- **Usuario:** "¿La Revisión de Seguridad es la Clasificación?"
- **Sistema:** "No. La Revisión de Seguridad son confirmaciones sobre las medidas de
  la tarea; la Clasificación describe la naturaleza del hallazgo."

**Key distinctions**
- Revisión de Seguridad = medidas preventivas confirmadas. Clasificación = naturaleza
  del hallazgo. Gestión de Riesgo = mecanismo de control en juego.

## Planta (Plant)

Un establecimiento industrial. Referencia a la locación física donde ocurre la
Observación. Se nombra con un nombre y un **código** (un identificador corto,
paréntético y legible, como `RNV`, `SPA` o `BAH`) que se muestra junto al nombre y se
usa en contextos compactos (listas, select, exportaciones). Es una Registro Maestro
administrada en pantalla.

**Relationships**
- Es referenciada por la Observación de Seguridad (obligatorio).
- Referencia a una lista de Sectores.

**Example dialogue**
- **Usuario:** "¿Dónde ocurrió la observación?"
- **Sistema:** "La Planta es obligatoria en la Observación."

**Key distinctions**
- Planta = locación física. Sector = subdivisión funcional de la Planta.

## Sector (Sector)

Una subdivisión funcional de una Planta (por ejemplo, Mantenimiento, Operaciones,
Seguridad Preventiva).

**Relationships**
- Es referenciada por la Observación de Seguridad (obligatorio).
- Referenciada por la Planta.

**Example dialogue**
- **Usuario:** "¿A qué sector pertenece esta observación?"
- **Sistema:** "La Observación referencia un Sector."

**Key distinctions**
- Sector = área funcional de la Planta. Planta = locación física.

## Empresa Contratista (Contractor Company)

Una empresa externa con la que se vincula una Observación (obligatorio).

**Relationships**
- Referencia opcional de la Observación de Seguridad.

**Example dialogue**
- **Usuario:** "¿Esta observación es de un tercero?"
- **Sistema:** "La Observación referencia una Empresa Contratista."

**Key distinctions**
- Empresa Contratista = organización externa. Planta = locación interna.

## Opción de Combo (Combo Option)

Un Registro Maestro de valores etiquetados usados por los cuatro campos multiselect de
la Observación de Seguridad. Cada Opción de Combo pertenece a una categoría
(`ComboKey`, clave técnica en camelCase: `gestionRiesgo`, `protocolosMortales`,
`clasificacionObservacion`, `relacionObservacion`), se muestra con su **label** en
español, tiene un orden, y puede estar activa o inactiva.

**Relationships**
- Es referenciada por la Observación de Seguridad a través de sus campos multiselect.
- Referenciada por su categoría (combo key).

**Example dialogue**
- **Usuario:** "Quiero agregar un nuevo tipo de 'Clasificación de Observación'."
- **Sistema:** "Agrega una Opción de Combo a la categoría `clasificacionObservacion`."
- **Usuario:** "¿Puedo borrar 'Acto Seguro'?"
- **Sistema:** "No si está referenciada por Observaciones. Podes desactivarla para
  evitar que se use en nuevas Observaciones."

**Key distinctions**
- Combo Key = categoría. Label = texto visible (español), ordenable, referenciable.

### Categorías de Combo Options y labels canónicos

Las cuatro categorías existen, cada una con su nombre visible en español y su lista de
labels. El `ComboKey` del contrato queda en camelCase técnico; el label visible es
español. Esta tabla es la **fuente única** para seeds, fixtures, sweeps y smoke tests.

| Combo Key (técnico) | Campo en la Observación | Labels canónicos |
|---|---|---|
| `gestionRiesgo` | Gestión de Riesgo | Charla de Riesgo Diario (DRT) · Análisis de Seguridad del Trabajo (JSA) · Permiso de Trabajo · Charla de Toolbox |
| `protocolosMortales` | Protocolos Mortales | Trabajo en Altura · Aislamiento de Energía (LOTO) · Ingreso a Espacio Confinado · Trabajo en Caliente · Equipo Móvil en Movimiento · Excavación |
| `clasificacionObservacion` | Clasificación de Observación | Acto Seguro · Condición Segura · Acto de Riesgo · Control Defensivo |
| `relacionObservacion` | Relación de Observación | Relacionado con APR · Relacionado con ATR · Relacionado con la Tarea · Relacionado con Condiciones del Sitio |

## Lugar (Location)

Un campo de texto libre de la Observación que indica dónde *dentro de la Planta*
ocurrió el hecho (por ejemplo, "Tanque 3", "Frente de obra Norte").

**Relationships**
- Pertenece a la Observación de Seguridad (obligatorio).

**Example dialogue**
- **Usuario:** "¿En qué parte de la planta fue?"
- **Sistema:** "El campo **Lugar** es obligatorio."

**Key distinctions**
- Planta = locación física. Sector = área funcional. Lugar = sitio libre dentro de la
  Planta.

## Tarea (Task)

Un campo de texto libre de la Observación que describe la actividad que se estaba
realizando al momento del hecho.

**Relationships**
- Pertenece a la Observación de Seguridad (obligatorio).

**Example dialogue**
- **Usuario:** "¿Qué estaban haciendo cuando pasó?"
- **Sistema:** "El campo **Tarea** es obligatorio."

**Key distinctions**
- Tarea = actividad. Lugar = sitio. Planta = locación física.

## Pantalla Compartida (Shared Screen)

Una pantalla que muestra los datos de dos o más funciones —cada una con su propio
Backend y Frontend— sobre una misma superficie. El caso presente es la **Pantalla de
Mantenimiento de Equipos**, que muestra el CRUD de Items de Equipos, Personas y
Mantenimientos de Equipos sobre una sola grilla. Es un patrón **raro** en este
producto: la mayoría de las funciones siguen el patrón unificado habitual (una
función, un Backend, un Frontend); la Pantalla Compartida es la excepción.

**Relationships**
- Muestra el CRUD de la función Item de Equipo.
- Muestra el CRUD de la función Persona.
- Muestra el CRUD de la función Mantenimiento de Equipo.
- Es la superficie canónica para las tres funciones (S2).

**Example dialogue**
- **Usuario:** "¿Dónde administraba los Items de Equipos antes?"
- **Sistema:** "En su pantalla propia; ahora se administran en la **Pantalla de
  Mantenimiento de Equipos**, junto con Personas y Mantenimientos de Equipos."
- **Usuario:** "¿Sigue existiendo el backend de Items de Equipos?"
- **Sistema:** "Sí. La pantalla es compartida, no unificada."

**Key distinctions**
- Compartida = una pantalla sobre varios backends. Unificada = una pantalla sobre un
  backend (patrón habitual del producto).

## Registro Maestro (Master Record)

Un término de dominio, con su backend y frontend propios, que se administra en una
pantalla a medida en la que el administrador da de alta, edita, desactiva y ordena los
valores de ese dominio. Es la categoría de entidad que agrupa a Planta, Sector,
Empresa Contratista, Observador y Opción de Combo.

- **Configurador (Configurator)**: el archivo de configuración declarativo que
  describe una Registro Maestro.
- **Factory**: la fábrica que construye la pantalla a partir del Configurador
  (nombre técnico, se mantiene en inglés).

**Relationships**
- Planta, Sector, Empresa Contratista, Observador y Opción de Combo son Registros
  Maestros.
- Un Registro Maestro se define por su Configurador.
- El Observador es un Registro Maestro: se administra enteramente en su pantalla.
- Item de Equipo, Persona y Mantenimiento de Equipo **no** son Registros Maestros.
- Mantenimiento de Equipo: su backend es un CRUD completo, pero su frontend es una
  **vista hija** dentro de la Pantalla Compartida (no es Registro Maestro).

**Example dialogue**
- **Usuario:** "¿Cómo agrego una Planta nueva?"
- **Sistema:** "Abrís **Plantas** y la das de alta."
- **Usuario:** "¿Quién puede borrar un Sector?"
- **Sistema:** "Solo el administrador. Y si el Sector está referenciado, el backend
  rechaza la eliminación."

**Key distinctions**
- Registro Maestro = término con CRUD en pantalla a medida. Pantalla Compartida =
  pantalla con varios CRUD ajenos embebidos.

## Activación y Desactivación en Cascada

- **Activación en Cascada (Cascade Activation)**: al activar o crear una Observación
  padre, sus Observadores nombrados se activan en cascada.
- **Activación en Cascada Post-Eliminación (Post-Deletion Cascade Activation)**: al
  eliminar una Observación padre, las Observaciones restantes activan en cascada a sus
  Observadores nombrados.
- **Desactivación en Cascada por Desaparición (Deletion-triggered Cascade
  Deactivation)**: si un Observador desaparece, las Observaciones que lo nombraban se
  desactivan.

**Relationships**
- Ver la sección *Reglas de Cascada* al final.

**Example dialogue**
- **Usuario:** "Desactivo un Observador que tenía Observaciones activas."
- **Sistema:** "Esas Observaciones se **desactivan** en cascada y desaparecen de los
  listados."
- **Usuario:** "Borro un Observador."
- **Sistema:** "Las Observaciones que lo nombraban se desactivan. Y si al borrar una
  Observación quedan Observaciones restantes que nombran Observadores inactivos, esos
  Observadores se reactivan en cascada (S6)."

**Key distinctions**
- Activación en Cascada Post-Eliminación = al borrar una Observación, los
  Observadores nombrados por las Observaciones *restantes* se activan (S6).

## Item de Equipo (Equipment Item)

Un equipo registrado en la función demo de Mantenimiento de Equipos: tiene un número
de legajo, un nombre y un estado (`Nuevo`, `Usado`, `Mantenimiento`).

**Relationships**
- Referenciado por Mantenimiento de Equipo.

**Example dialogue**
- **Usuario:** "¿Dónde doy de alta un equipo?"
- **Sistema:** "En la **Pantalla de Mantenimiento de Equipos** (pestaña Items de
  Equipos)."

**Key distinctions**
- Item de Equipo = entidad de la demo. No es Registro Maestro.

## Persona (Person)

Una persona registrada en la función demo de Mantenimiento de Equipos (nombre,
apellido, DNI y e-mail).

**Relationships**
- Referenciada por Mantenimiento de Equipo (como titular).

**Example dialogue**
- **Usuario:** "¿Quién figura en el mantenimiento?"
- **Sistema:** "El Mantenimiento referencia una **Persona**."

**Key distinctions**
- Persona (demo) ≠ Observador. La Persona es la titular del mantenimiento; el
  Observador firma una Observación de Seguridad.

## Mantenimiento de Equipo (Equipment Maintenance)

Un mantenimiento aplicado a un Item de Equipo, con tipo, fecha, horas, costo y
titular. Función demo del producto.

**Relationships**
- Referencia a un Item de Equipo.
- Referencia a una Persona (titular).

**Example dialogue**
- **Usuario:** "¿Cuándo fue el último mantenimiento del equipo 5001?"
- **Sistema:** "Fue un mantenimiento **Programado** el 15 de marzo de 2024."

**Key distinctions**
- Mantenimiento de Equipo (demo) ≠ Observación de Seguridad. La Pantalla de
  Mantenimiento de Equipos es una Pantalla Compartida (varios backends en una sola
  pantalla), mientras que Observación de Seguridad, Planta, Sector, Empresa
  Contratista y Opción de Combo usan el patrón unificado.

## Mantenimiento Prendas de Vestir (Clothing Maintenance)

Una variante de Mantenimiento de Equipo aplicada a prendas de vestir: agrega talle
(`XS`…`XL`), color y cantidad a un mantenimiento (fecha, horas, costo, titular).

**Relationships**
- Es un tipo de Mantenimiento de Equipo.
- Referenciada por Mantenimiento de Equipo.

**Example dialogue**
- **Usuario:** "Necesito un mantenimiento que tenga talle y color."
- **Sistema:** "Registra un mantenimiento de tipo **Prendas de Vestir**."

**Key distinctions**
- Mantenimiento de Equipo (demo) = el tipo base. Mantenimiento Prendas de Vestir =
  variante con talle, color y cantidad.

## Estado (Active / Inactive)

- **Estado (Status)**: el estado de una entidad, expresado como los valores del
  contrato `Active` / `Inactive`. Visible: "Activa" / "Inactiva".
- **Activo (Active)**: una entidad cuyo Status es `Active`: elegible para ser
  referenciada en relaciones nuevas.
- **Inactivo (Inactive)**: una entidad cuyo Status no es `Active`: **no** elegible
  para relaciones nuevas.

**Relationships**
- Se aplica a Planta, Sector, Empresa Contratista, Observador, Opción de Combo,
  Item de Equipo, Persona y Mantenimiento de Equipo.
- Solo las entidades Activas aparecen en los select que referencian a una Observación
  de Seguridad.

**Example dialogue**
- **Usuario:** "Desactivé Planta Sur (SPA). ¿Puedo crear una Observación nueva que la
  mencione?"
- **Sistema:** "No aparece en el select de Plantas: es Inactiva."

**Key distinctions**
- Inactiva ≠ eliminada: los datos persisten y siguen en las relaciones existentes; la
  inactividad es una declaración de elegibilidad, no una orden de ocultamiento.

## Reglas de Cascada

- **Activación en Cascada (Cascade Activation)**: al crear o activar una Observación
  padre, sus Observadores nombrados se activan en cascada (S3).
- **Desactivación en Cascada por Desaparición (Deletion-triggered Cascade
  Deactivation)**: si un Observador desaparece, las Observaciones que lo nombraban se
  desactivan (S4).
- **Desactivación en Cascada por Inactivación (Inactivation-triggered Cascade
  Deactivation)**: si un Observador se desactiva, las Observaciones que lo nombran se
  desactivan en cascada (S5).
- **Activación en Cascada Post-Eliminación (Post-Deletion Cascade Activation)**: al
  eliminar una Observación padre, las Observaciones restantes activan en cascada a sus
  Observadores nombrados (S6).

## Idioma visible (Visible language)

- **Idioma visible**: todo texto que ve el usuario es **español** — etiquetas,
  definiciones, descripciones, placeholders, tooltips, estados vacíos, mensajes de
  validación y de conflicto (incluidos los generados por el backend), datos sembrados,
  encabezados de grillas y de exportaciones a Excel, marca (SHYMA) y fechas con
  display argentino (`dd/MM/yyyy`).
- **Contrato en inglés**: identificadores de código (C#, TypeScript), nombres de
  propiedades JSON, rutas de API, enums serializados (`Active`, `New`, `Planned`,
  `Active`/`Inactive`…), claves de Combo Option y el archivo `itrion.db` siguen en
  inglés. Nota: lo que sigue en inglés son los **nombres de propiedad**; los
  **valores** de las Respuestas de Revisión de Seguridad viajan como literales en
  español (`"SI"`, `"NO"`, `"N/A"`) — el valor respondido es copia visible y
  pertenece al idioma visible (ADR-0006).
- **Sin i18n**: no hay framework de localización ni selector de idioma; los literales
  se reemplazan en su lugar (ADR-0005).

**Relationships**:
- Se aplica a todo lo que ve el usuario en Observación de Seguridad, Registros
  Maestros, Pantalla Compartida y exportaciones.

**Example dialogue**
- **Usuario:** "¿Cómo cambio el idioma?"
- **Sistema:** "No se cambia: la app es español, y el inglés solo existe en el
  contrato técnico."

**Key distinctions**
- Traducir = valores y copia visible. No traducir = identificadores, contrato JSON,
  enums, rutas.
