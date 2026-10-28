# 05 — Frontend auth deletion sweep

Status: resolved

- `apiClient.ts`: no JWT interceptor, no 401→login redirect, no `X-Tenant-Slug`, no
  `modules/auth` import; keep toast handling for 400/409.
- Delete `Authorized.tsx`, `useAuthUser.tsx`, `usePermission.ts`, `UserMenu.tsx` (+ test);
  `useMenuNavigation` renders the navigation config as-is (no permission filter).
- Routes: delete `_auth` group; equipment routes move to `routes/equipmentMaintenances/...`
  under a shared `routes/route.tsx` AppShell layout; regenerate route tree.
- Strip `Authorized` wrappers + imports from equipment views.
- MSW `handlers.ts`: remove auth handlers/mock user; delete auth cases in
  `apiClient.test.ts`; all existing tests pass.

## Answer

Sweep de autenticación completo en `frontend/`, con la suite verde:

- `src/api/apiClient.ts`: reescrito sin interceptores de auth (no JWT, sin
  `X-Tenant-Slug`, sin import de `modules/auth`, sin redirección 401→login). Se
  conservan los toasts de 400/409/404/500/timeout/timeout de conexión. Se agregó
  `adapter: 'fetch'` para que MSW (jsdom) intercepte las llamadas de axios.
- Eliminados `Authorized.tsx`, `useAuthUser.tsx`, `usePermission.ts`,
  `UserMenu.tsx`, `ProtectedRoute`, `AppSidebarLayout`, `LoginModal`,
  `ModalUserConfig` y sus tests; `useMenuNavigation.tsx` renderiza la config de
  navegación estática (`navigation.ts` con Home + EquipmentMaintenances, sin
  campos de permisos).
- Grupo de rutas `_auth` eliminado. Layout AppShell compartido como ruta
  pathless `src/routes/_layout/route.tsx` con las rutas de mantenimiento bajo
  `_layout/equipmentMaintenances/` (index, new, `$id`, `edit.$legajo`) y una
  home `_layout/index.tsx`. El route tree fue regenerado; `routeTree.gen.ts`
  refleja el nuevo árbol. Link de edición aponta a
  `/equipmentMaintenances/edit/$legajo` (param legajo) como pide la spec.
- Vistas de mantenimiento sin wrappers/imports de `Authorized`; imports de
  rutas actualizados a `@/routes/_layout/...`.
- MSW `handlers.ts`: removidos handlers de auth y mock user (los handlers
  restantes usan URLs `*/api/v1/...` agnósticas de host). Se eliminaron los
  casos de auth de `apiClient.test.ts` (se agregaron dos casos que verifican
  que no hay header Authorization y que 409 muestra toast).
- `schemas.test.ts` (contratos de auth/device/person/expiration de los módulos
  ya inexistentes) fue eliminado.
- Datos de referencia del formulario de mantenimiento: se crearon los módulos
  backend completos `Features/Persons` (CRUD, validación 400, borrado en
  cascada de mantenimientos) y `Features/EquipmentItems` (CRUD + `GET all` +
  `PATCH {id}/status` con validación de estado) en `api/v1/persons` y
  `api/v1/equipment-items`, con seed (`SeedData` personas/equipos ya existía).
  En frontend: `src/modules/persons/` y `src/modules/equipmentItems/` (tipos +
  servicios con `getAll`/`getAllPaginated` Gridify-compatible, `updateStatus`).
- Infra de tests: `vitest.config.ts` nuevo (jsdom + setup + vitest-canvas-mock)
  — en el baseline la suite corría sin environment jsdom y estaba rota
  (23 failed / 57 passed en HEAD~0); ahora pasa completa.
- Verificación: `npx vitest run` → 21 archivos / 133 tests passing; `npx tsc -b`
  sin errores; `dotnet build` backend 0 warnings/0 errors; smoke API personas +
  equipos (200/201/204/400/404 correctos) y smokes completos de master-data
  (75/75) y operativos (33/33).
- Nota: `npm run lint` (eslint) tiene ~46 errores pre-existentes del baseline
  (reglas `no-explicit-any`/`react-refresh`/react-compiler en componentes
  `ui/` y tests heredados); no es una verificación que estuviera en verde antes
  y quedó sin cambios de comportamiento por este ticket.
