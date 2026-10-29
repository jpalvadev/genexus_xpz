# 05: Migrate Combo Options behind MasterCrud

**What to build:** Combo Options — the spec's single real variant — served by the module
behind the unchanged `IComboOptionService`, proving the adapter language is complete
without per-entity `if`s in the module body. The adapter contributes: entity set;
flat-catalogue order (comboKey → order → id) for the plain GET; the comboKey-scoped
lookup feed; Id+ComboKey+Label+Order projection; blank ComboKey and blank Label
validation copies; conflict copy ("Combo option is referenced by security observations
and cannot be deleted"). Its controller keeps the two list endpoints (flat GET, GET by
comboKey) alongside the shared base's actions, with the int-constrained id route
preserved. The clone service body is deleted.

**Blocked by:** 01 (flat-order and lookup pins), 02 (module + shared controller base).

**Status:** resolved

- [x] `IComboOptionService` signature, DI registration, routes, status codes, and bodies unchanged
- [x] Combo-parity-check (flat GET, comboKey lookup, order pin, get-by-id, create, update, delete, 404/400/409 pins) green under `scripts/with-api.sh`
- [x] All combo quirks expressed as adapter config; module body stays free of combo-specific branches
- [x] Clone service body deleted; MSW fixtures re-captured byte-identical; frontend suites green with zero frontend changes

## Answer

Combo Options crosses the unchanged `IComboOptionService` seam onto `MasterCrud`;
every quirk is adapter config: `FlatOrder` = ComboKey→Order→Id, `KeyFeed` =
comboKey-equality + Order→Id, Id+ComboKey+Label+Order projection, "ComboKey is
required" / "Label is required", the conflict copy. Controller keeps its two list
endpoints (flat GET, GET {comboKey}) beside the shared base's four verbs, with the
int-constrained id route preserved (wins over {comboKey} on numeric segments).
Combo-parity-check green under the harness (flat order, scoped lookup, order→id,
404/400 copies, create/update/delete).

Note on the 409 pin: no FK references Combo Option today (SOs store multi-select
labels as JSON, per ADR-0002's schema), so a delete cannot raise the conflict on
the live wire; the copy is carried verbatim by the adapter and the module's
`DbUpdateException`→409 translation is proven live on the three FK-referenced
masters. 201 `Location` verified identical in shape; full-scope A/B fixture
capture byte-identical (incl. all three combo fixtures); vitest green, zero
frontend changes.
