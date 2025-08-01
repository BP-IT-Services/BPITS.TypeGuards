import { Nullish } from "./nullish";
import { MissingPropertiesError } from "./missing-properties-error";

/**
 * Return type for the `build` getter in StrictTypeGuardBuilder.
 *
 * This is a conditional type that enforces compile-time validation completeness:
 * - If all required properties have been validated (`keyof T extends TValidated`), it returns
 *   a BuildResult-like object with methods to create type guards
 * - If properties are missing validation, it returns a MissingPropertiesError type that
 *   prevents compilation and shows helpful error messages
 *
 * This type ensures that developers cannot accidentally create incomplete type guards by
 * forgetting to validate properties, providing maximum type safety at compile time.
 *
 * @template T The type that the type guard validates
 * @template TValidated Union type of properties that have been validated so far
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 *
 * // ✅ All properties validated - returns BuildResult-like object
 * const completeBuilder = StrictTypeGuardBuilder
 *   .start<User>('User')
 *   .validateProperty('id', CommonTypeGuards.basics.string())
 *   .validateProperty('name', CommonTypeGuards.basics.string())
 *   .validateProperty('email', CommonTypeGuards.basics.string())
 *   .build; // Type: BuildResult-like object
 *
 * const isUser = completeBuilder(); // ✅ Works - creates type guard
 * const isUserOrNull = completeBuilder.nullable(null); // ✅ Works - creates nullable variant
 *
 * // ❌ Missing properties - returns MissingPropertiesError
 * const incompleteBuilder = StrictTypeGuardBuilder
 *   .start<User>('User')
 *   .validateProperty('id', CommonTypeGuards.basics.string())
 *   .validateProperty('name', CommonTypeGuards.basics.string())
 *   // Missing 'email' property
 *   .build; // Type: MissingPropertiesError<"email">
 *
 * const badGuard = incompleteBuilder(); // ❌ Compile error: Cannot call MissingPropertiesError
 * // Error message: "Missing required properties: email"
 * // Hint: "Add validateProperty()/ignoreProperty() calls for the missing properties or use validateRoot() for custom validation"
 *
 * // ✅ Using validateRoot() satisfies all requirements
 * const rootValidatedBuilder = StrictTypeGuardBuilder
 *   .start<User>('User')
 *   .validateRoot((obj): obj is User => {
 *     // Custom validation logic for entire object
 *     return typeof obj === 'object' && obj !== null && 'id' in obj;
 *   })
 *   .build; // Type: BuildResult-like object (all properties satisfied)
 *
 * const isValidUser = rootValidatedBuilder(); // ✅ Works
 * ```
 */
export type ValidatedBuildResult<T, TValidated extends keyof T> = keyof T extends TValidated
    ? {
        /**
         * Creates a type guard function that validates values of type T.
         *
         * @returns A type guard function that returns true if the value is of type T
         */
        (): (value: unknown) => value is T;

        /**
         * Creates a nullable type guard function that validates values of type T or specified nullish values.
         *
         * @template TNull The specific nullish type(s) to allow (null, undefined, or both)
         * @param nullishValues Optional specific nullish values to allow. If not provided, defaults to both null and undefined
         * @returns A type guard function that returns true if the value is of type T or one of the specified nullish values
         */
        nullable<TNull extends Nullish = null | undefined>(...nullishValues: TNull[]): (value: unknown) => value is T | TNull;
    }
    : MissingPropertiesError<Exclude<keyof T, TValidated>>;
