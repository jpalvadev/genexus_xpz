import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import FormDate from './FormDate';
import FormDateTime from './FormDateTime';
import FormTime from './FormTime';
import FormCheckbox from './FormCheckbox';
import FormFileInput from './FormFileInput';
import FormInput from './FormInput';
import FormLeaflet from './FormLeaflet';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';
import FormMultiSelect from './FormMultiSelect';

import FormRadioGroup from './FormRadioGroup';
import FormCheckboxGroup from './FormCheckboxGroup';
import FormSignature from './FormSignature';

const { fieldContext, formContext, useFieldContext, useFormContext } =
    createFormHookContexts();

const { useAppForm } = createFormHook({
    fieldComponents: {
        Input: FormInput,
        FileInput: FormFileInput,
        Textarea: FormTextarea,
        Select: FormSelect,
        MultiSelect: FormMultiSelect,
        RadioGroup: FormRadioGroup,
        CheckboxGroup: FormCheckboxGroup,

        Checkbox: FormCheckbox,
        Date: FormDate,
        DateTime: FormDateTime,
        Time: FormTime,
        Leaflet: FormLeaflet,
        Signature: FormSignature,
    },
    formComponents: {},
    fieldContext,
    formContext,
});

export { useAppForm, useFieldContext, useFormContext };
