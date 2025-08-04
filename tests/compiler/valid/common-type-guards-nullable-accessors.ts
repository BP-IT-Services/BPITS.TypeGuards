import { CommonTypeGuards } from "../imports";

const deprecatedNullableAccessors = [
    CommonTypeGuards.basics.string.nullable(),
    CommonTypeGuards.basics.number.nullable(),
    CommonTypeGuards.basics.boolean.nullable(),
    CommonTypeGuards.basics.object.nullable(),
];

const currentNullableAccessors = [
    CommonTypeGuards.basics.string().nullable(),
    CommonTypeGuards.basics.number().nullable(),
    CommonTypeGuards.basics.boolean().nullable(),
    CommonTypeGuards.basics.object().nullable(),
];