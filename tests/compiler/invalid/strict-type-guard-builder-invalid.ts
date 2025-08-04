import { StrictTypeGuardBuilder } from "@bpits/type-guards";

type User = {
    name: string;
    age: number;
    email?: string;
}

const missingPropertiesOne = StrictTypeGuardBuilder
    .start<User>('User')
    .validateProperty('age', (obj: unknown): obj is number => typeof obj === 'number')
    .ignoreProperty('email')
    .build();


const missingPropertiesTwo = StrictTypeGuardBuilder
    .start<User>('User')
    .validateProperty('name', (obj: unknown): obj is string => typeof obj === 'string')
    .validateProperty('email', (obj: unknown): obj is string | undefined => obj === undefined || typeof obj === 'string')
    .build().nullable();

