import { type ReactNode } from 'react';
import { useFieldContext } from './hooks';
import { FormBase, type FormControlProps } from './FormBase';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

export interface CheckboxOption {
    label: string;
    value: string;
    description?: string;
    disabled?: boolean;
}

export interface FormCheckboxGroupProps extends FormControlProps {
    options?: CheckboxOption[];
    children?: ReactNode;
    orientation?: 'vertical' | 'horizontal';
}

export default function FormCheckboxGroup({
    options,
    children,
    orientation = 'vertical',
    ...props
}: FormCheckboxGroupProps) {
    const field = useFieldContext<string[]>();
    const currentValues = (field.state.value ?? []).map(String);

    const handleToggle = (val: string, isChecked: boolean) => {
        const nextSet = new Set(currentValues);
        if (isChecked) {
            nextSet.add(val);
        } else {
            nextSet.delete(val);
        }
        field.handleChange(Array.from(nextSet));
    };

    return (
        <FormBase {...props}>
            <div
                className={`flex gap-3 pt-1 ${
                    orientation === 'horizontal'
                        ? 'flex-row flex-wrap items-center'
                        : 'flex-col'
                }`}
            >
                {options?.map((opt) => {
                    const isChecked = currentValues.includes(opt.value);
                    const optId = `${field.name}-${opt.value}`;
                    const isDisabled = props.disabled || opt.disabled;

                    return (
                        <div
                            key={opt.value}
                            className="flex items-start gap-2 text-sm"
                        >
                            <Checkbox
                                id={optId}
                                checked={isChecked}
                                disabled={isDisabled}
                                onCheckedChange={(checked) =>
                                    handleToggle(opt.value, checked === true)
                                }
                                onBlur={field.handleBlur}
                            />
                            <div className="grid gap-0.5 leading-none">
                                <Label
                                    htmlFor={optId}
                                    className={`cursor-pointer font-normal ${
                                        isDisabled
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                    }`}
                                >
                                    {opt.label}
                                </Label>
                                {opt.description && (
                                    <p className="text-xs text-muted-foreground">
                                        {opt.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
                {children}
            </div>
        </FormBase>
    );
}
