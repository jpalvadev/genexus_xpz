# 04: Empresas Contratistas al español

**What to build:** El Registro Maestro de Empresas Contratistas funciona 100% en
español: la base nace con empresas de nombre español ("Servicios de Seguridad Shield",
"Dotaciones Guardian" — fijar el nombre español equivalente a Guardian Staffing,
"Protección de Instalaciones Apex"); Razon Social/Reason For Social en español en la
UI; mensajes del backend en español ("La empresa está referenciada por observaciones
de seguridad y no puede eliminarse", "Empresa contratista no encontrada"). Mismo patrón
que 02.

**Blocked by:** 01 (Contrato de idioma).

**Status:** resolved

- [x] Migración EF nueva con UpdateData sobre los HasData de ContractorCompany (IDs
      intactos; nombre español definitivo para Guardian Staffing documentado en el
      ticket).
- [x] Mensajes visibles del backend de Empresas Contratistas en español.
- [x] Config del Registro Maestro de Empresas: labels, encabezados, placeholders, zod
      en español.
- [x] Fixtures MSW de contractor-companies recapturados desde la API viva.
- [x] Smoke test de empresas en español; barrido de paridad verde para
      contractor-companies.
- [x] Suite completa verde; commit, merge a master, push.

## Answer

Migración `SpanishContractorCompaniesSeed` (UpdateData x3, IDs intactos):
"Servicios de Seguridad Shield", "Dotaciones Guardian" (nombre español definitivo para
Guardian Staffing), "Protección de Instalaciones Apex". Backend: "Nombre es obligatorio" /
"Empresa contratista no encontrada" / "La empresa está referenciada por observaciones de
seguridad y no puede eliminarse". Zod del config en español (labels de razón social ya
estaban en español en UI/columns). Sweep: pins contractor-companies en español — sweep
completo (4 recursos): 0 fallos. Fixtures recapturados; smoke de empresas asserta
"Servicios de Seguridad Shield"; SecurityObservationForm.test repineado. Suite verde
(175 tests).
