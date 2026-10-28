import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { CircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface RadioGroupProps extends React.ComponentProps<
    typeof RadioGroupPrimitive.Root
> {
    orientation?: 'vertical' | 'horizontal';
}

function RadioGroup({
    className,
    orientation = 'vertical',
    ...props
}: RadioGroupProps) {
    return (
        <RadioGroupPrimitive.Root
            data-slot="radio-group"
            data-orientation={orientation}
            className={cn(
                'grid gap-3',
                orientation === 'horizontal' &&
                    'flex flex-wrap items-center gap-4',
                className,
            )}
            {...props}
        />
    );
}

interface RadioGroupItemProps extends React.ComponentProps<
    typeof RadioGroupPrimitive.Item
> {
    label?: React.ReactNode;
    description?: React.ReactNode;
}

function RadioGroupItem({
    className,
    id,
    label,
    description,
    children,
    ...props
}: RadioGroupItemProps) {
    const generatedId = React.useId();
    const itemId = id || generatedId;
    const labelContent = label || children;

    const radioElement = (
        <RadioGroupPrimitive.Item
            id={itemId}
            data-slot="radio-group-item"
            className={cn(
                'peer relative flex size-4 shrink-0 items-center justify-center rounded-full border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary',
                className,
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator
                data-slot="radio-group-indicator"
                className="grid place-content-center text-current transition-none"
            >
                <CircleIcon className="size-2 fill-primary text-primary" />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    );

    if (!labelContent && !description) {
        return radioElement;
    }

    return (
        <div
            className={cn(
                'flex gap-2',
                description ? 'items-start' : 'items-center',
            )}
        >
            <div className={description ? 'pt-0.5' : ''}>{radioElement}</div>
            <div className="grid gap-1.5 leading-none">
                {labelContent && (
                    <Label
                        htmlFor={itemId}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                    >
                        {labelContent}
                    </Label>
                )}
                {description && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

export { RadioGroup, RadioGroupItem };
