export interface Person {
    id: number;
    firstName: string;
    lastName: string;
    dni: number;
    email?: string | null;
}

export interface PersonRequest {
    firstName: string;
    lastName: string;
    dni: number;
    email?: string | null;
}
