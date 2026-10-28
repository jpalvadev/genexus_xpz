# 08 — Frontend tests & dev wiring

Status: ready-for-agent

- MSW handlers for all new endpoints; `SecurityObservationForm.test.tsx`;
  contract-schema entries for new types; `npm test` green.
- `.env.development`: `VITE_API_BASE_URL=http://localhost:5281/api/v1`; backend CORS
  accepts the Vite origin. Manual smoke: table paging/sort, create passes validation,
  11 observers rejected, out-of-window date rejected, export downloads.
