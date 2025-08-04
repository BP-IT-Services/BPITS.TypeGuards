import { Nullish } from "./nullish";
import {TypeGuardPredicateWithNullable} from "../type-guard-predicate-with-nullable";

/**
 * Return type for the `build` getter in TypeGuardBuilder.
 *
 * This type provides a flexible API for creating type guards with optional nullable variants.
 * The main function creates a standard type guard, while the `nullable` method creates variants
 * that also accept specified nullish values (null, undefined, or both).
 *
 * @template T The type that the type guard validates
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 * }
 *
 * const builder = TypeGuardBuilder
 *   .start<User>('User')
 *   .validateProperty('id', CommonTypeGuards.basics.string())
 *   .validateProperty('name', CommonTypeGuards.basics.string())
 *   .build(); // This returns a BuildResult<User>
 *
 * // Create a standard type guard
 * const isUser = builder(); // (value: unknown) => value is User
 *
 * // Create nullable variants
 * const isUserOrNull = builder.nullable(null); // (value: unknown) => value is User | null
 * const isUserOrUndefined = builder.nullable(undefined); // (value: unknown) => value is User | undefined
 * const isUserOrNullish = builder.nullable(); // (value: unknown) => value is User | null | undefined
 *
 * // Usage
 * if (isUser(someData)) {
 *   // someData is typed as User
 *   console.log(someData.name);
 * }
 *
 * if (isUserOrNull(nullableData)) {
 *   // nullableData is typed as User | null
 *   if (nullableData !== null) {
 *     console.log(nullableData.id);
 *   }
 * }
 * ```
 */
export type BuildResult<T> = {
    /**
     * Creates a type guard function that validates values of type T.
     *
     * @returns A type guard function that returns true if the value is of type T
     */
    (): TypeGuardPredicateWithNullable<T>;

    /**
     * Creates a nullable type guard function that validates values of type T or specified nullish values.
     *
     * @template TNull The specific nullish type(s) to allow (null, undefined, or both)
     * @param nullishValues Optional specific nullish values to allow. If not provided, defaults to both null and undefined
     * @returns A type guard function that returns true if the value is of type T or one of the specified nullish values
     *
     * @example
     * ```typescript
     * const builder = TypeGuardBuilder.start<string>('string')
     *   .validateRoot(CommonTypeGuards.basics.string())
     *   .build();
     *
     * // Allow string, null, and undefined
     * const stringOrNullish = builder.nullable();
     *
     * // Allow string and null only
     * const stringOrNull = builder.nullable(null);
     *
     * // Allow string and undefined only
     * const stringOrUndefined = builder.nullable(undefined);
     *
     * // Explicitly allow both null and undefined
     * const stringOrBoth = builder.nullable(null, undefined);
     * ```
     */
    nullable<TNull extends Nullish = null | undefined>(...nullishValues: TNull[]): (value: unknown) => value is T | TNull;
}
