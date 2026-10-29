# 05: Observadores al español

**What to build:** El Registro Maestro de Observadores funciona 100% en español: la
base nace con Observadores inventados en español — Elena Herrera (legajo 1001,
"Ronda perimetral y control de accesos", Jefe), Rubén Mercado (1002, "Simulacros de
incendio y respuesta a emergencias", Supervisor), Javier Sosa (1003, "Escolta de
contratistas y control de portería", Supervisor), Nora Peralta (1004, "Supervisión del
programa de seguridad", Gerente, inactiva) — legajos y asignaciones a Plantas intactos;
mensajes del backend en español ("El legajo ya existe", "Nombre completo es
obligatorio", "Objetivo es obligatorio", "Uno o más ids de Planta no existen", "El
observador está referenciado por observaciones de seguridad y no puede eliminarse");
pantalla del catálogo en español (incluido el toggle Activo y la regla de
desactivación: un Observador desactivado desaparece del dropdown y conserva sus
Observaciones).

**Blocked by:** 01 (Contrato de idioma).

**Status:** ready-for-agent

- [ ] Migración EF nueva con UpdateData sobre los HasData de Observer (IDs, legajos,
      asignaciones Observer–Planta intactos; FullName, Objective en español).
- [ ] Mensajes visibles del backend de Observadores en español.
- [ ] Config del Registro Maestro de Observadores: labels, encabezados, placeholders,
      zod en español.
- [ ] Fixtures MSW de observers recapturados desde la API viva.
- [ ] Smoke test de observers en español; barrido de paridad verde para observers;
      scripts/observer-deactivation-check.sh repineado con los valores españoles
      (regla GLOSSARY "Active"/observador inactivo, ADR-0002 intacta).
- [ ] Suite completa verde; commit, merge a master, push.
