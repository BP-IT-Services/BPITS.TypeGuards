export type Person = {
    name: string;
    age: number;
    email?: string;
    isActive: boolean;
    birthDate: Date;
    hobbies: string[];
}

export type SimpleUser = {
    id: number;
    username: string;
}

export type OptionalFieldsTest = {
    required: string;
    optional?: number;
    nullable: string | null;
}