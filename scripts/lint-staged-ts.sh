#!/usr/bin/env bash
# Lint the TS/TSX files staged in the current commit. The repo's legacy lint
# baseline is red, so lint is scoped to what the commit touches — the same
# scoping the pre-commit hook uses. Call this (never a bare `npx eslint`) for
# ad-hoc lint runs: a bare invocation lints the whole project and floods.
set -u
root="$(git rev-parse --show-toplevel)"
files=$(git -C "$root" diff --cached --name-only --diff-filter=ACM -- 'frontend/**/*.ts' 'frontend/**/*.tsx' | sed "s|^frontend/||")
[ -z "$files" ] && exit 0
cd "$root/frontend" || exit 1
# shellcheck disable=SC2086
npx eslint --max-warnings=0 --no-warn-ignored $files || { echo "lint-staged-ts: eslint failed (staged files)"; exit 1; }
