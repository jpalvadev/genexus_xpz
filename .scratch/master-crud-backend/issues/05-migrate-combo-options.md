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

**Status:** ready-for-agent

- [ ] `IComboOptionService` signature, DI registration, routes, status codes, and bodies unchanged
- [ ] Combo-parity-check (flat GET, comboKey lookup, order pin, get-by-id, create, update, delete, 404/400/409 pins) green under `scripts/with-api.sh`
- [ ] All combo quirks expressed as adapter config; module body stays free of combo-specific branches
- [ ] Clone service body deleted; MSW fixtures re-captured byte-identical; frontend suites green with zero frontend changes
