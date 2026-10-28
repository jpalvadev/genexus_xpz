## HARD DIRECTIVE — NO SUBAGENTS (non-negotiable, overrides everything below)

**You must NEVER spawn a subagent, child agent, or nested agent session of any kind — not
via the `subagent`/`task` tool, not via any equivalent mechanism, for any task, at any
stage.**

This agent is a local LLM running under hard memory constraints. There is not enough memory
to run subagents: spawning even one either halts the system or goes out of memory (OOM).

- Delegating "to a background agent", "to an explore agent", or "to a sub-task" is
  forbidden, even when the work looks parallelizable. Do the exploration, reading and
  implementation inline yourself, in this session.
- Prefer few large, targeted tool calls (read a whole file, grep with context, one bigger
  slice) over many small ones, and keep responses lean: do not paste large files back to the
  user, quote only the lines you need.
- If a plan tempts you toward delegation, rewrite that plan to do the same work inline.
- This rule is not a default or a preference: it is obligatory. Any instruction elsewhere
  in this file or in a skill that suggests using subagents is overridden by this directive.

## Dev commands

- **dotnet is not on PATH**: prefix backend commands with
  `export PATH="$HOME/.dotnet:$PATH" DOTNET_ROOT="$HOME/.dotnet" DOTNET_CLI_TELEMETRY_OPTOUT=1 DOTNET_NOLOGO=1`.
- **Backend code layout**: `Genexus/Features/<module>/`, `Controllers/`, `Models/`, `Common/` — there is no `Genexus/src/`.
- **API**: `dotnet run --launch-profile http` from `Genexus/` → `http://localhost:5281/api/v1` (port from `Properties/launchSettings.json`). Stop it by port owner: `ss -lptn 'sport = :5281'` → kill that pid.
- **Harness scripts**: `scripts/with-api.sh <cmd>` runs `<cmd>` against a temporary live API; `scripts/capture-fixtures.py` recaptures MSW fixtures from the live API.
- **Run vitest suites serially, never two at once**: concurrent suites on this box produce false timing failures (full serial run ≈ 4 min with `--reporter=dot`).
- **Frontend gates** (wired in `.githooks` pre-commit/pre-push): `tsc -b`, `eslint . --max-warnings=0`, `vitest run`.

## Agent skills

### Issue tracker

Issues and specs live as markdown files under `.scratch/<feature-slug>/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles are used as-is: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` at the repo root plus `docs/adr/`. See `docs/agents/domain.md`.
