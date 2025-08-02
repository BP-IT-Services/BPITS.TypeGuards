import { Nullish } from "../nullish";
import { TypeGuardPredicate } from "../../type-guard-predicate";

/**
 * Factory function that creates nullable variants of type guards.
 *
 * This factory enables creating type guards that validate the original type T or specific nullish values.
 * It provides fine-grained control over which nullish values (null, undefined, or both) are considered valid.
 *
 * **Usage Patterns:**
 * - `guard.nullable()` - Allows both null and undefined
 * - `guard.nullable(null)` - Allows only null (not undefined)
 * - `guard.nullable(undefined)` - Allows only undefined (not null)
 * - `guard.nullable(null, undefined)` - Explicitly allows both (same as no parameters)
 *
 * @template T The base type being validated
 * @template TNull The specific nullish type(s) to allow (null, undefined, or both)
 *
 * @example
 * ```typescript
 * // Create base type guard
 * const stringGuard = CommonTypeGuards.basics.string();
 *
 * // Create nullable variants
 * const stringOrBoth = stringGuard.nullable();           // string | null | undefined
 * const stringOrNull = stringGuard.nullable(null);       // string | null
 * const stringOrUndefined = stringGuard.nullable(undefined); // string | undefined
 *
 * // Usage in validation
 * if (stringOrNull(value)) {
 *   // value is now typed as string | null
 *   if (value !== null) {
 *     console.log(value.toUpperCase()); // Safe to use string methods
 *   }
 * }
 * ```
 */
export type NullableVariantFactory<T> = <TNull extends Nullish = Nullish>(...nullishValues: TNull[]) => TypeGuardPredicate<T | TNull>;