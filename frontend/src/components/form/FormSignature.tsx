import { SignatureInput } from '../ui/signature-input';
import { FormBase, type FormControlProps } from './FormBase';
import { useFieldContext } from './hooks';

export default function FormSignature(
    props: FormControlProps & {
        onChange?: (value: string) => void;
    }
) {
    const field = useFieldContext<string>();

    const handleChange = (val: string) => {
        if (props.onChange) {
            props.onChange(val as any);
        }
        field.handleChange(val);
    };

    return (
        <FormBase {...props} label={undefined} description={undefined}>
            <SignatureInput
                value={field.state.value || ''}
                onChange={handleChange}
                disabled={props.disabled}
                label={props.label}
                description={props.description}
            />
        </FormBase>
    );
}
