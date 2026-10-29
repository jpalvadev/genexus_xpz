# 09: Marca SHYMA + locales de fecha

**What to build:** La app abre y cierra en español con su marca: el título del
documento, los textos alternativos de los logos y el pie de copyright dicen **SHYMA**
("©2026 SHYMA. Todos los derechos reservados."); el calendario y los date-pickers usan
date-fns/locale/es y todas las fechas se muestran en formato argentino `dd/MM/yyyy` en
grillas y formularios (Observaciones y Mantenimientos). Las cadenas ISO técnicas que
viajan a la API (formato en-CA de envío) y el namespace Itrion.Api, itrion.db y su
connection string NO se tocan.

**Blocked by:** 07 y 08 (los formatos de display viven en las grillas/formularios que
esos tickets dejaron en español).

**Status:** ready-for-agent

- [ ] Título, alt de logos y pie de la app dicen SHYMA; test del AppShell repineado
      (asserts "Itrion" → "SHYMA").
- [ ] date-fns/locale/es en calendario y date-pickers; display `dd/MM/yyyy` en grillas
      y formularios de ambos módulos.
- [ ] Formatos ISO técnicos de ida y vuelta con la API intactos (ninguna aserción de
      contrato de fechas cambia).
- [ ] Barrido de paridad completo verde (los cuatro masters + observaciones), suite
      completa verde.
- [ ] Verificación final de la feature: sin texto inglés visible en ninguna pantalla
      (barrido manual de vistas: nav, títulos, placeholders, estados vacíos, diálogos,
      toasts, export).
- [ ] Commit, merge a master, push de master + rama de integración.
