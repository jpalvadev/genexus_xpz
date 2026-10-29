import { Calendar } from '@/components/ui/calendar';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { FormBase, type FormControlProps } from './FormBase';
import { useFieldContext } from './hooks';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function FormDate(
    props: FormControlProps & {
        onChange?: (date: Date | undefined) => void; // Cambiado a Date
    },
) {
    const field = useFieldContext<Date | undefined>();
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    const [open, setOpen] = useState(false);

    // al crear o cambiar el valor del input nos llega un Date, al leer lo cargado nos llega un string
    const selectedDate = field.state.value
        ? typeof field.state.value === 'string'
            ? parseISO(field.state.value)
            : new Date(field.state.value)
        : undefined;

    const handleClearDate = () => {
        field.handleChange(undefined);
        setOpen(false);
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;

        field.handleChange(date); // pasamos el objeto date a tanstack

        if (props.onChange) props.onChange(date); // por si las moscas necesitamos customizar el onchange

        setOpen(false);
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
                            {/* muestra fecha formateada al front, por debajo sigue siendo Date */}
                            {selectedDate instanceof Date && selectedDate
                                ? format(selectedDate, 'dd/MM/yyyy')
                                : 'Seleccionar fecha'}
                            <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <>
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
                            <Button
                                onClick={handleClearDate}
                                variant="outline"
                                className="mx-2 mb-2"
                            >
                                Limpiar Fecha
                            </Button>
                        </>
                    </PopoverContent>
                </Popover>
            </div>
        </FormBase>
    );
}
