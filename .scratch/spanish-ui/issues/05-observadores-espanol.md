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

**Status:** resolved

- [x] Migración EF nueva con UpdateData sobre los HasData de Observer (IDs, legajos,
      asignaciones Observer–Planta intactos; FullName, Objective en español).
- [x] Mensajes visibles del backend de Observadores en español.
- [x] Config del Registro Maestro de Observadores: labels, encabezados, placeholders,
      zod en español.
- [x] Fixtures MSW de observers recapturados desde la API viva.
- [x] Smoke test de observers en español; barrido de paridad verde para observers;
      scripts/observer-deactivation-check.sh repineado con los valores españoles
      (regla GLOSSARY "Active"/observador inactivo, ADR-0002 intacta).
- [x] Suite completa verde; commit, merge a master, push.

## Answer

Migración `SpanishObserversSeed` (UpdateData x8: FullName+Objective de los 4 seeds;
IDs, legajos y asignaciones Observer–Planta intactos): Elena Herrera (1001), Rubén
Mercado (1002), Javier Sosa (1003), Nora Peralta (1004, inactiva). Backend: "El legajo
ya existe" (x2), "Nombre completo es obligatorio", "Objetivo es obligatorio", "Uno o más
ids de Planta no existen", "El observador está referenciado por observaciones de
seguridad y no puede eliminarse", "Observador no encontrado". Zod del config: "Legajo
debe ser un número", "Nombre completo es obligatorio", "Objetivo es obligatorio", "El
cargo es obligatorio". Sweep observers: 0 fallos; `observer-deactivation-check.sh`
repineado con valores españoles (regla "Active"/ADR-0002 intacta: 0 fallos). Fixtures
recapturados; smoke observers asserta "Elena Herrera"/"Nora Peralta"; form test
repineado a "Elena Herrera — 1001". Suite verde (175 tests).
