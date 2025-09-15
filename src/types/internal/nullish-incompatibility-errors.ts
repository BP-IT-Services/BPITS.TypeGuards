import { TypeGuardPredicate } from "../type-guard-predicate";

export type IncompatibleNullishTypeGuard<TMessage extends string> = `Incompatibile nullability: ${TMessage}`;

export type NullabilitySignature<T> =
    null extends T
        ? undefined extends T
            ? 'null-undefined'
            : 'null'
        : undefined extends T
            ? 'undefined'
            : 'none';

// Check if nullability signatures match
export type HasNullishCompatibility<TExpected, TProvided> =
    NullabilitySignature<TExpected> extends NullabilitySignature<TProvided>
        ? true
        : false;

// Check if the base types are compatible (ignoring nullability)
export type NullishTypesCompatible<TExpected, TProvided> =
    NonNullable<TProvided> extends NonNullable<TExpected> ? true : false;

// Check if the base types are compatible in either direction (for type guards)
export type TypesCompatible<TExpected, TProvided> =
    NonNullable<TProvided> extends NonNullable<TExpected>
        ? true  // Type guard is more specific than property type
        : NonNullable<TExpected> extends NonNullable<TProvided>
            ? true  // Property type is more specific than type guard
            : false;

// Generate descriptive error messages
export type NullabilityErrorMessage<TExpected, TProvided> =
    NullabilitySignature<TExpected> extends 'null-undefined'
        ? NullabilitySignature<TProvided> extends 'none'
            ? IncompatibleNullishTypeGuard<"Property expects 'null | undefined' but type guard doesn't handle nullability. Add .nullable()">
            : NullabilitySignature<TProvided> extends 'null'
                ? IncompatibleNullishTypeGuard<"Property expects 'null | undefined' but type guard only handles 'null'. Use .nullable() instead of .nullable(null)">
                : IncompatibleNullishTypeGuard<"Property expects 'null | undefined' but type guard only handles 'undefined'. Use .nullable() instead of .nullable(undefined)">
        : NullabilitySignature<TExpected> extends 'null'
            ? NullabilitySignature<TProvided> extends 'none'
                ? IncompatibleNullishTypeGuard<"Property expects 'null' but type guard doesn't handle it. Add .nullable(null)">
                : NullabilitySignature<TProvided> extends 'undefined'
                    ? IncompatibleNullishTypeGuard<"Property expects 'null' but type guard handles 'undefined'. Use .nullable(null) instead of .nullable(undefined)">
                    : IncompatibleNullishTypeGuard<"Property expects only 'null' but type guard handles 'null | undefined'. Use .nullable(null) instead of .nullable()">
            : NullabilitySignature<TExpected> extends 'undefined'
                ? NullabilitySignature<TProvided> extends 'none'
                    ? IncompatibleNullishTypeGuard<"Property expects 'undefined' but type guard doesn't handle it. Add .nullable(undefined)">
                    : NullabilitySignature<TProvided> extends 'null'
                        ? IncompatibleNullishTypeGuard<"Property expects 'undefined' but type guard handles 'null'. Use .nullable(undefined) instead of .nullable(null)">
                        : IncompatibleNullishTypeGuard<"Property expects only 'undefined' but type guard handles 'null | undefined'. Use .nullable(undefined) instead of .nullable()">
                : NullabilitySignature<TProvided> extends 'none'
                    ? TypeGuardPredicate<TProvided>  // Both non-nullable, this is fine
                    : IncompatibleNullishTypeGuard<"Property is not nullable but type guard handles nullability. Remove .nullable()">;