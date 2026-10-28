import { ChevronDownIcon, ClockIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { FormBase, type FormControlProps } from './FormBase';
import { useFieldContext } from './hooks';

export default function FormTime(
    props: FormControlProps & {
        onChange?: (time: string | undefined) => void;
    },
) {
    const field = useFieldContext<string | undefined>();
    const [open, setOpen] = useState(false);

    const rawValue = field.state.value || '';
    const hasValue = Boolean(rawValue);

    const parts = rawValue.split(':');
    const hoursStr = parts[0] ? parts[0].padStart(2, '0') : '00';
    const minutesStr = parts[1] ? parts[1].padStart(2, '0') : '00';

    const handleClearTime = () => {
        field.handleChange(undefined);
        if (props.onChange) props.onChange(undefined);
        setOpen(false);
    };

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        let num = 0;
        if (raw !== '') {
            num = parseInt(raw, 10);
            if (isNaN(num)) num = 0;
            if (num < 0) num = 0;
            if (num > 23) num = 23;
        }

        const newHours = num.toString().padStart(2, '0');
        const newTime = `${newHours}:${minutesStr}`;

        field.handleChange(newTime);
        if (props.onChange) props.onChange(newTime);
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        let num = 0;
        if (raw !== '') {
            num = parseInt(raw, 10);
            if (isNaN(num)) num = 0;
            if (num < 0) num = 0;
            if (num > 59) num = 59;
        }

        const newMinutes = num.toString().padStart(2, '0');
        const newTime = `${hoursStr}:${newMinutes}`;

        field.handleChange(newTime);
        if (props.onChange) props.onChange(newTime);
    };

    return (
        <FormBase {...props}>
            <div className="flex flex-col gap-3">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild disabled={props.disabled}>
                        <Button
                            variant="outline"
                            id={field.name}
                            className="justify-between font-normal"
                        >
                            <span className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 opacity-50" />
                                {hasValue
                                    ? `${hoursStr}:${minutesStr}`
                                    : 'Seleccionar hora'}
                            </span>
                            <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="start">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                    <ClockIcon className="h-4 w-4" />
                                    Hora:
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <Input
                                        type="number"
                                        min={0}
                                        max={23}
                                        value={hoursStr}
                                        onChange={handleHourChange}
                                        disabled={props.disabled}
                                        className="w-14 h-8 text-center text-xs font-mono"
                                        placeholder="HH"
                                    />
                                    <span className="text-xs font-bold text-muted-foreground">
                                        :
                                    </span>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={59}
                                        value={minutesStr}
                                        onChange={handleMinuteChange}
                                        disabled={props.disabled}
                                        className="w-14 h-8 text-center text-xs font-mono"
                                        placeholder="MM"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleClearTime}
                                variant="outline"
                                className="w-full"
                                size="sm"
                            >
                                Limpiar Hora
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </FormBase>
    );
}
