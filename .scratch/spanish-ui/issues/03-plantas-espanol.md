# 03: Plantas al español

**What to build:** El Registro Maestro de Plantas funciona 100% en español: la base
nace con "Planta Norte (RNV)", "Planta Sur (PLS)", "Planta Central (TSS)", "Planta
Muelle (VQG)" — códigos parentéticos intactos; mensajes del backend en español
("Planta no encontrada", "La planta está referenciada por observaciones de seguridad y
no puede eliminarse"); la pantalla del catálogo en español. Mismo patrón que el ticket
02, aplicado a Plantas.

**Blocked by:** 01 (Contrato de idioma). (02 aporta el patrón; no bloquea.)

**Status:** resolved

- [x] Migración EF nueva con UpdateData sobre los HasData de Plant (IDs y códigos
      parentéticos intactos).
- [x] Mensajes visibles del backend de Plantas en español (Validation, ConflictMessage,
      NotFoundMessage).
- [x] Config del Registro Maestro de Plantas: labels, encabezados, placeholders, zod en
      español.
- [x] Fixtures MSW de plants recapturados desde la API viva.
- [x] Smoke test de plants en español; barrido de paridad verde para plants.
- [x] Suite completa verde; commit, merge a master, push de master + rama de integración.

## Answer

Migración `SpanishPlantsSeed` (UpdateData x4, IDs y códigos parentéticos intactos):
"Planta Norte (RNV)", "Planta Sur (PLS)", "Planta Central (TSS)", "Planta Muelle (VQG)".
Backend: "Nombre es obligatorio" / "Planta no encontrada" / "La planta está referenciada
por observaciones de seguridad y no puede eliminarle" → copia final: "…no puede
eliminarse". Zod del config en español. Sweep: pins plants en español (not-found,
conflicto, validation_copy_for) — sweep sectors+plants: 0 fallos. Fixtures recapturados;
smoke de plants asserta "Planta Norte (RNV)"; SecurityObservationForm.test repineado.
Suite completa verde (175 tests).
