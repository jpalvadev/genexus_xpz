import { Calendar } from '@/components/ui/calendar';
import { ChevronDownIcon, ClockIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { FormBase, type FormControlProps } from './FormBase';
import { useFieldContext } from './hooks';
import { format, parseISO, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';

export default function FormDateTime(
    props: FormControlProps & {
        onChange?: (date: Date | undefined) => void;
    },
) {
    const field = useFieldContext<Date | undefined>();
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    const [open, setOpen] = useState(false);

    const selectedDate = field.state.value
        ? typeof field.state.value === 'string'
            ? parseISO(field.state.value)
            : new Date(field.state.value)
        : undefined;

    const currentHours = selectedDate
        ? selectedDate.getHours().toString().padStart(2, '0')
        : '00';
    const currentMinutes = selectedDate
        ? selectedDate.getMinutes().toString().padStart(2, '0')
        : '00';

    const handleClearDateTime = () => {
        field.handleChange(undefined);
        if (props.onChange) props.onChange(undefined);
        setOpen(false);
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;

        let newDateTime = date;
        if (selectedDate) {
            newDateTime = setHours(newDateTime, selectedDate.getHours());
            newDateTime = setMinutes(newDateTime, selectedDate.getMinutes());
        } else {
            const now = new Date();
            newDateTime = setHours(newDateTime, now.getHours());
            newDateTime = setMinutes(newDateTime, now.getMinutes());
        }

        field.handleChange(newDateTime);
        if (props.onChange) props.onChange(newDateTime);
    };

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (raw === '') {
            const baseDate = selectedDate || new Date();
            const updatedDate = setHours(baseDate, 0);
            field.handleChange(updatedDate);
            if (props.onChange) props.onChange(updatedDate);
            return;
        }
        let num = parseInt(raw, 10);
        if (isNaN(num)) num = 0;
        if (num < 0) num = 0;
        if (num > 23) num = 23;

        const baseDate = selectedDate || new Date();
        const updatedDate = setHours(baseDate, num);
        field.handleChange(updatedDate);
        if (props.onChange) props.onChange(updatedDate);
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (raw === '') {
            const baseDate = selectedDate || new Date();
            const updatedDate = setMinutes(baseDate, 0);
            field.handleChange(updatedDate);
            if (props.onChange) props.onChange(updatedDate);
            return;
        }
        let num = parseInt(raw, 10);
        if (isNaN(num)) num = 0;
        if (num < 0) num = 0;
        if (num > 59) num = 59;

        const baseDate = selectedDate || new Date();
        const updatedDate = setMinutes(baseDate, num);
        field.handleChange(updatedDate);
        if (props.onChange) props.onChange(updatedDate);
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
                            {selectedDate instanceof Date && selectedDate
                                ? format(selectedDate, 'dd/MM/yyyy HH:mm')
                                : 'Seleccionar fecha y hora'}
                            <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-3">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                locale={es}
                                disabled={props.disabled}
                                captionLayout="dropdown"
                                startMonth={new Date()}
                                endMonth={
                                    new Date(new Date().getFullYear() + 5, 12)
                                }
                                className="rounded-md border"
                                aria-invalid={isInvalid}
                            />
                            <div className="mt-3 flex items-center justify-between border-t pt-3 px-1">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                    <ClockIcon className="h-4 w-4" />
                                    <span>Hora:</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Input
                                        type="number"
                                        min={0}
                                        max={23}
                                        value={currentHours}
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
                                        value={currentMinutes}
                                        onChange={handleMinuteChange}
                                        disabled={props.disabled}
                                        className="w-14 h-8 text-center text-xs font-mono"
                                        placeholder="MM"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleClearDateTime}
                                variant="outline"
                                className="mt-3 w-full"
                                size="sm"
                            >
                                Limpiar Fecha y Hora
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </FormBase>
    );
}
