# 04: Empresas Contratistas al español

**What to build:** El Registro Maestro de Empresas Contratistas funciona 100% en
español: la base nace con empresas de nombre español ("Servicios de Seguridad Shield",
"Dotaciones Guardian" — fijar el nombre español equivalente a Guardian Staffing,
"Protección de Instalaciones Apex"); Razon Social/Reason For Social en español en la
UI; mensajes del backend en español ("La empresa está referenciada por observaciones
de seguridad y no puede eliminarse", "Empresa contratista no encontrada"). Mismo patrón
que 02.

**Blocked by:** 01 (Contrato de idioma).

**Status:** ready-for-agent

- [ ] Migración EF nueva con UpdateData sobre los HasData de ContractorCompany (IDs
      intactos; nombre español definitivo para Guardian Staffing documentado en el
      ticket).
- [ ] Mensajes visibles del backend de Empresas Contratistas en español.
- [ ] Config del Registro Maestro de Empresas: labels, encabezados, placeholders, zod
      en español.
- [ ] Fixtures MSW de contractor-companies recapturados desde la API viva.
- [ ] Smoke test de empresas en español; barrido de paridad verde para
      contractor-companies.
- [ ] Suite completa verde; commit, merge a master, push.
