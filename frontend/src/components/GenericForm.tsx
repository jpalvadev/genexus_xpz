import { useAppForm } from '@/components/form/hooks';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';

import type { FormMode } from '@/types/FormMode.type';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { useMemo, type HTMLAttributes, type ReactNode } from 'react';
import { ZodType } from 'zod';
import Loading from './Loading';
import { GenericAlertDialog } from './GenericAlertDialog';
import { revalidateLogic } from '@tanstack/react-form';
import { cn } from '@/lib/utils';

// TKey asegura que solo pueda usar nombres que existan rn rl objeto Data
export interface FieldConfig<TData> {
    name: keyof TData & string;
    label?: string;
    formField:
        | 'input'
        | 'textarea'
        | 'fileInput'
        | 'date'
        | 'dateTime'
        | 'time'
        | 'checkbox'
        | 'checkbox-group'
        | 'select'
        | 'multi-select'
        | 'radio-group'
        | 'toggle-group'
        | 'leaflet'
        | 'signature'
        | 'separator'
        | 'spacer'
        | 'button';
    buttonText?: string;
    buttonVariant?:
        | 'default'
        | 'destructive'
        | 'outline'
        | 'secondary'
        | 'ghost'
        | 'link';
    buttonIcon?: ReactNode;
    buttonClassName?: string;
    options?: { label: string; value: string; description?: string }[];
    orientation?: 'vertical' | 'horizontal';
    description?: string;
    colSpan?: number;
    rowId?: string;
    // className?: string;
    className?: HTMLAttributes<HTMLElement>['className'];
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClick?: (values?: TData) => void;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    accept?: string;
    children?: ReactNode;
    single?: boolean;
    shouldFilter?: boolean;
    data?: TData;
    type?: 'text' | 'password' | 'email' | 'number';
    value?: string | number;
    validators?: Record<string, unknown>;
    listeners?: Record<string, unknown>;
    required?: boolean;
    disabled?: boolean;
    enableCrop?: boolean;
    cropShape?: 'round' | 'rect';
    aspectRatios?: { label: string; value: number }[];
    defaultAspect?: number;
}

// Baseline legacy: helpers exportados del formulario genérico (no componentes)
// eslint-disable-next-line react-refresh/only-export-components
export function isZodFieldRequired(
    schema: unknown,
    fieldName: string,
): boolean {
    if (!schema || typeof schema !== 'object') return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = schema;
    while (current && current._def) {
        if (current.shape) break;
        if (current._def.innerType) {
            current = current._def.innerType;
        } else if (current._def.schema) {
            current = current._def.schema;
        } else {
            break;
        }
    }
    const shape =
        current?.shape ||
        (typeof current?._def?.shape === 'function'
            ? current._def.shape()
            : current?._def?.shape);
    if (!shape || !shape[fieldName]) return false;
    const fieldValidator = shape[fieldName];
    if (typeof fieldValidator?.safeParse !== 'function') return false;
    const result = fieldValidator.safeParse(undefined);
    return !result.success;
}

// eslint-disable-next-line react-refresh/only-export-components
export function resolveIsFieldRequired<TData>(
    fieldConfig: FieldConfig<TData>,
    schema?: ZodType<TData>,
    mode?: FormMode,
): boolean {
    if (
        mode === 'view' ||
        mode === 'delete' ||
        fieldConfig.formField === 'button' ||
        fieldConfig.formField === 'separator' ||
        fieldConfig.formField === 'spacer'
    ) {
        return false;
    }
    if (typeof fieldConfig.required === 'boolean') {
        return fieldConfig.required;
    }
    if (schema) {
        return isZodFieldRequired(schema, fieldConfig.name);
    }
    return false;
}

const colSpanClasses: Record<number, string> = {
    1: 'col-span-12 md:col-span-1',
    2: 'col-span-12 md:col-span-2',
    3: 'col-span-12 md:col-span-3',
    4: 'col-span-12 md:col-span-4',
    5: 'col-span-12 md:col-span-5',
    6: 'col-span-12 md:col-span-6',
    7: 'col-span-12 md:col-span-7',
    8: 'col-span-12 md:col-span-8',
    9: 'col-span-12 md:col-span-9',
    10: 'col-span-12 md:col-span-10',
    11: 'col-span-12 md:col-span-11',
    12: 'col-span-12 md:col-span-12',
};

interface GenericFormProps<TData extends Record<string, unknown>> {
    initialData: TData;
    mode: FormMode;
    schema: ZodType<TData>;

    fields: FieldConfig<TData>[]; // Configuración de campos
    onSubmit?: (values: TData) => void;
    isPending: boolean;
    children?: ReactNode;
    columns?: number;
    handleChange?: (values: TData) => void;
    submitLabel?: string;
    onBeforeSubmit?: (values: TData) => Promise<boolean>;
    className?: string;
    containerClassName?: string;
    actionsClassName?: string;
    actionsLayout?: 'flex' | 'grid';
    showBackButton?: boolean;
    backLabel?: string;
}

export default function GenericForm<TData extends Record<string, unknown>>({
    initialData,
    mode,
    schema,
    fields,
    onSubmit,
    isPending,
    children,
    handleChange,
    submitLabel = 'Guardar',
    onBeforeSubmit,
    className,
    containerClassName,
    actionsClassName,
    actionsLayout = 'flex',
    showBackButton = true,
    backLabel = 'Volver',
}: GenericFormProps<TData>) {
    const router = useRouter();
    const canGoBack = useCanGoBack();

    const form = useAppForm({
        defaultValues: initialData,

        validationLogic: revalidateLogic({
            mode: 'submit', // no valida hasta el primer intento de submit (comportamiento actual)
            modeAfterSubmission: 'change', // después de eso, revalida TODO el schema en cada cambio
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validators: { onDynamic: schema as any }, // reemplaza a { onSubmit: schema }

        onSubmit: async ({ value }) => {
            if (mode !== 'view' && onSubmit) {
                const validatedData = schema.parse(value);
                if (onBeforeSubmit) {
                    const allowSubmit = await onBeforeSubmit(validatedData);
                    if (!allowSubmit) return;
                }
                onSubmit(validatedData);
            }
        },
    });

    const rows = useMemo(() => {
        const hasAnyRowId = fields.some((f) => Boolean(f.rowId));
        if (!hasAnyRowId) {
            return [fields];
        }
        const rowMap = new Map<string, FieldConfig<TData>[]>();
        const rowOrder: string[] = [];
        fields.forEach((f) => {
            const rId = f.rowId || `row_${f.name}`;
            if (!rowMap.has(rId)) {
                rowMap.set(rId, []);
                rowOrder.push(rId);
            }
            rowMap.get(rId)!.push(f);
        });
        return rowOrder.map((id) => rowMap.get(id)!);
    }, [fields]);

    if (isPending) return <Loading />;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
            }}
            onChange={() => {
                if (handleChange) {
                    handleChange(form.state.values);
                }
            }}
            className={cn('w-full flex justify-center', className)}
        >
            <div
                className={cn(
                    'w-full max-w-4xl flex flex-col gap-6 md:bg-card md:text-card-foreground md:border md:border-border/60 md:rounded-lg md:shadow-sm md:p-6',
                    containerClassName,
                )}
            >
                <FieldGroup className="flex flex-col gap-4">
                {rows.map((rowFields, rIdx) => (
                    <div
                        key={rowFields[0]?.rowId || rIdx}
                        className="grid gap-4 grid-cols-12 items-start"
                    >
                        {rowFields.map((f) => {
                            if (f.formField === 'separator') {
                                return (
                                    <div
                                        key={f.name}
                                        className={`col-span-12 pt-4 pb-2 border-b ${f.className || ''}`}
                                    >
                                        <h3 className="font-semibold text-lg">
                                            {f.label}
                                        </h3>
                                        {f.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {f.description}
                                            </p>
                                        )}
                                    </div>
                                );
                            }

                            if (f.formField === 'spacer') {
                                const colSpanClass =
                                    colSpanClasses[f.colSpan ?? 6] ||
                                    'col-span-12 md:col-span-6';
                                return (
                                    <div
                                        key={f.name}
                                        className={`${colSpanClass} ${f.className || ''} hidden md:block pointer-events-none select-none`}
                                        aria-hidden="true"
                                    />
                                );
                            }

                            if (f.formField === 'button') {
                                const colSpanClass =
                                    colSpanClasses[f.colSpan ?? 12] ||
                                    'col-span-12';
                                const isFieldDisabled =
                                    mode === 'view' ||
                                    mode === 'delete' ||
                                    Boolean(f.disabled);

                                return (
                                    <div
                                        key={f.name}
                                        className={cn(colSpanClass, 'flex flex-col gap-2', f.className)}
                                    >
                                        {f.label && (
                                            <span className="text-sm font-medium leading-none">
                                                {f.label}
                                            </span>
                                        )}
                                        <Button
                                            type="button"
                                            variant={f.buttonVariant || 'outline'}
                                            disabled={isFieldDisabled}
                                            onClick={() => f.onClick?.(form.state.values)}
                                            className={cn('w-fit gap-2', f.buttonClassName)}
                                        >
                                            {f.buttonIcon}
                                            {f.buttonText || f.label}
                                        </Button>
                                        {f.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {f.description}
                                            </p>
                                        )}
                                    </div>
                                );
                            }

                            const colSpanClass =
                                colSpanClasses[f.colSpan ?? 6] ||
                                'col-span-12 md:col-span-6';

                            const isRequired = resolveIsFieldRequired(
                                f,
                                schema,
                                mode,
                            );

                            const isFieldDisabled =
                                mode === 'view' ||
                                mode === 'delete' ||
                                Boolean(f.disabled);

                            return (
                                <div
                                    key={f.name}
                                    className={`${colSpanClass} ${f.className || ''}`}
                                >
                                    <form.AppField name={f.name}>
                                        {(field) => {
                                            const renderField = () => {
                                                switch (f.formField) {
                                                    case 'input':
                                                        return (
                                                            <field.Input
                                                                type={
                                                                    f.type ??
                                                                    'text'
                                                                }
                                                                label={f.label}
                                                                description={
                                                                    f.description
                                                                }
                                                                disabled={
                                                                    isFieldDisabled
                                                                }
                                                                placeholder={
                                                                    f.placeholder
                                                                }
                                                                onChange={
                                                                    f.onChange
                                                                }
                                                                required={
                                                                    isRequired
                                                                }
                                                            />
                                                        );
                                                    case 'fileInput':
                                                        return (
                                                            <field.FileInput
                                                                type="file"
                                                                label={f.label}
                                                                description={
                                                                    f.description
                                                                }
                                                                disabled={
                                                                    isFieldDisabled
                                                                }
                                                                onChange={
                                                                    f.onChange
                                                                }
                                                                accept={
                                                                    f.accept
                                                                }
                                                                required={
                                                                    isRequired
                                                                }
                                                                enableCrop={
                                                                    f.enableCrop
                                                                }
                                                                cropShape={
                                                                    f.cropShape
                                                                }
                                                                aspectRatios={
                                                                    f.aspectRatios
                                                                }
                                                                defaultAspect={
                                                                    f.defaultAspect
                                                                }
                                                            />
                                                        );
                                                    case 'textarea':
                                                        return (
                                                            <field.Textarea
                                                                label={f.label}
                                                                description={
                                                                    f.description
                                                                }
                                                                disabled={
                                                                    isFieldDisabled
                                                                }
                                                                placeholder={
                                                                    f.placeholder
                                                                }
                                                                required={
                                                                    isRequired
                                                                }
                                                            />
                                                        );
                                                    case 'date':
                                                        return (
                                                            <field.Date
                                                                label={f.label}
                                                                description={
                                                                    f.description
                                                                }
                                                                disabled={
                                                                    isFieldDisabled
                                                                }
                                                                required={
                                                                    isRequired
                                                                }
                                                            />
                                                        );

                                                    case 'dateTime':
                                                        return (
                                                            <field.DateTime
                                                                label={f.label}
                                                                description={
                                                                    f.description
                                                                }
                                                                disabled={
                                                                    isFieldDisabled
                                                                }
                                                                required={
                                                                    isRequired
                                                                }
                                                            />
                                                        );

                                                    case 'time':
                                                        return (
                                                            <field.Time
                                                                label={f.label}
                                                                description={
                                                                    f.description
                                                                }
                                                                disabled={
                                                                    isFieldDisabled
                                                                }
                                                                required={
                                                                    isRequired
                                                                }
                                                            />
                                                        );

                                                    case 'checkbox':
                                                        return (
                                                            <field.Checkbox
                                                                label={f.label}
                                                                description={
                                                                    f.description
                                                                }
                                                                disabled={
                                                                    isFieldDisabled
                                                                }
                                                                required={
                                                                    isRequired
                                                                }
                                                            />
                                                        );
                                                    case 'select':
                                                        return (
                                                            <field.Select
                                                                label={f.label}
                                                                description={
                                                                    f.description
                                                                }
                                                                disabled={
                                                                    isFieldDisabled
                                                                }
                                                                onValueChange={
                                                                    f.onValueChange
                                                                }
                                                                required={
                                                                    isRequired
                                                                }
                                                            >
                                                                {f.children}
                                                            </field.Select>
                                                        );
                                                    case 'leaflet':
                                                        return (
                                                            <field.Leaflet
                                                                label={f.label}
                                                                disabled={
                                                                    isFieldDisabled
                                                                }
                                                                required={
                                                                    isRequired
                                                                }
                                                            />
                                                        );
                                                    case 'multi-select':
                                                        return (
                                                            <field.MultiSelect
                                                                label={f.label}
                                                                disabled={
                                                                    isFieldDisabled
                                                                }
                                                                required={
                                                                    isRequired
                                                                }
                                                                single={
                                                                    f.single
                                                                }
                                                                placeholder={
                                                                    f.placeholder
                                                                }
                                                                shouldFilter={
                                                                    f.shouldFilter
                                                                }
                                                            >
                                                                {f.children}
                                                            </field.MultiSelect>
                                                        );
                                                    case 'checkbox-group':
                                                        return (
                                                            <field.CheckboxGroup
                                                                label={f.label}
                                                                description={
                                                                    f.description
                                                                }
                                                                disabled={
                                                                    isFieldDisabled
                                                                }
                                                                options={
                                                                    f.options
                                                                }
                                                                orientation={
                                                                    f.orientation
                                                                }
                                                                required={
                                                                    isRequired
                                                                }
                                                            >
                                                                {f.children}
                                                            </field.CheckboxGroup>
                                                        );
                                                    case 'radio-group':
                                                        return (
                                                            <field.RadioGroup
                                                                label={f.label}
                                                                description={
                                                                    f.description
                                                                }
                                                                disabled={
                                                                    isFieldDisabled
                                                                }
                                                                options={
                                                                    f.options
                                                                }
                                                                orientation={
                                                                    f.orientation
                                                                }
                                                                onValueChange={
                                                                    f.onValueChange
                                                                }
                                                                required={
                                                                    isRequired
                                                                }
                                                            >
                                                                {f.children}
                                                            </field.RadioGroup>
                                                        );
                                                    case 'toggle-group':
                                                        return (
                                                            <field.ToggleGroup
                                                                label={f.label}
                                                                description={
                                                                    f.description
                                                                }
                                                                disabled={
                                                                    isFieldDisabled
                                                                }
                                                                options={
                                                                    f.options
                                                                }
                                                                onValueChange={
                                                                    f.onValueChange
                                                                }
                                                                required={
                                                                    isRequired
                                                                }
                                                            >
                                                                {f.children}
                                                            </field.ToggleGroup>
                                                        );
                                                    case 'signature':
                                                        return (
                                                            <field.Signature
                                                                label={f.label}
                                                                description={
                                                                    f.description
                                                                }
                                                                disabled={
                                                                    isFieldDisabled
                                                                }
                                                                required={
                                                                    isRequired
                                                                }
                                                            />
                                                        );
                                                    default:
                                                        return null;
                                                }
                                            };

                                            return renderField();
                                        }}
                                    </form.AppField>
                                </div>
                            );
                        })}
                    </div>
                ))}

                </FieldGroup>

                {children && <div className="flex-1">{children}</div>}

                {Boolean(
                    showBackButton ||
                    mode === 'update' ||
                    mode === 'create' ||
                    mode === 'delete',
                ) && (
                    <div
                        className={cn(
                            actionsLayout === 'grid'
                                ? 'w-full grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/40'
                                : 'w-full flex flex-col-reverse md:flex-row justify-end items-center gap-3 pt-4 border-t border-border/40',
                            actionsClassName,
                        )}
                    >
                        {showBackButton && (
                            <Button
                                type="button"
                                className={cn(
                                    'w-full md:w-auto min-w-[110px]',
                                    actionsLayout === 'grid' && 'w-full',
                                )}
                                variant="secondary"
                                onClick={() =>
                                    canGoBack
                                        ? router.history.back()
                                        : router.navigate({ to: '/' })
                                }
                            >
                                {backLabel}
                            </Button>
                        )}

                        {(mode === 'update' || mode === 'create') && (
                            <Button
                                variant="default"
                                className={cn(
                                    'w-full md:w-auto min-w-[110px]',
                                    actionsLayout === 'grid' && 'w-full',
                                )}
                                type="submit"
                            >
                                {submitLabel}
                            </Button>
                        )}

                        {mode === 'delete' && (
                            <GenericAlertDialog onAction={form.handleSubmit}>
                                <Button
                                    variant="destructive"
                                    className={cn(
                                        'w-full md:w-auto min-w-[110px]',
                                        actionsLayout === 'grid' && 'w-full',
                                    )}
                                    type="button"
                                >
                                    Eliminar
                                </Button>
                            </GenericAlertDialog>
                        )}
                    </div>
                )}
            </div>
        </form>
    );
}


