import { CommonTypeGuards, StrictTypeGuardBuilder } from "../imports";

type User = {
    name: string;
    ageYears: number;
    dateOfBirth: Date;
}

const invalidPropertiesBuilder = StrictTypeGuardBuilder
    .start<User>('User')
    .validateProperty('name', CommonTypeGuards.date.date()) // Should be string
    .validateProperty('ageYears', CommonTypeGuards.basics.string()) // Should be number
    .validateProperty('dateOfBirth', CommonTypeGuards.basics.string()) // Should be Date
    .build();

