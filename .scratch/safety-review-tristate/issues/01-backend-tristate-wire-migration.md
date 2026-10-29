# 01 — Tri-state backend: enum, wire, migration, pins, docs

Status: ready-for-agent

Blocked by: (none)

Turn the twelve **Revisión de Seguridad** answers of the Security Observation from
nullable bool into the tri-state **Respuesta de Revisión de Seguridad**
(`"SI" | "NO" | "N/A"`) — spec: `.scratch/safety-review-tristate/spec.md`.

## Work

- `SafetyReviewAnswer { Yes, No, NotApplicable }` in `Genexus/Features/SecurityObservations/`,
  with the single `Parse`/`ToWire` map (wire/DB literals `"SI"`, `"NO"`, `"N/A"`) used by
  rules, service and the EF converter. First string-serialized enum of the repo: the
  existing enums (`ObserverPost`, `EquipmentMaintenanceType`, `EquipmentMaintenanceStatus`)
  serialize as numbers and stay untouched.
- `SecurityObservation` entity: twelve `SafetyReviewAnswer?` properties. `ItrionDbContext`:
  explicit `ValueConverter` → TEXT holding the Spanish literals, nullable, no default.
- `SecurityObservationRequest` / `SecurityObservationResponse`: `string?` on the twelve
  fields (rule-validated set keeps every rejection a 400 `ErrorResponse` in Spanish; the
  DTO doc comment's contract must survive).
- `SecurityObservationRules`: new rule **before** the mandatory one —
  `"Las respuestas de la Revisión de Seguridad deben ser Sí, No o N/A"`; the existing
  `"…son obligatorias"` message and chain position untouched; twelve `N/A` is valid.
- `SecurityObservationService`: map request↔entity↔response through the converter.
- One EF Core migration converting data: `1 → "SI"`, `0 → "NO"`, `NULL → NULL` (explicit
  SQL inside the SQLite table rebuild).
- Grid, Excel export and Gridify config: **no changes** (the twelve fields appear in none).
- Live pins: `scripts/master-parity-sweep.sh` and `scripts/observer-deactivation-check.sh`
  payloads to string literals; add an invalid-value 400 check to the sweep in the house
  `check()` style. `scripts/capture-fixtures.py` payload to literals with at least one
  `"N/A"`.
- Docs (this ticket, per spec): `GLOSSARY.md` — *Revisión de Seguridad* as Sí/No/N/A,
  new term **Respuesta de Revisión de Seguridad** with "N/A ≠ sin respuesta", delete the
  phantom boolean *Inmediato*, correct the serialized-enum line; new
  `docs/adr/0006-*.md` (tri-state Spanish-string answers, rejected alternatives, Combo
  Option precedent).

## Done when

`scripts/with-api.sh "$PWD/scripts/closeout-harness-pass.sh"` is green with the new checks
(new fixtures captured by the harness), and `scripts/spanish-visible-copy-check.sh` accepts
the new message literal. Frontend is not in this ticket; the integration branch is not
merged to `master` until ticket 02 lands (the frontend suite reads the new wire).
