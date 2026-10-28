# 05 — Frontend auth deletion sweep

Status: ready-for-agent

- `apiClient.ts`: no JWT interceptor, no 401→login redirect, no `X-Tenant-Slug`, no
  `modules/auth` import; keep toast handling for 400/409.
- Delete `Authorized.tsx`, `useAuthUser.tsx`, `usePermission.ts`, `UserMenu.tsx` (+ test);
  `useMenuNavigation` renders the navigation config as-is (no permission filter).
- Routes: delete `_auth` group; equipment routes move to `routes/equipmentMaintenances/...`
  under a shared `routes/route.tsx` AppShell layout; regenerate route tree.
- Strip `Authorized` wrappers + imports from equipment views.
- MSW `handlers.ts`: remove auth handlers/mock user; delete auth cases in
  `apiClient.test.ts`; all existing tests pass.
