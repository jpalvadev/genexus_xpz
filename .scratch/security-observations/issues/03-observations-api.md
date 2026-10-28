# 03 — Security Observations API

Status: ready-for-agent

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
