import { useFieldContext } from './hooks';
import { FormBase, type FormControlProps } from './FormBase';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { type ReactNode } from 'react';

export interface RadioOption {
    label: string;
    value: string;
    description?: string;
    disabled?: boolean;
}

export interface FormRadioGroupProps extends FormControlProps {
    options?: RadioOption[];
    children?: ReactNode;
    orientation?: 'vertical' | 'horizontal';
}

export default function FormRadioGroup({
    options,
    children,
    orientation = 'vertical',
    ...props
}: FormRadioGroupProps) {
    const field = useFieldContext<string>();
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

    return (
        <FormBase {...props}>
            <RadioGroup
                value={
                    field.state.value != null
                        ? field.state.value.toString()
                        : ''
                }
                onValueChange={(val) => {
                    if (props.onValueChange) {
                        props.onValueChange(val);
                    }
                    field.handleChange(val);
                }}
                orientation={orientation}
                disabled={props.disabled}
                aria-invalid={isInvalid}
            >
                {options?.map((opt) => (
                    <RadioGroupItem
                        key={opt.value}
                        value={opt.value}
                        label={opt.label}
                        description={opt.description}
                        disabled={props.disabled || opt.disabled}
                    />
                ))}
                {children}
            </RadioGroup>
        </FormBase>
    );
}

