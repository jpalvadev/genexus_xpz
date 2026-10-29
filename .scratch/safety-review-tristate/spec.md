# Safety Review tri-state answers (OPS) — spec

Status: ready-for-agent

Refactor every **checkbox of the Revisión de Seguridad** in the Security Observation
feature (SHYMA-OPS) into a **single-choice tri-state**: the persisted and serialized value
is a string `"SI" | "NO" | "N/A"` instead of a `bool?`, and the visible control is a
Shadcn **ToggleGroup** (single select) built as a new GenericForm `formField`.

Domain vocabulary: `GLOSSARY.md` (*Observación de Seguridad*, *Revisión de Seguridad*,
*Campo multiselect*). Governing ADRs: ADR-0001 (in-place repair, no auth), ADR-0002
(normalized observer join, no cascades), ADR-0005 (visible copy Spanish, contract
English). This spec adds **ADR-0006**.

## Problem Statement

The *Revisión de Seguridad* is twelve yes/no confirmations about the safety measures of the
observed task (APR revisado, Tarea realizada según APR, Revisión de ATR necesaria, Riesgo
TRC considerado, Riesgo de impacto controlado, Medidas de manos y lesiones, Medidas de
lesiones, Herramientas revisadas, Equipos móviles revisados, Energía revisada, Escaleras
revisadas, Equipos eléctricos y disyuntores). All twelve are mandatory, and the record has
only two answers on the wire: ticked or unticked. When a measure simply does not apply to
the task — no ladders, no mobile equipment, no energy involved — the Observador has to
tick a box that is not true, or leave the observation unsavable. The record then says
something the observer did not mean.

## Solution

Each of the twelve questions becomes one explicit choice between **Sí**, **No** and
**N/A**, rendered as a single-select ButtonGroup (Shadcn ToggleGroup, `variant="outline"`,
`size="sm"`, one pressed button per answer, label above the group). One pressed button is
the answer; nothing pressed is the unanswered state, which stays a validation error with
the same Spanish message. `N/A` is an answered state: it says the measure did not apply,
and an observation whose twelve answers are `N/A` is a valid record. Field names stay
English; the answer **values** are Spanish, exactly as Combo Option labels already are
("contrato en inglés, dominio en español", ADR-0005).

Grid, Excel export and Gridify filters do not show these twelve fields, so nothing in the
listing, export, cascade rules (ADR-0002) or other modules changes.

## User Stories

1. As an **Observador**, I want to answer **N/A** on a Safety Review question that does not
   apply to the task, so that I never have to tick a box that is not true.
2. As an Observador, I want to answer **Sí** and **No** as before, so that the confirmations
   I already give stay unchanged.
3. As an Observador, I want the three options visible together on one control, so that I can
   see the whole answer space of the question without opening a dropdown.
4. As an Observador, I want the pressed button to be visibly pressed, so that I can verify
   my answer before saving.
5. As an Observador, I want the answers laid out two per row with the label above each
   group, so that the twelve-question block stays readable on a normal screen.
6. As an Observador, I want each question to carry its required marker, so that I know
   the answer is mandatory.
7. As an Observador, I want the Safety Review separator to keep declaring that every
   question must be answered, so that the block-level rule is stated before I fill it.
8. As an Observador, I want saving to be blocked while any of the twelve is unanswered,
   with the message *"Todas las respuestas de la Revisión de Seguridad son obligatorias"*,
   so that an incomplete record never reaches the base.
9. As an Observador, I want a Spanish rejection when an answer is not one of the three
   values, so that a half-written value never reaches the base silently.
10. As an Observador editing an observation, I want to move an answer from **Sí** to **No**
    or **N/A**, so that I can correct a wrong answer.
11. As an Observador, I want an answered question to be un-blankable, so that editing a
    record never loses an answer by accident.
12. As an Observador, I want to register an observation whose twelve answers are **N/A**,
    so that a task to which no measure applied is a legitimate record.
13. As an Observador with historical observations, I want my old ticked/unticked answers to
    come out as **Sí**/**No** after the migration, so that history is not rewritten.
14. As an Observador, I want the whole Safety Review block visible and disabled in view
    mode, so that a saved observation is auditable exactly as it was answered.
15. As an **Administrador**, I want the answers stored as visible Spanish text, so that I
    can read the base directly without decoding bits.
16. As an Administrador, I want the API to carry the same literals the base holds, so that
    what I query and what I store are the same language.
17. As a **developer**, I want a reusable `toggle-group` form field in GenericForm, so that
    any future single-choice field uses the same control instead of a clone.
18. As a developer, I want the string↔enum map to exist once, so a value cannot drift
    between wire, base, UI and fixtures.
19. As a developer, I want the frontend zod mirror to carry the same Spanish messages in
    the same rule order, so UX and backend never diverge (CODING_STANDARDS "Rule messages
    are Spanish end to end").
20. As a maintainer, I want the live-API sweeps to pin the new literals, the invalid-value
    400 and the untouched mandatory 400, so the contract cannot regress unnoticed.
21. As a maintainer, I want the MSW/contract fixtures recaptured from the live API in the
    same harness boot, so contract tests stay honest.
22. As a future reader, I want an ADR that explains why a mandatory field is a Spanish
    string and not a nullable bool, so the choice is not re-litigated.
23. As a reader of the glossary, I want a named term for the answer values and the
    distinction "N/A ≠ sin respuesta", so the domain language stays precise.

## Implementation Decisions

Scope (grilling Q1, Q11): the twelve Revisión de Seguridad fields only
(`aprReviewed`, `taskRealized`, `requiresAtrReview`, `trcRisk`, `impactRiskControlled`,
`handInjuryMeasures`, `injuryMeasures`, `toolsReviewed`, `mobileEquipmentReviewed`,
`energyReviewed`, `ladderReviewed`, `electricalEquipmentCircuitBreaker`). The Observers
master record's `active` checkbox is *Estado* (`Active`/`Inactive`), not a Safety Review
answer: it stays a boolean.

**Contract (Q2, Q17, Q19)**
- Serialized and persisted values: `"SI"`, `"NO"`, `"N/A"` — byte-identical in wire, base,
  UI and fixtures. Property names stay English.
- `SafetyReviewAnswer { Yes, No, NotApplicable }` (C# identifiers English per ADR-0005)
  with the `Parse`/`ToWire` map living with the enum, in the Security Observations feature.
  It is the repo's first string-serialized enum — `ObserverPost`,
  `EquipmentMaintenanceType` and `EquipmentMaintenanceStatus` serialize as numbers.
- Request and Response keep `string?` for the twelve fields. The set is validated by
  `SecurityObservationRules`, so every rejection stays a 400 `ErrorResponse` with Spanish
  copy — the documented contract of `SecurityObservationRequest.cs` ("not a framework
  ValidationProblemDetails response") survives. An enum at the DTO boundary would fail in
  model binding and return the framework's English 400.
- The entity holds `SafetyReviewAnswer?`; EF Core gets an explicit `ValueConverter` so the
  TEXT column holds `"SI"`/`"NO"`/`"N/A"` (not the enum member names), nullable, no
  column default.
- Unanswered stays `NULL`, and `NULL` stays an error on the record. `N/A` is an answer.

**Rules (Q4, Q20, Q21)**
- New rule, evaluated **before** the mandatory one, in `SecurityObservationRules`:
  *"Las respuestas de la Revisión de Seguridad deben ser Sí, No o N/A"*.
- Existing *"Todas las respuestas de la Revisión de Seguridad son obligatorias"* is
  untouched (same copy, same position in the first-violation chain).
- No rule limits `N/A`: twelve `N/A` answers form a valid observation.

**Migration (Q6)**
- One EF Core migration that converts existing data: `1 → "SI"`, `0 → "NO"`,
  `NULL → NULL` (SQLite rebuilds the table; the conversion runs as explicit SQL in the
  migration). `itrion.db` is git-ignored and the harness reseeds it from scratch.

**Frontend control (Q7, Q9, Q16, Q17→Q22, Q23, Q28)**
- New Shadcn primitives in `components/ui/`, copied verbatim from the registry
  (`toggle.tsx`, `toggle-group.tsx`); the Radix primitive is already installed
  (`radix-ui@1.4.3`).
- New form field following the established GenericForm pattern, one per layer:
  `FormToggleGroup.tsx` (all form-specific behavior: `null` → nothing pressed, `disabled`,
  `onValueChange`) → registered as `ToggleGroup` in the form hooks' `fieldComponents` →
  `case 'toggle-group'` in the GenericForm switch → `'toggle-group'` in the `FieldConfig`
  `formField` union. `FormCheckbox` and `'checkbox'` stay (the Observers catalog uses them).
- Options come from one exported constant of the Security Observations types module
  (`SAFETY_REVIEW_OPTIONS`: `Sí`/`No`/`N/A` labels → `SI`/`NO`/`N/A` values), fed through
  `FieldConfig.options` — the same single-source role `MULTI_SELECT_LABELS` plays today.
  Visible label `Sí` (accented), wire value `SI`.
- Frontend types: `type SafetyReviewAnswer = 'SI' | 'NO' | 'N/A'`; Response, Request and
  form values move from `boolean | null` to `SafetyReviewAnswer | null`; zod becomes
  `z.enum(values).nullable()`, which keeps the field detected as required (asterisk shown,
  Q16) and keeps `isZodFieldRequired` working unchanged.
- Layout: `colSpan: 6` (two questions per row, six rows), `variant="outline"`,
  `size="sm"`, natural button width, required asterisk per field, Safety Review separator
  description kept. No un-set: once answered, a field is only re-assigned (Q10).
  `view`/`delete` modes render the group disabled.

**Pins and fixtures (Q12, Q24)**
- `scripts/capture-fixtures.py`, `scripts/master-parity-sweep.sh` and
  `scripts/observer-deactivation-check.sh` move to string literals; the fixtures seed uses
  at least one `"N/A"` so the new literal is pinned in the captured fixtures, and the
  parity sweep gains an invalid-value 400 check in the house `check()` style. MSW handlers
  serve the fixtures directly, so they follow the recapture for free. The Spanish
  visible-copy pin picks up the new message literal automatically (it scans all rule
  literals).

**Docs (Q13, Q27, Q30)**
- `GLOSSARY.md`: *Revisión de Seguridad* becomes a Sí/No/N/A checklist; new term
  **Respuesta de Revisión de Seguridad (Safety Review Answer)** with the key distinction
  **N/A ≠ sin respuesta**; the boolean *Inmediato* is removed — the field does not exist
  in code (the observation carries only the free-text *Acción Inmediata*); the
  "contrato en inglés" line is corrected (identifiers English, C# enums serialize as
  numbers, visible domain **values** — Combo Option labels, these answers — are Spanish).
- `docs/adr/0006-…`: tri-state answers serialized as Spanish strings, with the rejected
  alternatives (nullable bool, unvalidated string, enum-at-DTO) and the Combo Option
  precedent for Spanish domain values. Docs ship with ticket 01, the ticket that fixes the
  contract.

**Ship (Q15, Q26, Q32)**
- One integration branch `integration/safety-review-tristate`, two commits
  (ticket 01: backend + wire + migration + pins + glossary + ADR; ticket 02:
  `toggle-group` + form + fixtures + tests), one harness boot
  (`scripts/with-api.sh "$PWD/scripts/closeout-harness-pass.sh"`), merge into `master`,
  push `master` with the full suite, then delete the branch on `origin` and locally.
  Backend and UI cannot ship as separate green pushes: the frontend suite reads the wire.

## Testing Decisions

Good tests here assert **external behavior**: the payload that leaves the form, the message
the user sees, the value that comes back from the API. Not the internals of the enum, not
ToggleGroup's implementation, not private mapping helpers.

All five seams are pre-existing; the feature adds **no new seam**.

1. **Live API under the harness** — the only backend seam this repo has (no backend test
   project; `Genexus.slnx` holds one project). `scripts/master-parity-sweep.sh` pins:
   create/update accepted with `"SI"`/`"NO"`/`"N/A"`, the 400 Spanish copy for an out-of-set
   value, the untouched mandatory 400. Prior art: the existing `check()` status-code
   harness and python3 body asserts in that same script, and
   `scripts/observer-deactivation-check.sh`.
2. **Contract schemas + recaptured fixtures** (`frontend/src/test/contractSchemas.test.ts`,
   `frontend/src/test/fixtures/security-observation*.response.json`) — wire shape of the
   twelve nullable string answers. Prior art: the whole file; fixtures are recaptured via
   `scripts/capture-fixtures.py` and the recapture's timestamp-only diff is discarded
   (CODING_STANDARDS).
3. **Zod mirror** (`securityObservation.rules.test.ts`) — new invalid-value message,
   untouched mandatory message and its order, twelve `N/A` accepted. Prior art: the file's
   existing per-rule tests.
4. **Form integration** (`SecurityObservationForm.test.tsx`, GenericForm + MSW +
   `vi.mock`'d services) — choosing Sí/No/N/A and submitting yields a request whose twelve
   fields carry the literals; loading a record pre-presses the stored answers; `view` mode
   renders them disabled. Prior art: the file itself and its mock-spreading convention
   (CODING_STANDARDS "Forms tests mock services via `vi.mock`").
5. **Field test through GenericForm** (`FormToggleGroup.test.tsx`) — `null` renders nothing
   pressed, selection is single (one press replaces the previous), `disabled` in view mode,
   `onValueChange` fires. Prior art: `FormFileInput.test.tsx` and `FormMultiSelect.test.tsx`,
   which render the field through `GenericForm` + `FieldConfig` and never the raw component.

The full suite runs in **pre-push** (vitest serial by config); commits gate tsc + staged
lint. One harness boot per ticket-set, as prescribed in AGENTS.md.

## Out of Scope

- The Observers catalog's `active` checkbox (binary *Estado*, not a Safety Review answer).
- Any change to the observations grid, its filters, the Gridify config, the Excel export
  (the twelve fields appear in none of them) and the cascade rules of ADR-0002.
- Print styles for the pressed state: the repo has no print stylesheet and the reporting
  path is the Excel export.
- An "un-set" button, per-field option sets, and a per-field answer configuration UI.
- A backend test project (xunit) and any new test seam.
- i18n: none exists and none is added (ADR-0001, ADR-0005).
- Historical-data imports from the GeneXus legacy (`RenovaApp_All_2023_2.xml`); the
  migration only converts what the app already holds.

## Further Notes

- **Glossary conflict found during design**: `GLOSSARY.md` states the observation "contains
  exactly one boolean *Inmediato*" and describes it as complementing *Acción Inmediata*. No
  such field exists in code — the observation has `descripcionAC` (free text) only. Ticket
  01 removes the phantom term; if a real *Inmediato* flag is planned, it needs its own
  ticket, not a side effect of this one.
- This is the repo's first string-serialized enum. The glossary line that described
  serialized enums as English strings was checked against code and corrected in this
  ticket (observed fixture shape: `"post": 2`).
- Rule order is part of the contract: the invalid-value rule runs before the mandatory one,
  and the zod mirror keeps the same order (CODING_STANDARDS "Date windows"/"Rule messages"
  divergence is a finding).
- `scripts/spanish-visible-copy-check.sh` (ADR-0005 pin) scans every rule literal in
  `Common/MasterCrud/` and `Features/`, so the new Spanish message is pinned by the existing
  gate with no new script.
