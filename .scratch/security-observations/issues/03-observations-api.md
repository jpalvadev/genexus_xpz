# 03 — Security Observations API

Status: claimed

`Features/SecurityObservations/`: `SecurityObservationsController`,
`ISecurityObservationService`, `SecurityObservationService`,
`SecurityObservationRequest` (+ `ObserverSelection`, response DTOs with nested observer /
plant / sector / company objects), `SecurityObservationGridifyConfig`,
`SecurityObservationExcelExport`.

- Endpoints: GET (GridifyQuery, paging, default sort CreatedOn desc), GET/{id}, POST,
  PUT/{id:int}, DELETE/{id:int}, GET/export-excel.
- Handlers enforce the GeneXus rules (English messages, 400 + `ErrorResponse`):
  required fields incl. every Safety Review answer and ≥1 label per multi-select;
  1–10 observers ("The maximum number of observers is 10"); ObservationDate within
  [today−7, today+1]. CreatedOn server-set on insert, never updated.
- Multi-selects: `List<string>` ⇄ JSON array in the column. Observers: replace join rows
  on update; delete observation removes join rows (no FK to observer cascade).

## Answer

Done on `integration/security-observations`, commit `HEAD~0` (see `git log` "feat(03)").

- `Features/SecurityObservations/`: `SecurityObservationsController`,
  `ISecurityObservationService`, `SecurityObservationService`, `SecurityObservationRequest`
  (+ `ObserverSelection`), `SecurityObservationResponse` (nested plant / sector / company /
  observer DTOs), `SecurityObservationGridifyConfig`, `SecurityObservationExcelExport`,
  and `SecurityObservationRules` (the CheckRequiredFields port). Service registered in
  `Program.cs`.
- Rule messages (exact, from the smoke run): `Task is required`, `Plant is required`,
  `Sector is required`, `Place is required`, `At least one observer is required`,
  `The maximum number of observers is 10`, `The same observer cannot be named twice on one
  Security Observation`, `Every Safety Review answer is required`,
  `At least one label is required for Fatal-Risk Protocols` (per multi-select),
  `Summary is required`, `Detailed Action is required`,
  `Immediate Action Description is required`,
  `Observation Date must be between 2026-10-21 and 2026-10-29`, plus reference-existence
  messages (`Plant not found`, `One or more Observers do not exist`,
  `Only Active Observers may be named on a Security Observation`).
  All are 400 + `ErrorResponse`.
- Gridify facts learned here (apply to the frontend tickets): `OrderBy` is `"field desc"`
  with a **space**, not `field.desc`; a "contains/starts-with" filter is `field=*value`
  (`=` then `*`), which is exactly what `utils/gridifyFilter.ts` serializes. Default sort is
  applied server-side as `createdOn desc` when the client sends none.
- Active-only observers: enforced for newly named observers; observers already on a record
  stay named when they go inactive (GLOSSARY.md: deactivating never erases history).
- Verified by `/tmp/opencode/smoke-ops.py` (33/33 checks) run through
  `/tmp/opencode/with-api.sh` (starts the API, waits on port 5281, runs, stops): create 201
  with nested DTOs, label arrays round-trip, 11 observers → 400, out-of-window dates → 400,
  blank Safety Review answer → 400, empty multi-select → 400, each required field → 400,
  inactive observer → 400, PUT 204 with `CreatedOn` byte-identical afterwards, join rows
  replaced on update, paging/filter/`sector.name` filters, export → 7.5 KB xlsx (`PK` magic),
  DELETE 204 → join rows 0 while `Observers` stays at 4.
