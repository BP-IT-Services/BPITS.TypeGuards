import { StrictTypeGuardBuilder } from '@bpits/type-guards';

type User = {
    name: string;
    age: number;
    email?: string;
}

const userGuardOne = StrictTypeGuardBuilder
    .start<User>('User')
    .validateProperty('name', (obj: unknown): obj is string => typeof obj === 'string')
    .validateProperty('age', (obj: unknown): obj is number => typeof obj === 'number')
    .ignoreProperty('email')
    .build();

const userGuardTwo = StrictTypeGuardBuilder
    .start<User>('User')
    .validateProperty('name', (obj: unknown): obj is string => typeof obj === 'string')
    .validateProperty('age', (obj: unknown): obj is number => typeof obj === 'number')
    .validateProperty('email', (obj: unknown): obj is string | undefined => obj === undefined || typeof obj === 'string')
    .build();

const userGuardThree = StrictTypeGuardBuilder
    .start<User>('User')
    .validateRoot((obj: unknown): obj is User => true)
    .build();

const userGuardFour = StrictTypeGuardBuilder
    .start<User>('User')
    .validateRoot((obj: unknown): obj is User => true)
    .build().nullable();

const userGuardFive = StrictTypeGuardBuilder
    .start<User>('User')
    .validateRoot((obj: unknown): obj is User => true)
    .build().nullable(null);

const userGuardSix = StrictTypeGuardBuilder
    .start<User>('User')
    .validateRoot((obj: unknown): obj is User => true)
    .build().nullable(null, undefined);
