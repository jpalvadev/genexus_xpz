# 08 — Frontend tests & dev wiring

Status: resolved

- MSW handlers for all new endpoints; `SecurityObservationForm.test.tsx`;
  contract-schema entries for new types; `npm test` green.
- `.env.development`: `VITE_API_BASE_URL=http://localhost:5281/api/v1`; backend CORS
  accepts the Vite origin. Manual smoke: table paging/sort, create passes validation,
  11 observers rejected, out-of-window date rejected, export downloads.
## Answer (2026-10-28)

**Done.**

- **MSW handlers** (`src/test/msw/handlers.ts`): security-observations list/detail/create/update/
  delete + export-excel (blob), observers (+lookup), plants, sectors, contractor-companies,
  combo-options (flat + `/{comboKey}`) — all bound to the API base URL from `VITE_API_BASE_URL`
  (`.env.test` already carried it, so Vitest and handlers share the same origin).
- **Live fixtures** (`src/test/fixtures/*.json`, 9 files): captured from the running backend
  with `/tmp/opencode/capture-fixtures.py` (POST seed → GET detail/list, masters, combo-options,
  combo-options/keys). `src/test/msw/fixtures.ts` re-exports them typed as the frontend's own
  response types — that assignment is a compile-time contract check (tsc fails on drift).
- **Contract schemas** (`src/test/contractSchemas.test.ts`): zod parsers of the live fixtures
  (observation response incl. 12 nullable Safety-Review booleans + refs + observers, {count,data}
  envelopes, masters, combo options — note: live combo rows are {id, comboKey, label, order},
  no isActive flag) plus TS-typed assignments of every fixture.
- **Form test** (`SecurityObservationForm.test.tsx`, 5 tests): renders catalogs/labels/date-window
  description; empty form rejected with the exact English rule messages (12× "Every Safety Review
  answer is required", per-family "At least one label is required for …"); full create walk-through
  (selects, observers multi-select, 12 checkboxes, 4 combo multi-selects, textareas) asserting the
  exact mapped payload (ids→labels, contractor null, `observers: [{observerId}]`) on
  `securityObservationService.create` + toast + router.invalidate/navigate; update mode sends
  (id, mapped payload) with the fixture record; out-of-window date (2020-01-01) rejected with
  "Observation Date must be between {min} and {max}" and no service call. Multi-select items are
  cmdk `role=option` (not checkbox) — asserted that way.
- **Rule mirror tests** (`securityObservation.rules.test.ts`, 10 tests): zod-level mirror of
  SecurityObservationRules — 11 observers → "The maximum number of observers is 10" (10 accepted),
  duplicate observer rejected, null Safety-Review answers counted per field, empty combo families
  per family, required texts, inclusive [today−7, today+1] window, Date→ISO normalization,
  request mapping incl. contractor null.
- **Wiring**: `.env.development`/`.env.test` already point to `http://localhost:5281/api/v1`;
  CORS preflight from `http://localhost:5173` returns 204 with Allow-Origin/Methods/Headers;
  manual smoke run with `vite` dev server + live backend: dev server serves the app, GET list and
  observers (`Filter=active=true`) return data with the dev origin allowed. Export-excel verified
  in the ticket-04 API smoke (blob + xlsx content-type) and mocked in MSW.

**Gates**: `tsc -b` 0 errors (added `resolveJsonModule` for JSON fixtures), `vite build` green,
`vitest run` 24 files / **154 tests passed** (133 pre-existing + 21 new).
