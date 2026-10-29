# 02: Plants migrates to a config

**What to build:** The Plants screens (grid, create, edit, delete) run on a Plants config
crossing the Master record module's interface. Plants' clone files (service, form wrapper,
action cell, three views, re-export shim) are deleted. Consumers — route files and the
Security Observation form's Plant dropdown — import the produced `plantService` from the
config exports; import lines only. Smoke test pins heading, columns, resource path
(`plants`), and default order. Spanish copy verbatim.

**Blocked by:** 01 (Sectors pilot — the factory and its test suite must exist)

**Status:** resolved

- [x] Plants config declares resource, nameField, listOrder, labels, columns, schema, fields, initialValues
- [x] Plants clones and shim deleted; grid/create/edit/delete behave as before
- [x] Plants smoke test green through the MSW seam
- [x] Security Observation form's Plant feed unchanged in behavior; only import lines moved
- [x] Gates green: `tsc -b`, `eslint --max-warnings=0`, serial `vitest run`
