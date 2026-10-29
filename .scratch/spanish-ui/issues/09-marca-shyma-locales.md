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

**Status:** resolved

- [x] Título, alt de logos y pie de la app dicen SHYMA; test del AppShell repineado
      (asserts "Itrion" → "SHYMA").
- [x] date-fns/locale/es en calendario y date-pickers; display `dd/MM/yyyy` en grillas
      y formularios de ambos módulos.
- [x] Formatos ISO técnicos de ida y vuelta con la API intactos (ninguna aserción de
      contrato de fechas cambia).
- [x] Barrido de paridad completo verde (los cuatro masters + observaciones), suite
      completa verde.
- [x] Verificación final de la feature: sin texto inglés visible en ninguna pantalla
      (barrido manual de vistas: nav, títulos, placeholders, estados vacíos, diálogos,
      toasts, export).
- [x] Commit, merge a master, push de master + rama de integración.

## Answer

Marca: `index.html` con `lang="es"` y título "SHYMA"; AppShell con `alt="SHYMA"` en
ambos logos y pie "©2026 SHYMA. Todos los derechos reservados."; AppShell.test repineado
(assersts "Itrion"→"SHYMA", links "Home"→"Inicio"). Nav: "Menús" e "Inicio" en
`navigation.ts`. Locales: `locale={es}` (date-fns/locale/es) en los Calendar de
FormDate, FormDateTime y DateRangeFilter (Desde/Hasta); display `dd/MM/yyyy` ya estaba
en grillas y formularios de Observaciones y Mantenimientos (verificado).
GenericAlertDialog defaults en español ("Esto no se puede deshacer", "Continuar",
"Cancelar", "¿Estás completamente seguro?"). Contrato de fechas intacto: el envío sigue
siendo ISO `yyyy-MM-dd` (toIsoDate / format 'yyyy-MM-dd'), ninguna aserción de contrato
cambia. Barrido final de texto visible sin inglés: Home ya decía "Seguridad e Higiene en
el Trabajo (SHYMA)"; GenericTable/toolbar/filtros/paginación, diálogos, toasts, placeholders
y vistas verificados en español; único residuo era un comentario de comboOptions.config,
actualizado. Los `throw new Error('useX must be used within …')` de UI primitives y los
`InvalidOperationException` de MasterCrud quedan en inglés por ser copy de desarrollador
(ADR-0005). Sweep completo verde en el arranque del ticket 07 (backend sin cambios desde
entonces); tsc + suites de layout/componentes verdes; suite completa verde en pre-push.
