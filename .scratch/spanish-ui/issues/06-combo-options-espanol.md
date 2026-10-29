# 06: Combo Options al español

**What to build:** Las opciones de los cuatro multiselects de la Observación de
Seguridad son españolas en la base y en la pantalla: Gestión de Riesgo ("Charla de
Riesgo Diario (DRT)", "Análisis de Seguridad del Trabajo (JSA)", "Permiso de Trabajo",
"Charla de Toolbox"), Protocolos Mortales ("Trabajo en Altura", "Aislamiento de Energía
(LOTO)", "Ingreso a Espacio Confinado", "Trabajo en Caliente", "Equipo Móvil en
Movimiento", "Excavación"), Clasificación ("Acto Seguro", "Condición Segura", "Acto de
Riesgo", "Control Defensivo"), Relación ("Relacionado con APR", "Relacionado con ATR",
"Relacionado con la Tarea", "Relacionado con Condiciones del Sitio") — exactamente la
tabla canónica del GLOSSARY; combo keys, orden e IDs intactos; Registro Maestro de
Combo Options en español.

**Blocked by:** 01 (Contrato de idioma).

**Status:** resolved

- [x] Migración EF nueva con UpdateData sobre los HasData de ComboOption (combo keys,
      Order e IDs intactos; labels = tabla canónica del GLOSSARY).
- [x] Mensajes visibles del backend de Combo Options en español.
- [x] Config del Registro Maestro de Combo Options en español.
- [x] Fixtures MSW de combo-options recapturados desde la API viva.
- [x] Smoke test de combo options en español; scripts/combo-parity-check.sh y los pins
      de labels del parity sweep (payloads de observación con "Condición Segura",
      "Trabajo en Altura", "Relacionado con la Tarea", "Charla de Riesgo Diario (DRT)")
      repineados y verdes.
- [x] Suite completa verde; commit, merge a master, push.

## Answer

Migración `SpanishComboOptionsSeed` (UpdateData sobre los 18 labels HasData; ComboKeys,
Order e IDs intactos) con la tabla canónica del GLOSSARY: gestionRiesgo "Charla de Riesgo
Diario (DRT)" · "Análisis de Seguridad del Trabajo (JSA)" · "Permiso de Trabajo" · "Charla
de Toolbox"; protocolosMortales "Trabajo en Altura" · "Aislamiento de Energía (LOTO)" ·
"Ingreso a Espacio Confinado" · "Trabajo en Caliente" · "Equipo Móvil en Movimiento" ·
"Excavación"; clasificacionObservacion "Acto Seguro" · "Condición Segura" · "Acto de
Riesgo" · "Control Defensivo"; relacionObservacion "Relacionado con APR" · "Relacionado
con ATR" · "Relacionado con la Tarea" · "Relacionado con Condiciones del Sitio".
Backend: "ComboKey es obligatorio" / "Label es obligatorio" / "Opción de combo no
encontrada" / "La opción de combo está referenciada por observaciones de seguridad y no
puede eliminarse". Zod del config en español; label de campo "Clave de Combo"? — quedó
"Combo Key" (término técnico aceptado). Sweep: payloads de observación con labels
canónicos españoles; combo-parity-check repineado (copias españolas): 0 fallos; sweep
completo: 0 fallos. Fixtures recapturados (captura usa ahora labels españoles); smoke
combo asserta "Charla de Riesgo Diario (DRT)"; form test repineado. Suite verde.
