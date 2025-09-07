import { CommonTypeGuards, StrictTypeGuardBuilder } from "../../../src";

type User = {
    name: string  | null | undefined;
    email: string  | null | undefined;
    age: number | null
    responseTime: number | null
}

const isUser = StrictTypeGuardBuilder
    .start<User>('User')
    .validateProperty('name', CommonTypeGuards.basics.string().nullable())
    .validateProperty('email', CommonTypeGuards.basics.string().nullable())
    .validateProperty('age', CommonTypeGuards.basics.number().nullable(null))
    .validateProperty('responseTime', CommonTypeGuards.basics.number().nullable(null))
    .build();
