import { useFieldContext } from './hooks';
import { FormBase, type FormControlProps } from './FormBase';
import { type ReactNode } from 'react';
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from '../ui/select';

export default function FormSelect({
    children,
    ...props
}: FormControlProps & { children: ReactNode }) {
    const field = useFieldContext<string>();
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    return (
        <FormBase {...props}>
            <Select
                onValueChange={(e) => {
                    if (props.onValueChange) {
                        props.onValueChange(e);
                        field.handleChange('');
                    } else {
                        field.handleChange(e);
                    }
                }}
                value={
                    field.state.value != null
                        ? field.state.value.toString()
                        : ''
                }
                disabled={props.disabled}
            >
                <SelectTrigger
                    aria-invalid={isInvalid}
                    id={field.name}
                    onBlur={field.handleBlur}
                >
                    <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>{children}</SelectContent>
            </Select>
        </FormBase>
    );
}
