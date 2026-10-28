# Single-tenant local MVP: repair the Itrion.Api skeleton in place

The backend and frontend in this repo are partial copies of a multi-tenant, authenticated
SaaS app ("Itrion.Api"). For the SHYMA security-observations MVP we repaired the skeleton
in place — building the missing `ItrionDbContext`, models and stubs — and kept the
EquipmentMaintenances reference module fully alive, rather than stripping to a
SHYMA-only app or rewriting from scratch, because that module is the structural contract
every new module copies (see GLOSSARY.md). Auth and tenancy were then **deleted
everywhere** (JWT interceptors, `Authorized`, permission hooks, `[RequirePermission]`,
tenant headers) rather than stubbed: the MVP is a single-user local app, and a permissive
auth stub would be code a future reader must audit to discover it does nothing.
