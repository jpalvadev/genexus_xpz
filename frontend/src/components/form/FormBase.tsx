import { type ReactNode } from 'react';
import { useFieldContext } from './hooks';
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '../ui/field';

export type FormControlProps = {
    label?: string;
    description?: string;
    disabled?: boolean;
    type?: string;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onValueChange?: (value: string) => void;
    accept?: string;
    required?: boolean;
};

type FormBaseProps = FormControlProps & {
    children: ReactNode;
    horizontal?: boolean;
    controlFirst?: boolean;
};

export function FormBase({
    children,
    label,
    description,
    controlFirst,
    horizontal,
    required,
}: FormBaseProps) {
    const field = useFieldContext();
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    const labelElement = (label || description) ? (
        <>
            {label && (
                <div className="flex items-center gap-0.5">
                    <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                    {required && (
                        <span
                            className="text-destructive print:hidden select-none font-medium text-sm"
                            aria-hidden="true"
                        >
                            *
                        </span>
                    )}
                </div>
            )}
            {description && <FieldDescription>{description}</FieldDescription>}
        </>
    ) : null;
    const errorElem = isInvalid && (
        <FieldError errors={field.state.meta.errors} />
    );

    return (
        <Field
            data-invalid={isInvalid}
            aria-required={required}
            orientation={horizontal ? 'horizontal' : undefined}
        >
            {controlFirst ? (
                <>
                    {children}
                    <FieldContent>
                        {labelElement}
                        {errorElem}
                    </FieldContent>
                </>
            ) : (
                <>
                    <FieldContent>{labelElement}</FieldContent>
                    {children}
                    {errorElem}
                </>
            )}
        </Field>
    );
}
