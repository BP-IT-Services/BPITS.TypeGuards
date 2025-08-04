import { StrictTypeGuardBuilder } from '../imports';

type User = {
    name: string;
    age: number;
    email?: string;
}

const guardWithIgnoredOptionalProperty = StrictTypeGuardBuilder
    .start<User>('User')
    .validateProperty('name', (obj: unknown): obj is string => typeof obj === 'string')
    .validateProperty('age', (obj: unknown): obj is number => typeof obj === 'number')
    .ignoreProperty('email')
    .build();

const guardWithValidatedOptionalProperty = StrictTypeGuardBuilder
    .start<User>('User')
    .validateProperty('name', (obj: unknown): obj is string => typeof obj === 'string')
    .validateProperty('age', (obj: unknown): obj is number => typeof obj === 'number')
    .validateProperty('email', (obj: unknown): obj is string | undefined => obj === undefined || typeof obj === 'string')
    .build();