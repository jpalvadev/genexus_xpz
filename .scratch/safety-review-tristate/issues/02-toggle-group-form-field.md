# 02 — `toggle-group` form field + Safety Review tri-state form

Status: ready-for-agent

Blocked by: 01

Add the missing single-choice control to GenericForm and render the twelve
**Revisión de Seguridad** answers with it. Spec:
`.scratch/safety-review-tristate/spec.md`.

## Work

- `components/ui/toggle.tsx` and `components/ui/toggle-group.tsx`: canonical Shadcn
  registry code, verbatim (`radix-ui` imports, `data-slot` attributes). The primitive is
  already installed (`radix-ui@1.4.3`).
- `components/form/FormToggleGroup.tsx` following the existing field pattern
  (`FormRadioGroup` is the closest): `useFieldContext<string>()`, `FormBase` wrapper,
  `null`/empty → nothing pressed, `disabled`, `onValueChange`, `aria-invalid` on
  touch-fail, `options` from props.
- Register `ToggleGroup` in the form hooks' `fieldComponents`; add
  `case 'toggle-group'` to the GenericForm switch (label/description/disabled/options/
  onValueChange/required/children, as `radio-group` does); add `'toggle-group'` to the
  `FieldConfig.formField` union. `'checkbox'` + `FormCheckbox` stay (Observers catalog).
- `securityObservation.type.ts`: `type SafetyReviewAnswer = 'SI' | 'NO' | 'N/A'`,
  `SAFETY_REVIEW_OPTIONS` (`Sí`/`No`/`N/A` → `SI`/`NO`/`N/A`) as the single source;
  Response/Request/form values become `SafetyReviewAnswer | null`; zod becomes
  `z.enum(values).nullable()` with the two Spanish messages in backend rule order
  (invalid value first, then mandatory); `emptySecurityObservationFormValues` → twelve
  `null`; mapping helpers pass the literals straight through.
- `SecurityObservationForm.tsx`: the twelve fields become `formField: 'toggle-group'`,
  `colSpan: 6` (two per row), `options: SAFETY_REVIEW_OPTIONS`, `variant outline` /
  `size sm` inside the field component, required asterisk kept, separator description kept,
  no un-set once answered, disabled in `view`/`delete`.

## Tests

- `components/form/FormToggleGroup.test.tsx` rendered **through GenericForm + FieldConfig**
  (pattern: `FormFileInput.test.tsx`, `FormMultiSelect.test.tsx`): `null` renders nothing
  pressed, single selection replaces the previous value, `disabled` in `view`,
  `onValueChange` fires.
- Repine `SecurityObservationForm.test.tsx`: picking Sí/No/N/A submits the literals;
  loading a record pre-presses stored answers; `view` mode disabled.
- Repine `securityObservation.rules.test.ts`: invalid value message, mandatory message
  intact, twelve `N/A` valid.
- Repine `frontend/src/test/contractSchemas.test.ts` and commit the harness recapture of
  `security-observation.response.json` / `security-observation-list.response.json`
  (timestamp-only drift in SO fixtures is discarded, per CODING_STANDARDS).

## Done when

`scripts/with-api.sh "$PWD/scripts/closeout-harness-pass.sh"` green (fixtures recaptured,
four pin scripts, wire spot checks), pre-push suite green on `master`, integration branch
merged and deleted on `origin` and locally.
