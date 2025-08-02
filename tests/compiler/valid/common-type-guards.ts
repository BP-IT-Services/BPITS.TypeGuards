import { CommonTypeGuards } from "../../../src";

const oldNullableAccessors = [
    CommonTypeGuards.basics.string.nullable(),
    CommonTypeGuards.basics.number.nullable(),
    CommonTypeGuards.basics.boolean.nullable(),
    CommonTypeGuards.basics.object.nullable(),
];

const newNullableAccessors = [
    CommonTypeGuards.basics.string().nullable(),
    CommonTypeGuards.basics.number().nullable(),
    CommonTypeGuards.basics.boolean().nullable(),
    CommonTypeGuards.basics.object().nullable(),
];
