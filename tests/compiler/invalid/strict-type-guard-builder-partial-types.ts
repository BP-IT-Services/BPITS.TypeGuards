import { CommonTypeGuards, StrictTypeGuardBuilder } from "../../../src";

type User = {
    name: string  | null | undefined;
    email: string  | null | undefined;
    age: number | null
    responseTime: number | null
}

const isUser = StrictTypeGuardBuilder
    .start<User>('User')
    .validateProperty('name', CommonTypeGuards.basics.string()) // should have .nullable()
    .validateProperty('email', CommonTypeGuards.basics.string().nullable(null)) // should have .nullable()
    .validateProperty('age', CommonTypeGuards.basics.number()) // should have .nullable(null)
    .validateProperty('responseTime', CommonTypeGuards.basics.number().nullable()) // should have .nullable(null)
    .build();