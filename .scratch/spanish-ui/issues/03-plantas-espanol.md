# 03: Plantas al español

**What to build:** El Registro Maestro de Plantas funciona 100% en español: la base
nace con "Planta Norte (RNV)", "Planta Sur (PLS)", "Planta Central (TSS)", "Planta
Muelle (VQG)" — códigos parentéticos intactos; mensajes del backend en español
("Planta no encontrada", "La planta está referenciada por observaciones de seguridad y
no puede eliminarse"); la pantalla del catálogo en español. Mismo patrón que el ticket
02, aplicado a Plantas.

**Blocked by:** 01 (Contrato de idioma). (02 aporta el patrón; no bloquea.)

**Status:** ready-for-agent

- [ ] Migración EF nueva con UpdateData sobre los HasData de Plant (IDs y códigos
      parentéticos intactos).
- [ ] Mensajes visibles del backend de Plantas en español (Validation, ConflictMessage,
      NotFoundMessage).
- [ ] Config del Registro Maestro de Plantas: labels, encabezados, placeholders, zod en
      español.
- [ ] Fixtures MSW de plants recapturados desde la API viva.
- [ ] Smoke test de plants en español; barrido de paridad verde para plants.
- [ ] Suite completa verde; commit, merge a master, push de master + rama de integración.
