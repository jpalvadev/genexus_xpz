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

**Status:** ready-for-agent

- [ ] Migración EF nueva con UpdateData sobre los HasData de ComboOption (combo keys,
      Order e IDs intactos; labels = tabla canónica del GLOSSARY).
- [ ] Mensajes visibles del backend de Combo Options en español.
- [ ] Config del Registro Maestro de Combo Options en español.
- [ ] Fixtures MSW de combo-options recapturados desde la API viva.
- [ ] Smoke test de combo options en español; scripts/combo-parity-check.sh y los pins
      de labels del parity sweep (payloads de observación con "Condición Segura",
      "Trabajo en Altura", "Relacionado con la Tarea", "Charla de Riesgo Diario (DRT)")
      repineados y verdes.
- [ ] Suite completa verde; commit, merge a master, push.
