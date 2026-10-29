## HARD DIRECTIVE — NO SUBAGENTS (non-negotiable, overrides everything below)

This box runs a local LLM under hard memory constraints: spawning a subagent halts the
system or OOMs it. **Do all exploration, reading and implementation inline, in this
session** — the `subagent`/`task` tool and every equivalent delegation mechanism
(background agents, explore agents, sub-tasks) stay unused, for any task, at any stage,
even when the work looks parallelizable. Rewrite any plan that tempts you toward
delegation. This overrides any skill instruction that suggests subagents.

- Prefer few large, targeted tool calls (read a whole file, grep with context, one bigger
  slice) over many small ones, and keep responses lean: do not paste large files back to the
  user, quote only the lines you need.

## Dev commands

- **dotnet is not on PATH**: prefix backend commands with
  `export PATH="$HOME/.dotnet:$PATH" DOTNET_ROOT="$HOME/.dotnet" DOTNET_CLI_TELEMETRY_OPTOUT=1 DOTNET_NOLOGO=1`.
- **Backend code layout**: `Genexus/Features/<module>/`, `Controllers/`, `Models/`, `Common/` — there is no `Genexus/src/`.
- **API**: `dotnet run --launch-profile http` from `Genexus/` → `http://localhost:5281/api/v1` (port from `Properties/launchSettings.json`). Stop it by port owner: `ss -lptn 'sport = :5281'` → kill that pid.
- **Harness scripts**: `scripts/with-api.sh <cmd>` runs `<cmd>` against a temporary live API on a **freshly seeded DB** (it deletes `itrion.db*` at start — no manual rm ritual); `scripts/capture-fixtures.py` recaptures MSW fixtures from the live API; backend master-catalog files (`Genexus/Features/{Sectors,Plants,ContractorCompanies,ComboOptions}/`, `Genexus/Common/MasterCrud/`) are gated by `scripts/master-parity-sweep.sh` (+ `scripts/combo-parity-check.sh`) run under the harness; `scripts/observer-deactivation-check.sh` pins the Observer-deactivation rule (GLOSSARY "Active", ADR-0002) live — the data half the observers smoke test can't reach.
- **vitest runs serially by config** (`pool: 'forks'` + `singleFork` in `vitest.config.ts`): a plain `npx vitest run` is already serial — never run two suites at once on this box. Legacy component/hook suites keep per-file `isolate: true`; the Master record integration suites (deep suite, catalog smokes, Security Observation form) run `isolate: false` in a `shared` project. Full run ≈ 2 min with `--reporter=dot` — pre-commit gates tsc + staged lint only, the suite runs in **pre-push**: commit freely, let the push run the suite, and give push tool-calls ≥5 min.
- **Frontend gates** (wired in `.githooks` pre-commit/pre-push): `tsc -b`, `eslint --max-warnings=0` on staged TS files, `vitest run`. Ad-hoc lint of staged files: `scripts/lint-staged-ts.sh` — never a bare `npx eslint` (the legacy baseline is red and floods).
- **New reference catalog** → factory in `frontend/src/master-records/`, pattern in ADR-0003 (`docs/adr/`); a catalog is a config file, never a clone.

## Ship work

When the tickets in scope are resolved, always finish the job: commit each ticket
(gates green, hooks on), merge the integration branch into `master`, and push both
`master` and the integration branch to `origin` (GitHub). Don't stop at a green
local commit — the work isn't done until it's on GitHub.

## Agent skills

### Issue tracker

Issues and specs live as markdown files under `.scratch/<feature-slug>/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles are used as-is: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` at the repo root plus `docs/adr/`. See `docs/agents/domain.md`.
