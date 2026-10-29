#!/usr/bin/env bash
# Regression pin for CODING_STANDARDS.md "Rule messages are Spanish end to end"
# (ADR-0005): visible copy — strings that reach the UI verbatim — is Spanish.
#
# Swept surface (the message strings of the master-catalog contract):
#   - the MasterCrud adapter copies in Features services: Validation (400 body),
#     ConflictMessage (409 body) and the controllers' NotFoundMessage (404 body);
#   - every new ValidationException("…") / ConflictException("…") /
#     ErrorResponse("…") literal in Features (400/409/404 bodies);
#   - the rule validators: literals returned by methods typed string / Task<string?>
#     (SecurityObservationRules.FirstViolation, SecurityObservationService
#     .ValidateReferencesAsync, …) — they travel verbatim in the 400 body.
#
# Discriminator mechanism: an allowlist of the copy contexts above selects WHICH
# literals are judged; the English-word marker list then judges the language of
# those literals only. Developer-facing copy stays English by construction —
# InvalidOperationException guards, logs, Gridify order strings ("name asc"),
# enum/JSON contract names are never captured, so they never hit the marker list
# (fewest false positives; a plain English blacklist over all literals would
# flag every guard and contract string).
#
# Coverage guards (completeness): every "Validation =" region, ConflictMessage,
# NotFoundMessage and validator signature found in the swept files must parse
# into captured copy — an unparsable/new shape exits ≠0 so the check is widened
# deliberately, never silently. A self-test (fixtures: canonical Spanish copy,
# canonical English copy, English guards) pins the discriminator itself: the
# green baseline is proven non-vacuous on every run.
#
# Run under the harness (also wired into scripts/closeout-harness-pass.sh):
#   scripts/with-api.sh "$PWD/scripts/spanish-visible-copy-check.sh"   (from repo root)
# The check is a static source scan: it runs inside the harness boot with the
# pin scripts; no API calls. Exit 0 = baseline Spanish, 1 = visible English copy
# (or a coverage gap).
set -u
ROOT="${1:-$(cd "$(dirname "$0")/.." && pwd)}"

python3 - "$ROOT" <<'PY'
import os, re, sys

ROOT = sys.argv[1]
SCAN_DIRS = [os.path.join(ROOT, "Genexus", "Features"),
             os.path.join(ROOT, "Genexus", "Common", "MasterCrud")]

# C# string literal (plain, interpolated, verbatim); group "s" is the content.
LIT = r'(?P<q>\$@|@\$|\$)?"(?P<s>(?:[^"\\]|\\.)*)"'

# Allowlisted visible-copy contexts (see header).
VALIDATION_RE = re.compile(r'Validation\s*=(?:.|\n)*?\bnull\b,')
VALIDATION_HEAD_RE = re.compile(r'Validation\s*=')
CONFLICT_RE = re.compile(r'ConflictMessage\s*=\s*' + LIT)
CONFLICT_HEAD_RE = re.compile(r'ConflictMessage\s*=')
NOTFOUND_RE = re.compile(r'NotFoundMessage\s*=>\s*' + LIT)
NOTFOUND_HEAD_RE = re.compile(r'NotFoundMessage\s*=>')
EXC_RE = re.compile(r'new (?:ValidationException|ConflictException|ErrorResponse)\s*\(\s*' + LIT)
# Validators: methods typed string / Task<string?>. Expression bodies count only
# when the expression IS a literal (=> throw new InvalidOperationException(...) is
# developer-facing: never captured). Block bodies capture `return "…"` literals.
SIG_RE = re.compile(r'(?m)^[ \t]*(?:(?:public|private|protected|internal|static|async|virtual|override|sealed|partial)\s+)*'
                    r'(?:Task<\s*string\s*\??>|string\s*\??)\s+\w+\s*\([^)]*\)\s*(?P<tail>=>|\{)')
EXPR_LIT_RE = re.compile(r'=>\s*' + LIT)
RETURN_LIT_RE = re.compile(r'\breturn\s+' + LIT)

# English markers (case-insensitive, word-bounded — "Name Required", "Plant Not
# Found" and lowercase copy all hit). Canonical Spanish copy contains none of
# them; loanwords fixed by the GLOSSARY ("label", "combo") are not markers.
MARKERS = ["is","are","was","were","be","been","being","do","does","did","have","has","had",
           "must","cannot","can't","not","the","this","that","these","those","with","from",
           "for","and","as","at","on","in","by","of","to","it","its","their","your","our",
           "we","you","they","them","name","item","field","value","record","user","data",
           "request","response","endpoint","catalog","declares","exposes","required",
           "mandatory","already","exists","found","referenced","invalid","missing",
           "provided","duplicate","deleted","remove","create","update","delete","use",
           "used","within","between","feed"]
MARKER_RE = re.compile(r"(?<![A-Za-z])(?:" + "|".join(MARKERS) + r")(?![A-Za-z])", re.IGNORECASE)

def markers_in(literal):
    # Interpolation holes ({min:dd/MM/yyyy}) are code, not copy: stripped, so
    # format specs never hit the markers. Plain literals have no holes, so a
    # "Format"/"+" composed English copy (markers outside the holes) is judged
    # whole and flagged — visible copy must be a Spanish literal.
    if re.search(r'\{[^{}]*\}', literal):
        literal = re.sub(r'\{[^{}]*\}', ' ', literal)
    return MARKER_RE.findall(literal)

def line_of(src, pos):
    return src.count("\n", 0, pos) + 1

def body_end(src, open_idx):
    depth = 0
    for i in range(open_idx, len(src)):
        if src[i] == '{': depth += 1
        elif src[i] == '}':
            depth -= 1
            if depth == 0: return i
    return len(src) - 1

def cs_files(dirs):
    out = []
    for d in dirs:
        for root, _, names in os.walk(d):
            out += [os.path.join(root, n) for n in sorted(names) if n.endswith(".cs")]
    return sorted(out)

def copy_sites(src):
    """All visible-copy sites found in a file (for the coverage arithmetic)."""
    return (len(VALIDATION_HEAD_RE.findall(src)) + len(CONFLICT_HEAD_RE.findall(src))
            + len(NOTFOUND_HEAD_RE.findall(src)) + len(SIG_RE.findall(src)))

def scan_file(path):
    """Return (flags, gaps): flags = visible-English literals, gaps = coverage holes."""
    src = open(path, encoding="utf-8-sig").read()
    rel = os.path.relpath(path, ROOT)
    flags, gaps, captured = [], [], []

    # A) Validation lambda region (Func<TRequest,string?> — the ternary chain ends ": null,").
    heads = len(VALIDATION_HEAD_RE.findall(src))
    regions = list(VALIDATION_RE.finditer(src))
    if len(regions) != heads:
        gaps.append(f"{rel}: {heads} 'Validation =' sites vs {len(regions)} parsed regions")
    for reg in regions:
        lits = list(re.finditer(LIT, reg.group(0)))
        if not lits:
            gaps.append(f"{rel}:{line_of(src, reg.start())} Validation region carries no literal copy")
        captured += [(reg.start() + m.start(), "Validation", m.group("s")) for m in lits]

    # B) adapter conflict copy, C) controller 404 copy: every site must parse as a literal.
    for head_re, lit_re, label in ((CONFLICT_HEAD_RE, CONFLICT_RE, "ConflictMessage"),
                                   (NOTFOUND_HEAD_RE, NOTFOUND_RE, "NotFoundMessage")):
        heads = len(head_re.findall(src))
        ms = list(lit_re.finditer(src))
        if len(ms) != heads:
            gaps.append(f"{rel}: {heads} '{label}' sites vs {len(ms)} literal parses")
        captured += [(m.start(), label, m.group("s")) for m in ms]

    # D) 400/409/404 bodies built inline: exception & ErrorResponse literals.
    captured += [(m.start(), "Exception/ErrorResponse", m.group("s")) for m in EXC_RE.finditer(src)]

    # E) rule validators: literals returned by string / Task<string?> methods.
    for sig in SIG_RE.finditer(src):
        if sig.group("tail") == "{":
            a = sig.end() - 1                      # the opening "{" of the body
            b = body_end(src, a)
            captured += [(a + m.start(), "Validator return", m.group("s"))
                         for m in RETURN_LIT_RE.finditer(src[a:b])]
        else:
            # Anchored: the expression body counts only when it IS a literal.
            m = EXPR_LIT_RE.match(src, sig.end() - 2)
            if m:
                captured.append((m.start(), "Validator =>", m.group("s")))

    for off, ctx, lit in captured:
        hits = markers_in(lit)
        if hits:
            flags.append(f"{rel}:{line_of(src, off)} [{ctx}] {lit!r} → {sorted(set(hits))}")
    return flags, gaps

def sweep(dirs):
    files = cs_files(dirs)
    if not files:
        return [], [f"swept surface is empty: {dirs}"], 0, 0
    flags, gaps = [], []
    for f in files:
        fl, gp = scan_file(f)
        flags += fl
        gaps += gp
    sites = sum(copy_sites(open(f, encoding="utf-8-sig").read()) for f in files)
    return flags, gaps, len(files), sites

def selftest():
    """Fixture copy sites: canonical Spanish (must pass) + canonical English (must flag)."""
    tmp = "/tmp/opencode/spanish-copy-selftest"
    good, bad = os.path.join(tmp, "good"), os.path.join(tmp, "bad")
    os.makedirs(good, exist_ok=True); os.makedirs(bad, exist_ok=True)
    BODY = """
public class {cls}Svc {{
    private static readonly AdapterConfig adapter = new() {{
        DefaultOrder = "name asc",
        Validation = r => string.IsNullOrWhiteSpace(r.Name) ? "{v1}"
            : string.IsNullOrWhiteSpace(r.Label) ? "{v2}" : null,
        ConflictMessage = "{conflict}",
    }};
    protected override string NotFoundMessage => "{notfound}";
    public void Create(string n) => throw new ValidationException("{vexc}");
    public void Delete(int id) => throw new ConflictException("{cexc}");
    public void Get(int id) {{ _ = new ErrorResponse("{notfound2}"); }}
    public string? FirstViolation() {{
        if (x < 1) return "{rule1}";
        return null;
    }}
    private async Task<string?> ValidateReferencesAsync() {{ return "{rule2}"; }}
    private static string? RefError() => "{rule3}";
    private static string Guard() => throw new InvalidOperationException("{guard}");
}}
"""
    ES = dict(cls="Good", v1="Nombre es obligatorio", v2="Label es obligatorio",
              conflict="El sector está referenciado por observaciones de seguridad y no puede eliminarse",
              notfound="Sector no encontrado", vexc="La tarea es obligatoria",
              cexc="La planta está referenciada por observaciones de seguridad y no puede eliminarse",
              notfound2="Planta no encontrada", rule1="Se requiere al menos un label para {label}",
              rule2="Uno o más Observadores no existen", rule3="La empresa contratista no existe",
              guard="This catalog declares no flat feed.")
    EN = dict(cls="Bad", v1="Name is required", v2="Label is required",
              conflict="The sector is referenced by security observations and cannot be deleted",
              notfound="Sector not found", vexc="Task is required",
              cexc="The plant is in use and cannot be deleted",
              notfound2="Plant not found", rule1="At least one observer is required",
              rule2="One or more Observers do not exist", rule3="Contractor company not found",
              guard="ConnectionStrings:Default is required.")
    open(os.path.join(good, "GoodSvc.cs"), "w", encoding="utf-8").write(BODY.format(**ES))
    open(os.path.join(bad, "BadSvc.cs"), "w", encoding="utf-8").write(BODY.format(**EN))

    fl, gp, _, _ = sweep([good])
    if gp or fl:
        print("SELFTEST FAIL: canonical Spanish copy flagged (discriminator too strict):", fl, gp)
        return 1
    fl, gp, _, _ = sweep([bad])
    expect = 10  # v1 v2 conflict notfound vexc cexc notfound2 rule1 rule2 rule3 — the guard is NOT swept
    contexts = {f.split("[")[1].split("]")[0] for f in fl}
    want = {"Validation", "ConflictMessage", "NotFoundMessage",
            "Exception/ErrorResponse", "Validator return", "Validator =>"}
    if len(fl) != expect or not want <= contexts:
        print("SELFTEST FAIL: English copy under-flagged (discriminator not pinning):",
              f"got {len(fl)} flags, expected {expect}; contexts missing {sorted(want - contexts)}", fl)
        return 1
    print(f"PASS self-test: canonical Spanish green, canonical English flagged {expect}/10 in "
          f"all 6 contexts, guard + contract order strings not swept")
    return 0

if selftest():
    sys.exit(1)

flags, gaps, nfiles, sites = sweep(SCAN_DIRS)
for g in gaps:
    print(f"GAP {g}")
for f in flags:
    print(f"ENGLISH {f}")
print(f"spanish visible-copy check: {len(flags)} English literals, {len(gaps)} coverage gaps "
      f"({nfiles} files, {sites} copy sites swept)")
sys.exit(1 if (flags or gaps) else 0)
PY

status=$?
if [ "$status" -eq 0 ]; then
  echo "spanish visible-copy check: 0 failures"
else
  echo "spanish visible-copy check: FAILED"
fi
exit "$status"
