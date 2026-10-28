# 03: Contractor Companies migrates to a config

**What to build:** The Contractor Company screens (grid, create, edit, delete) run on a
config crossing the Master record module's interface. The module's clone files (service,
form wrapper, action cell, three views, re-export shim) are deleted. Consumers — route
files and the Security Observation form's optional Contractor Company dropdown — import
the produced `contractorCompanyService` from the config exports; import lines only. Smoke
test pins heading, columns, resource path, and default order. Spanish copy verbatim.

**Blocked by:** 01 (Sectors pilot)

**Status:** ready-for-agent

- [ ] Contractor Companies config per spec shape
- [ ] Clones and shim deleted; grid/create/edit/delete behave as before
- [ ] Smoke test green through the MSW seam
- [ ] Security Observation form's optional-Company dropdown behaves identically (leave-off allowed per GLOSSARY.md)
- [ ] Gates green: `tsc -b`, `eslint --max-warnings=0`, serial `vitest run`
