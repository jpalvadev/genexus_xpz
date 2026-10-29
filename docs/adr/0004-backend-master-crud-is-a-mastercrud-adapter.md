# Backend master CRUD is a MasterCrud adapter, not a clone

The backend mirror of ADR-0003. Behind the four Master record services (Sectors, Plants,
Contractor Companies, Combo Options) sat copy-pasted quadruplets: a 6-method interface, a
~71-line service of pure EF passthrough (paging clamp, gridify filter/order, count +
skip/take, NotFound contract, FK-conflict translation) and a ~50-line controller — ≈145
lines per catalog, byte-identical modulo names (verified 2026-10-29: Sectors ≡ Plants
diff-clean, ContractorCompanies name-only, Combo Options the single real variant). Every
CRUD-semantics fix had to be made and verified four times.

**Decision**: one deep module — `MasterCrud<TEntity, TRequest, TResponse>`
(`Genexus/Common/MasterCrud/`, sited outside the per-catalog feature folders: it is not
a catalog) — implements the shared CRUD semantics once; each catalog contributes only its
delta through a config-scale `MasterCrudConfig` (entity set, default order, response
projection, request↔entity mapping, validation copy, conflict copy; Combo Options also
carries its flat-catalogue order and comboKey-scoped feed as adapter extras). The module
body contains no per-entity `if` — the same rule ADR-0003 set on the frontend factory.
The 6-method service interfaces (`ISectorService`, `IPlantService`,
`IContractorCompanyService`, `IComboOptionService`), their DI registrations and the wire
contract are **unchanged**: each per-catalog service class stays as a thin adapter class
crossing the same seam, and the controllers fold into `MasterCrudControllerBase`, keeping
only route + typed binding with byte-identical status codes, copy strings, envelopes and
`CreatedAtAction` locations.

**Deliberate exclusions**: **Observers** stays hand-rolled — its rules are real depth,
not passthrough (legajo uniqueness, the Observer–plants feed, the ADR-0002 deactivation
rule, pinned live by `scripts/observer-deactivation-check.sh`). **Persons** and
**EquipmentItems** are shallow CRUD, feed the hand-rolled Equipment Maintenance wiring,
and are not Master records; they stay out (foldable later if ever desired, at the cost
of crossing the adapter language for non-catalogs). **Equipment Maintenance** and
**Security Observations** keep their hand-rolled modules per ADR-0001/ADR-0003 — their
wires are not CRUD-only.

**Consequences**: a CRUD-semantics fix lands once for all four catalogs; a new master
catalog is one adapter, not a clone; the quadruple-verification burden collapses into
one sweep per catalog, pinned through the live-API seam (`scripts/master-parity-sweep.sh`
and `scripts/combo-parity-check.sh` pin the 404/400/409 copy, default and flat order,
and comboKey lookup per the ticket-01 contract). Behavior preservation is proven by
`scripts/capture-fixtures.py` re-capturing MSW fixtures byte-identical with zero
frontend changes. Backend master data is now exactly as deep as the frontend factory:
four configs, one implementation.
