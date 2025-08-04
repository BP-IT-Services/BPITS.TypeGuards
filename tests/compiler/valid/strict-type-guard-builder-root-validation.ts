import { StrictTypeGuardBuilder } from '../imports';

type User = {
    name: string;
    age: number;
    email?: string;
}

const basicRootValidationGuard = StrictTypeGuardBuilder
    .start<User>('User')
    .validateRoot((obj: unknown): obj is User => true)
    .build();

const nullableRootValidationGuard = StrictTypeGuardBuilder
    .start<User>('User')
    .validateRoot((obj: unknown): obj is User => true)
    .build().nullable();

const nullableWithNullGuard = StrictTypeGuardBuilder
    .start<User>('User')
    .validateRoot((obj: unknown): obj is User => true)
    .build().nullable(null);

const nullableWithNullAndUndefinedGuard = StrictTypeGuardBuilder
    .start<User>('User')
    .validateRoot((obj: unknown): obj is User => true)
    .build().nullable(null, undefined);