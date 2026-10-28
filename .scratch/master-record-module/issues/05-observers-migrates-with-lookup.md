# 05: Observers migrates, lookup through the extension point

**What to build:** The Observer screens (grid, create, edit, delete) run on a config with
`nameField: 'fullName'` and `listOrder: 'fullName asc'`; the delete dialog names the
Observer by full name. The picker feed `lookup` (active-only filter, fullName contains
search, paging) composes through the config's `extraService` extension point, and the
Security Observation form's Observer MultiSelect keeps its search/paging behavior
unchanged, import lines only. Observers clones and shim deleted. Smoke test pins heading,
columns, resource path, and default order. Spanish copy verbatim. Deactivating an Observer
must keep hiding it from the picker while leaving Observations that name it intact
(GLOSSARY.md, ADR-0002).

**Blocked by:** 01 (Sectors pilot)

**Status:** ready-for-agent

- [ ] Observers config: nameField fullName, listOrder fullName asc, labels verbatim
- [ ] `extraService` composes `lookup`; Security Observation picker search/paging/active-only unchanged
- [ ] Clones and shim deleted; smoke test green through the MSW seam
- [ ] Gates green: `tsc -b`, `eslint --max-warnings=0`, serial `vitest run`
