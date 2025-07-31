import { TypeGuardBuilder } from "./type-guard-builder";
import { StrictTypeGuardBuilder } from "./strict-type-guard-builder";
import { CommonTypeGuards } from "./type-guards";

export * from './type-guards';
export * from './types';

export {TypeGuardBuilder} from './type-guard-builder';
export {StrictTypeGuardBuilder} from './strict-type-guard-builder';



type User = {
    name: string;
    age: number;
    email: string | undefined | null;
}

// export const isUser = TypeGuardBuilder
//     .start<User>('User')
//     .validateProperty('name', (obj): obj is number => typeof obj === 'string')
//     .build();

export const isUser = StrictTypeGuardBuilder
    .start<User>('User')
    .validateProperty('name', (obj): obj is string => typeof obj === 'string')
    .validateProperty('age', (obj): obj is number => typeof obj === 'number')
    .validateProperty('email', CommonTypeGuards.basics.nullableString())
    .build();