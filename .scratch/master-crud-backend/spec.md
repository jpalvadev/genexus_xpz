Status: ready-for-agent

# MasterCrud — deepen the backend master-data services

The backend mirror of the Master record module (ADR-0003, ticket `.scratch/master-record-module/`
— done). One deep **MasterCrud** module behind a per-entity adapter replaces the four
byte-identical service/controller clones for Sector, Plant, Contractor Company, and Combo
Option. Domain language: `GLOSSARY.md` ("Master record"); architecture vocabulary:
module / interface / depth / seam / adapter / leverage / locality.

## Problem Statement

Four backend master-data features — Sectors, Plants, ContractorCompanies, ComboOptions —
are copy-pasted quadruplets: a 6-method interface, a ~71-line service that is pure EF
passthrough (paging clamp, Gridify filter/order, count, skip/take, NotFound handling,
FK-conflict translation), and a ~50-line controller, ≈145 lines per catalog modulo names.
`diff` of Sectors vs Plants is empty after name normalization; ContractorCompanies differs
only in entity names. A paging-order fix must be made four times and verified four times;
bugs hide in the drift between copies. A new master catalog means writing a fifth clone.

## Solution

One deep module — `MasterCrud<TEntity, TResponse>` — implementing the CRUD semantics once,
with **one small adapter per entity** supplying only what differs (entity set, default
order, response projection, validation rules, conflict copy; Combo Option adds its flat
catalogue order and comboKey lookup). The public service interfaces, controllers' wire
behavior, and DI registrations are **unchanged**: the 6-method interface stays the seam,
and each catalog crosses it with the same requests and responses as today. A new master
catalog is one adapter, not one clone. Observers stays its own module — its rules (legajo
uniqueness, plants feed, deactivation) are real depth, not passthrough.

## User Stories

1. As a developer fixing CRUD semantics (paging clamp, ordering, NotFound handling), I want the fix to land in one MasterCrud module, so that all four catalogs get it in the same commit.
2. As a developer adding a new master catalog, I want to declare one adapter (entity set, order, projection, validation, conflict copy), so that I never copy a 145-line trio again.
3. As a developer reviewing a backend PR, I want CRUD semantics to appear once, so that I can audit the shared behavior in one read.
4. As a developer hunting a wire bug (ordering, page clamp, 404/400/409 copy), I want one place where those semantics live, so that bugs concentrate where I can fix them once.
5. As a developer, I want each catalog's quirks declared as adapter config — Combo Option's `ComboKey→Order→Id` order and comboKey lookup included, so that the module has no per-entity special cases in its body.
6. As a developer, I want the existing interfaces (`ISectorService`, `IPlantService`, `IContractorCompanyService`, `IComboOptionService`) kept exactly as-is, so that DI registrations, controllers, and every caller stay untouched.
7. As a developer, I want the delete-conflict copy ("X is referenced by security observations and cannot be deleted") supplied verbatim by the adapter, so that the wire responses stay byte-identical.
8. As a developer, I want the validation copy ("Name is required", "ComboKey is required", "Label is required") carried by the adapter's validation rules, so that 400 bodies stay byte-identical.
9. As a developer, I want the four controllers folded into a shared base implementing the six actions, so that per-catalog controller code shrinks to route + typed binding with identical status codes, envelopes, and `CreatedAtAction` locations.
10. As a developer, I want Combo Options' two list endpoints (flat GET, GET by comboKey) to ride the same module as adapter extras, so that its controller keeps its shape and the wire stays identical.
11. As a developer, I want the Observers module untouched, so that its real depth (legajo uniqueness, Observer–Plant feed, ADR-0002 deactivation rule) is not diluted by a CRUD factory.
12. As a tester, I want MasterCrud behavior pinned through the live-API seam, so that tests assert what the wire says, not how the generic is written.
13. As a tester, I want the shared semantics (404 copy, 400 validation, 409 FK conflict, default order) pinned once per catalog in the parity sweeps, so that the quadruple-verification burden becomes one sweep per catalog.
14. As a tester, I want Combo Option's flat catalogue order pinned in its sweep, so that the adapter's ordering quirk is verified against reality, not MSW alone.
15. As a maintainer, I want the migration to be behavior-preserving — verbatim copy strings, same wire contracts — so that any fixture diff is a real bug.
16. As a maintainer, I want the MSW fixtures to re-capture byte-identical after the move, so that the frontend suite proves the backend did not change.
17. As a SHYMA user, I want every master-data endpoint to keep behaving exactly as today (paging, sorting, filters, deletes, error messages), so that the frontend Master record module I use daily is unaffected.
18. As a SHYMA user, I want deleting a referenced Sector/Plant/Company/Combo Option to keep returning 409 with the same message, so that my data stays protected.
19. As a release gate, I want each migrated catalog verified against the live-API harness, so that the module's wire behavior matches the backend as shipped.
20. As a future agent, I want `CODING_STANDARDS.md` to say "a backend master catalog is a MasterCrud adapter, not a clone", so that I build it that way first time.
21. As a future agent, I want an ADR recording the backend mirror of ADR-0003 — including the deliberate exclusions (Observers, Persons, EquipmentItems) — so that I don't re-suggest folding them.
22. As a maintainer, I want the Sectors pilot to land first and each catalog in its own PR, so that each step is independently verified against the live API.

## Implementation Decisions

- **New module**: a deep backend module named **MasterCrud** (`MasterCrud<TEntity, TResponse>`
  per the architecture review), sited outside the per-catalog feature folders (it is not a
  catalog itself) in the backend's shared area.
- **What the module owns (the CRUD semantics, implemented once)**: page/size clamping
  (`Page < 1 → 1`, `PageSize < 1 → 20`); Gridify `ApplyFiltering` / `ApplyOrdering` with the
  adapter's default order; count + skip/take paging into the `{count, data}` envelope;
  as-no-tracking reads / tracked writes; NotFound contract (GetById → 404, Update → 404,
  Delete → 404); `DbUpdateException` → 409 with the adapter's copy; validation hook → 400;
  Create → 201 `CreatedAtAction` shape. These are today's semantics, verbatim — no behavior
  redesign rides this ticket.
- **What an adapter supplies (the per-entity delta)**: the entity set; default order
  (`name asc` for Sectors/Plants/Companies); response projection (Id + Name; Combo Option
  adds ComboKey/Label/Order); validation rules; conflict copy. Combo Option's adapter
  additionally carries the flat-catalogue order (`ComboKey → Order → Id`), the
  comboKey-scoped lookup, and its two-field validation. **No per-entity `if` inside the
  module** — the same rule ADR-0003 set on the frontend factory.
- **Interface unchanged (hard constraint)**: `ISectorService`, `IPlantService`,
  `IContractorCompanyService`, `IComboOptionService` keep their exact current signatures;
  DI registrations in the composition root stay per-interface. Each per-catalog service
  class remains as a thin adapter class implementing its existing interface against the
  module. The 6-method interface stays the seam; only what is behind it deepens.
- **Controllers fold**: the six CRUD actions move to a shared controller base; each
  catalog's controller keeps only its route and typed service binding (Sectors, Plants,
  ContractorCompanies are byte-identical modulo names today). Combo Options keeps its two
  list endpoints (`GET` flat, `GET {comboKey}`) as extras riding the base, with the
  `int`-constrained id route preserved. Status codes, bodies, `Location` headers, and 404
  `ErrorResponse` copy stay byte-identical.
- **Wire contract unchanged (hard constraint)**: same routes, verbs, envelopes, paging
  semantics, Spanish/English copy, status codes. No DB schema change, no migration, no
  frontend change, no MSW handler change.
- **Exclusions**: Observers stays hand-rolled (legajo uniqueness, Observer–Plant feed,
  ADR-0002 deactivation rule — real depth, pinned by its own live check script). Persons
  and EquipmentItems, shallow as they are, feed the hand-rolled Equipment Maintenance
  wiring and are not Master records; they stay out of this ticket (noted in the ADR as
  deliberate, foldable later if ever desired).
- **Migration**: behavior-preserving, one catalog per PR, Sectors pilot first; each PR
  verified against the live-API harness (`scripts/with-api.sh` + parity sweeps). Copy
  strings move into adapters verbatim.
- **Docs side effects, in the pilot PR**: record **ADR-0004** — backend master-data CRUD
  is a MasterCrud adapter, the backend mirror of ADR-0003, with the deliberate exclusions
  (Observers, Persons, EquipmentItems, Equipment Maintenance, Security Observations);
  update the new-module guidance in `CODING_STANDARDS.md` ("a backend master catalog is an
  adapter, not a clone"). No glossary change — "Master record" already names this shape.

## Testing Decisions

- **One seam, existing, highest**: the **live-API HTTP seam** — `scripts/with-api.sh`
  running the real backend. Good tests assert wire behavior only: status codes, envelope
  shape, default ordering, 404/400/409 bodies. The generic's internals are never
  unit-tested; the adapter is tested only through the unchanged interface's wire.
- **Sweeps are the suite**: `scripts/master-parity-sweep.sh` already exercises the gridify
  masters (list, flat feed, get-by-id, create 201, update 204, delete 204) — extended once
  in the pilot to pin the shared semantics per catalog: 404 copy on missing get-by-id,
  400 validation copy on create, 409 FK-conflict copy on deleting a referenced record.
  `scripts/combo-parity-check.sh` pins the flat catalogue wire; extended to pin the
  `ComboKey → Order → Id` ordering and comboKey lookup.
- **Behavior-preservation proof**: `scripts/capture-fixtures.py` must re-capture MSW
  fixtures **byte-identical** after the move, and the frontend suites (the Master record
  module's deep suite, the per-catalog smokes, the Security Observation form) must stay
  green **unchanged** — identical fixtures crossing the same seam is the parity proof.
- **No new seam**: no backend xUnit project, no in-process service tests — repo
  convention is live-API pin scripts. Prior art: `master-parity-sweep.sh`,
  `combo-parity-check.sh`, `observer-deactivation-check.sh` (the pattern for pinning a
  rule live).
- **Gates**: `dotnet build` + harness scripts per PR; the usual frontend gates (tsc,
  staged lint, serial vitest in pre-push) run as always and must stay green untouched.

## Out of Scope

- Observers, Persons, EquipmentItems (deliberate exclusions, ADR-0004).
- Equipment Maintenance and Security Observations modules (hand-rolled per ADR-0001/ADR-0003).
- Any frontend change — the Master record module (item 1) is done; this ticket must not
  touch it, its configs, its tests, or MSW handlers.
- Safety Review rules mirrored in two languages (Candidate 4) and Gridify-syntax leakage
  (Candidate 6).
- Dead-code deletion (legacy query extensions / re-export shims — Candidate 3 territory,
  its own ticket).
- New catalogs, schema changes, auth, API versioning, pagination redesign (the clamping
  semantics are carried verbatim, not improved).

## Further Notes

This is candidate 2 of the architecture review (`docs/architecture-review-20261028.html`),
listed as the natural follow-up of candidate 1 — whose spec
(`.scratch/master-record-module/spec.md`) declares it out of scope. The review's own
constraint — "interface unchanged — tests keep crossing the same seam" — is the spec's
hard constraint. The review's "≈145 lines × 4, byte-identical modulo names" was verified
2026-10-29: Sectors ≡ Plants diff-clean, ContractorCompanies name-only, Combo Options the
single real variant. Seams (live-API sweeps + MSW fixture net, no new seam) and scope
(the four Master records) confirmed with the maintainer the same day. After this lands,
backend master data is exactly as deep as the frontend factory and the MSW harness already
are: four configs, one implementation.
