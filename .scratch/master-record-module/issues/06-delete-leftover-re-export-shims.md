# 06: Delete the leftover re-export shims

**What to build:** The three one-line re-export shims outside the Master record module's
scope — Security Observations, Persons, Equipment Items — are deleted. Their consumers
(routes, forms, tests) import the real implementation modules directly. An import now
leads straight to an implementation in every module. No behavior changes; no other file
is touched. (The five master catalogs' shims die with their migrations, tickets
02–05.)

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Three shim files deleted; every consumer import points at the real service module
- [ ] No behavior changes; gates green: `tsc -b`, `eslint --max-warnings=0`, serial `vitest run`
