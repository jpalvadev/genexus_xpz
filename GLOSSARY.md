# SHYMA Security Observations

One service, one story: a contractor company puts operators on a site, and the app records
the work they carried out. Everything below is the migrated domain; the language is English
even though the source export is Spanish.

## Language

**Security Observation**: One registered act of security work — a task performed by a set of
Observers at a Place, under a Plant and a Sector. Carries the whole safety-review record.
_Avoid_: Observación Planificada de Seguridad, OPS, shift, patrol, event

**Observer**: An employee who carries out security work and can be posted to a site. Only
Active Observers may be selected on a Security Observation.
_Avoid_: Observador, guard, agent, operator, observed target

**Post**: The role an Observer holds — Gerente, Jefe or Supervisor. A property of the
Observer, chosen from those three values only.
_Avoid_: Puesto, position, rank, title

**Objective**: What an Observer is meant to accomplish at their site. Belongs to the
Observer, never to a single Security Observation.
_Avoid_: Objetivo, goal, mission

**Active**: Whether an Observer is currently usable. Deactivating an Observer hides them from
the dropdown; it never erases the Observations that name them.
_Avoid_: Activo, enabled, retired, deleted

**Contractor Company**: The security company contracted for a Security Observation, and the
owner of the Observers who do it. May be left off an Observation.
_Avoid_: Empresa Contratista, vendor, agency, provider

**Reason For Social**: The purpose a Contractor Company declares for its commercial activity.
It belongs to the company, never to an individual Observation.
_Avoid_: RazonSocial, justification, notes, reason for observation

**Plant**: A physical site or facility that Observers are posted to and secured. Has subtypes
that only label it in a dropdown (e.g. "North Plant (RNV)").
_Avoid_: Planta, factory, branch, venue

**Sector**: The organizational area a Security Observation is filed under. A reference entity
with its own name, not free text.
_Avoid_: Sector as a label, department, category, zone

**Place**: Where a Security Observation takes place, recorded as free text. Deliberately
*not* a Plant reference — a Plant is a staffing target, a Place is what the record says.
_Avoid_: Lugar, location, site, address

**Task**: The work to be performed during a Security Observation. Free text, required.
_Avoid_: Tarea, activity, note, description

**Task Realized**: Whether the Task was actually carried out. Answered on the record.
_Avoid_: TareaRealizada, completion, outcome

**Observation Date**: The date a Security Observation is planned for. Required and editable.
Selectable only from seven days back to one day forward of today; a date outside that window is
an invalid observation, not a late entry.
_Avoid_: Fecha, date, deadline

**Created On**: When a Security Observation was registered. Set once, never edited, and the
grid's default order.
_Avoid_: FechaCreacion, creation date, timestamp

**Observers**: Between one and ten Observers named on a single Security Observation. Plural by
design; ten is the hard limit, and naming none or more than ten is an error on the record.
_Avoid_: Observer (singular), operator list, roster, tags

**Safety Review**: The block of yes/no findings on a Security Observation — APR reviewed,
task carried out per the APR, ATR revision needed, TRC risk considered, impact risk
controlled, hands and injury measures, tools and mobile equipment reviewed, energy and
ladders reviewed, electrical equipment and circuit breakers. Every finding must be answered;
a blank finding is an error. Critical Controls is the odd one out: it is free text naming the
controls verified, not a yes/no.
_Avoid_: the checklist, findings, notes

**Risk Management / Fatal-Risk Protocols / Classification / Relation**: The four multi-select
fields on a Security Observation — labels picked from a fixed option list and joined into one
answer. Each of the four requires at least one picked label.
_Avoid_: the combo boxes, tags, picklists

**Summary Observation / Detailed Action / Immediate Action Description**: The narrative tail of
a Security Observation — what was observed, and what must be done about it. All three are
required on the record.
_Avoid_: ResumenObservacion, DetalleAI, DescripcionAC, remarks

**Equipment Maintenance**: A standalone example feature kept in the app to demonstrate the
shared form/table contract. It is not part of the SHYMA domain and must not be renamed to
fit it.
_Avoid_: the migrated feature, Security Observation

## Relationships

- A Contractor Company owns Observers; an Observer is posted to Plants via an Observer–Plant
  Assignment; a Security Observation names 1–10 Observers, one Plant, one Sector, one
  free-text Place, and optionally one Contractor Company.
- Sector, Plant and Contractor Company are required-or-optional exactly as the export says:
  Company optional, the other two required, and so is the Observer selection.
- Nothing cascades: retiring a Plant, Sector, Observer or Company never retires the
  Observations that name them.
- The record has no chart surface and no auth surface; neither belongs to this context.
