# 02 — Cablear el pin de copia visible en CI

**Status:** resolved

`scripts/spanish-visible-copy-check.sh` (ticket 01) es un scan estático sin API, de la
misma familia que `scripts/module-purity-check.sh` — que es el único pin que corre en CI
(job `scripts` de `.github/workflows/ci.yml`) y por eso dispara en **cada push/PR**, no
solo en el closeout del harness. El pin de idioma debe correr en el mismo sitio: si un
push introduce copia visible en inglés, CI debe fallar aunque su autor no haya pasado
por el harness.

- Agregar `- run: scripts/spanish-visible-copy-check.sh` al job `scripts` de
  `.github/workflows/ci.yml`, junto a `module-purity-check.sh` (mismo cwd de repo-root;
  el script resuelve su ROOT desde su propia ubicación).
- Sin cambios de script: la base está verde y el script pasa `shellcheck` (gate
  preexistente del mismo job).
- Actualizar la bala de AGENTS.md que describe el job/pins si queda desactualizada.

Referencias: ticket 01 (`.scratch/spanish-copy-pin/issues/01-spanish-visible-copy-check.md`),
ADR-0005, CI job `scripts`.

## Comments

Resuelto: job `scripts` de `.github/workflows/ci.yml` corre ahora
`scripts/spanish-visible-copy-check.sh` como cuarto paso, junto a
`module-purity-check.sh` (mismo cwd de repo-root; el script resuelve su ROOT
desde su propia ubicación — verificado verde desde cwd ajeno). Sin cambios de
script: base verde y `shellcheck scripts/*.sh` (gate preexistente del job) ya
pasaba. AGENTS.md actualizado: el pin se describe cableado en
`closeout-harness-pass.sh` y en el job `scripts` de CI, como
`module-purity-check.sh`. Un push con copia visible en inglés falla CI
aunque su autor no pase por el harness.
