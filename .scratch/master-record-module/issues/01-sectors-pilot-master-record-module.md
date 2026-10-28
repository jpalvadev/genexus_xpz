# 01: Sectors pilot — the Master record module is born serving Sectors

**What to build:** The Sectors screens (grid, create, edit, delete) run entirely on
`createMasterRecordModule`: the factory is built to serve one config and produces
`{ service, TablePage, ActionCell, CreatePage, UpdatePage, Form }`. Sectors' clone files
(service, form wrapper, action cell, three views, re-export shim) are deleted; route files
and the Security Observation form import the produced service under the same
`sectorService` name, import lines only. Spanish copy moves into the config's structured
labels verbatim. Behavior is parity-preserved against the live API.

The factory's deep test suite lands with it, crossing the existing MSW/HTTP seam at the
produced interface: CRUD round-trip (create 201 → toast → grid refresh, update, delete
dialog naming the record via `nameField`, paging/sort/filter-reset wiring).

Docs land in this PR: **Master record** added to `GLOSSARY.md` (_Avoid_: master data,
catalog, reference data, lookup table); CODING_STANDARDS new-module guidance ("a reference
catalog is a config"); **ADR-0003** — ADR-0001's structural contract for reference
catalogs is the Master record module's config interface; Equipment Maintenance and
Security Observations stay hand-rolled.

Spec: `.scratch/master-record-module/spec.md` (config shape inlined there from the
grilling prototype).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `createMasterRecordModule` exists outside the per-feature module tree, config interface per spec
- [ ] Sectors grid, create, edit, delete work through the produced module; sectors clones and shim deleted
- [ ] Factory deep test suite green against the MSW seam (render pages, exercise CRUD, delete dialog names the record)
- [ ] Sectors smoke test pins heading, columns, resource path, default order
- [ ] Consumer imports (routes, Security Observation form) changed import lines only; export name `sectorService` unchanged
- [ ] Spanish copy verbatim — parity diff shows no copy changes
- [ ] Glossary term, CODING_STANDARDS guidance, and ADR-0003 landed
- [ ] `tsc -b`, `eslint --max-warnings=0`, serial `vitest run` green; live-API parity via `scripts/with-api.sh`
