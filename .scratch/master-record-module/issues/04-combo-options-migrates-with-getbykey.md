# 04: Combo Options migrates, getByKey through the extension point

**What to build:** The Combo Option screens (grid, create, edit, delete) run on a config
whose quirks — `comboKey` as a select fed from the static combo-keys list and numeric
`order` — are expressed purely in the `FieldConfig` language, with no factory special
cases. `getByKey` composes through the config's `extraService` extension point; the
factory's interface stays CRUD-only. The Security Observation form's four multi-select
feeds (Risk Management, Fatal-Risk Protocols, Classification, Relation) keep working
across the seam, import lines only. Combo Options clones and shim deleted. Smoke test
pins heading, columns, resource path, and default order. Spanish copy verbatim.

**Blocked by:** 01 (Sectors pilot)

**Status:** ready-for-agent

- [ ] Combo Option config with comboKey select + numeric order expressed in FieldConfig only
- [ ] `extraService` composes `getByKey`; no lookup method added to the factory interface
- [ ] Security Observation multi-select feeds unchanged in behavior; import lines only
- [ ] Clones and shim deleted; smoke test green through the MSW seam
- [ ] Gates green: `tsc -b`, `eslint --max-warnings=0`, serial `vitest run`
