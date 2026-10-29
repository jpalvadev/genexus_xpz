# 07: Integrate and verify — five catalogs, one interface, zero clones

**What to build:** Everything lands green together. All five Master record catalogs
(Observer, Plant, Sector, Contractor Company, Combo Option) run on configs crossing one
interface; every clone view, hand-rolled master form, master service file, and re-export
shim in the frontend is gone; the Security Observation form's feeds (Observer picker,
Plant/Sector/Company dropdowns, four combo feeds) work untouched. A residual check
confirms no clone file survives anywhere. Full gates run serially: `vitest run`,
`tsc -b`, `eslint --max-warnings=0`. A live-API parity sweep via `scripts/with-api.sh`
exercises each catalog's grid paging, sorting, filtering, create, edit, and delete against
the shipped backend, confirming behavior parity — Spanish copy verbatim.

**Blocked by:** 02, 03, 04, 05, 06

**Status:** resolved

- [x] Residual check: zero clone views, master form wrappers, master service files, shims
- [x] Full serial `vitest run` + `tsc -b` + `eslint --max-warnings=0` green
- [x] Live-API parity sweep green for all five catalogs
- [x] Security Observation form regression green (its existing form + rules tests pass unmodified in behavior)
