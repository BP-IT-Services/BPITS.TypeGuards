import { TypeGuardPredicate } from "./type-guard-predicate";
import { NullableVariantFactory } from "./internal/type-guards/nullable-variant-factory";

/**
 * Enhanced type guard predicate that includes nullable variant creation capabilities.
 *
 * This represents the **modern/recommended pattern** for type guards that support nullable variants.
 * Type guards created with the new syntax `CommonTypeGuards.basics.string()` return this enhanced type.
 *
 * This type combines a standard type guard predicate with the ability to create nullable variants
 * via the `.nullable()` method, providing a consistent and intuitive API across the library.
 *
 * **Key Benefits:**
 * - Consistent function-first syntax: `guard()` then `.nullable()`
 * - Better TypeScript inference and IntelliSense support
 * - Aligns with builder patterns used throughout the library
 * - More discoverable API through method chaining
 *
 * @template T The base type being validated by this type guard
 *
 * @example
 * ```typescript
 * // Create enhanced type guard using modern syntax
 * const stringGuard = CommonTypeGuards.basics.string(); // Returns TypeGuardPredicateWithNullable<string>
 *
 * // Use as regular type guard
 * if (stringGuard(value)) {
 *   // value is typed as string
 *   console.log(value.length);
 * }
 *
 * // Create nullable variants
 * const stringOrNull = stringGuard.nullable(null);       // string | null
 * const stringOrUndefined = stringGuard.nullable(undefined); // string | undefined
 * const stringOrBoth = stringGuard.nullable();           // string | null | undefined
 *
 * // Usage with complex types
 * const userGuard = StrictTypeGuardBuilder
 *   .start<User>('User')
 *   .validateProperty('name', CommonTypeGuards.basics.string()) // TypeGuardPredicateWithNullable<string>
 *   .validateProperty('email', CommonTypeGuards.basics.string())
 *   .build(); // Returns TypeGuardPredicateWithNullable<User>
 *
 * const nullableUserGuard = userGuard.nullable(null); // User | null
 *
 * // Array example
 * const stringArrayGuard = CommonTypeGuards.array.arrayOf(
 *   CommonTypeGuards.basics.string()
 * ); // Returns TypeGuardPredicateWithNullable<string[]>
 *
 * const nullableStringArray = stringArrayGuard.nullable(); // string[] | null | undefined
 * ```
 *
 * @see {@link NullableVariantFactory} For details on nullable variant creation
 * @see {@link TypeGuardFactoryWithNullable} For the obsolete legacy pattern
 */
export type TypeGuardPredicateWithNullable<T> = TypeGuardPredicate<T> & {
    /**
     * Creates a nullable variant of this type guard.
     *
     * @see {@link NullableVariantFactory} For parameter details and examples
     */
    nullable: NullableVariantFactory<T>;
}