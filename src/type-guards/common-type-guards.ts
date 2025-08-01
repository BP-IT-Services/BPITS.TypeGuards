import { TypeGuardPredicate } from "../types";
type Nullish = null | undefined;

export abstract class CommonTypeGuards {
    public static basics = {
        nullish: <TNull extends Nullish>(obj: unknown, ...nullishValues: TNull[]): obj is TNull => {
            const allowedNullish = nullishValues.length ? nullishValues : [null, undefined] as TNull[];
            return allowedNullish.includes(obj as TNull)
        },

        string: (): TypeGuardPredicate<string> => (obj: unknown): obj is string => typeof obj === 'string',
        number: (): TypeGuardPredicate<number> => (obj: unknown): obj is number => typeof obj === 'number',
        boolean: (): TypeGuardPredicate<boolean> => (obj: unknown): obj is boolean => typeof obj === 'boolean',
        object: (): TypeGuardPredicate<object> => (obj: unknown): obj is object => typeof obj === 'object',

        nullableString: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<string | TNull> => (obj: unknown): obj is string | TNull => {
            return typeof obj === 'string' || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },
        nullableNumber: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<number | TNull> => (obj: unknown): obj is number | TNull => {
            return typeof obj === 'number' || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },
        nullableBoolean: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<boolean | TNull> => (obj: unknown): obj is boolean | TNull => {
            return typeof obj === 'boolean' || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },
        nullableObject: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<object | TNull> => (obj: unknown): obj is object | TNull => {
            return typeof obj === 'object' || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },
    };

    public static date = {
        date: (): TypeGuardPredicate<Date> => (obj: unknown): obj is Date => obj instanceof Date,
        dateString: (): TypeGuardPredicate<string> => (obj: unknown): obj is string => typeof obj === 'string' && new Date(obj).toString() !== 'Invalid Date',

        nullableDate: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<Date | TNull> => (obj: unknown): obj is Date | TNull => {
            return (obj instanceof Date && obj.toString() !== 'Invalid Date') || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },
        nullableDateString: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<string | TNull> => (obj: unknown): obj is string | TNull => {
            return (typeof obj === 'string' && new Date(obj).toString() !== 'Invalid Date') || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },
    };

    public static array = {
        array: (): TypeGuardPredicate<Array<unknown>> => (obj: unknown): obj is Array<unknown> => Array.isArray(obj),
        arrayOf: <TChild>(typeGuard: (childObj: unknown) => childObj is TChild): TypeGuardPredicate<Array<TChild>> => (obj: unknown): obj is Array<TChild> => Array.isArray(obj) && obj.every(typeGuard),

        nullableArray: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<Array<unknown> | TNull> => (obj: unknown): obj is Array<unknown> | TNull => {
            return Array.isArray(obj) || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },
        nullableArrayOf: <TChild, TNull extends Nullish = Nullish>(typeGuard: (childObj: unknown) => childObj is TChild, ...nullishValues: TNull[]): TypeGuardPredicate<Array<TChild> | TNull> => (obj: unknown): obj is Array<TChild> | TNull => {
            if (!Array.isArray(obj))
                return CommonTypeGuards.basics.nullish(obj, ...nullishValues)

            const membersValid = obj.every(typeGuard);
            if (!membersValid) {
                console.warn('Validation failed for member of array');
            }

            return membersValid;
        },
    };
}
