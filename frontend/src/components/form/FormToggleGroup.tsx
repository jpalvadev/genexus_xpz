import { useFieldContext } from './hooks';
import { FormBase, type FormControlProps } from './FormBase';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { type ReactNode } from 'react';

export interface ToggleGroupOption {
    label: string;
    value: string;
    disabled?: boolean;
}

export interface FormToggleGroupProps extends FormControlProps {
    options?: ToggleGroupOption[];
    children?: ReactNode;
}

/**
 * Grupo de botones segmentados Sí/No/N/A (ADR-0006): respuesta tri-estado de una
 * pregunta de la Revisión de Seguridad, presentada en español sobre un
 * ToggleGroup de Radix (type="single").
 *
 * `null` (sin respuesta) no presiona ningún segmento; un segmento presionado se
 * reasigna al pulsar otro. En modo `single` Radix emite `''` al despresionar el
 * único valor: se ignora — un campo respondido solo se re-asigna, nunca queda
 * vacío desde la UI.
 */
export default function FormToggleGroup({
    options,
    children,
    ...props
}: FormToggleGroupProps) {
    const field = useFieldContext<string>();
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

    return (
        <FormBase {...props}>
            <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                spacing={0}
                value={
                    field.state.value != null
                        ? field.state.value.toString()
                        : ''
                }
                onValueChange={(val) => {
                    if (val === '') {
                        return;
                    }
                    if (props.onValueChange) {
                        props.onValueChange(val);
                    }
                    field.handleChange(val);
                }}
                disabled={props.disabled}
                aria-invalid={isInvalid}
                className="w-full"
            >
                {options?.map((opt) => (
                    <ToggleGroupItem
                        key={opt.value}
                        value={opt.value}
                        disabled={props.disabled || opt.disabled}
                    >
                        {opt.label}
                    </ToggleGroupItem>
                ))}
                {children}
            </ToggleGroup>
        </FormBase>
    );
}
