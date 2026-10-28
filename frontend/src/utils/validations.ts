export const firstLetterUppercase = (
    message: string = 'La primer letra debe ser mayúscula',
) => {
    return [
        (value: string) => value.charAt(0) === value.charAt(0).toUpperCase(),
        message,
    ] as const;
};

export const dateNotInFuture = (
    message: string = 'La fecha seleccionada no puede ser posterior al día de hoy',
) => {
    // return [(value: Date) => value <= new Date(), message] as const;
    return [(value: string) => new Date(value) <= new Date(), message] as const;
};
