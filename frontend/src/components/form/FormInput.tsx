import { Input } from '../ui/input';
import { FormBase, type FormControlProps } from './FormBase';
import { useFieldContext } from './hooks';

export default function FormInput(
    props: FormControlProps & {
        onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }
) {
    const field = useFieldContext<string>();
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (props.onChange) {
            props.onChange(e);
        } else {
            field.handleChange(e.target.value);
        }
    };

    return (
        <FormBase {...props}>
            <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={handleChange}
                aria-invalid={isInvalid}
                disabled={props.disabled}
                type={props.type}
                placeholder={props.placeholder}
            />
        </FormBase>
    );
}
