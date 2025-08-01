/**
 * A type predicate function that determines if an unknown value is of type T.
 *
 * @template T The type to validate against
 * @param obj The value to validate
 * @returns True if the object is of type T, false otherwise
 *
 * @example
 * ```typescript
 * const isString: TypeGuardPredicate<string> = (obj): obj is string => typeof obj === 'string';
 *
 * if (isString(someValue)) {
 *   // someValue is now typed as string
 *   console.log(someValue.toUpperCase());
 * }
 * ```
 */
export type TypeGuardPredicate<T> = (obj: unknown) => obj is T;