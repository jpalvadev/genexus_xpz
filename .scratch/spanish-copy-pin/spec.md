# Spec: Pin de copia visible en español (ADR-0005)

ADR-0005 fija que toda copia visible del backend (mensajes de validación, copy de
conflicto 409, copy de validación 400) llega al usuario en español, y el code-review
del epic spanish-ui encontró que el propio estándar estuvo obsoleto una sesión entera
(la regla "Rule messages are English" en CODING_STANDARDS.md sobrevivió a ADR-0005).
La mitad frontend del espejo ya está pinada por tests (zod mirror verbatim); la mitad
backend — que un string visible nuevo aparezca en inglés — se defiende a mano en review.

Misión: un check determinista, familia de los pin scripts del harness, que falle
cuando copia visible del backend aparezca en inglés, distinguiendo la copia
developer-facing que sigue en inglés por contrato (mensajes `InvalidOperationException`,
guardas `useX must be used within…`).

No-objetivo: tocar el contrato (nombres JSON, enums, rutas, ComboKeys — inglés por
ADR-0005).
