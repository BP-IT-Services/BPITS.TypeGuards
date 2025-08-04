import { TypeGuardPredicate, TypeGuardPredicateWithNullable } from "../types";
import { Nullish } from "../types/internal/nullish";
import { NullableVariantFactory } from "../types/internal/type-guards/nullable-variant-factory";

/**
 * Factory interface that provides both base type guard creation and nullable variants.
 *
 * This interface represents the **legacy/obsolete pattern** for creating nullable type guards.
 * The old syntax `CommonTypeGuards.basics.string().nullable()` uses this factory pattern.
 *
 * @deprecated The `.nullable()` property access pattern is obsolete.
 * Use the new function call pattern instead: `CommonTypeGuards.basics.string().nullable()`
 *
 * **Migration Guide:**
 * ```typescript
 * // OLD (obsolete) - direct property access
 * const oldWay = CommonTypeGuards.basics.string().nullable();
 * const oldWayNull = CommonTypeGuards.basics.string().nullable(null);
 *
 * // NEW (recommended) - function call then .nullable()
 * const newWay = CommonTypeGuards.basics.string().nullable();
 * const newWayNull = CommonTypeGuards.basics.string().nullable(null);
 * ```
 *
 * **Why migrate?**
 * - Consistent syntax across all type guards in the library
 * - Better IntelliSense and type inference
 * - More intuitive API design (function call, then method call)
 * - Aligns with builder pattern used elsewhere in the library
 *
 * @template T The base type being validated
 *
 * @example
 * ```typescript
 * // ❌ OBSOLETE - This pattern still works but is deprecated
 * const legacyStringGuard = CommonTypeGuards.basics.string().nullable();
 * const legacyArrayGuard = CommonTypeGuards.array.array().nullable(null);
 *
 * // ✅ RECOMMENDED - Use this pattern instead
 * const modernStringGuard = CommonTypeGuards.basics.string().nullable();
 * const modernArrayGuard = CommonTypeGuards.array.array().nullable(null);
 *
 * // Both patterns produce the same runtime behavior:
 * legacyStringGuard("hello");  // ✓ true
 * modernStringGuard("hello");  // ✓ true
 * legacyStringGuard(null);     // ✓ true
 * modernStringGuard(null);     // ✓ true
 * ```
 */
type TypeGuardFactoryWithNullable<T> = {
    (): TypeGuardPredicateWithNullable<T>;
    nullable: NullableVariantFactory<T>;
};

/**
 * A collection of commonly used type guard predicates for basic TypeScript types.
 *
 * This class provides pre-built type guards for primitive types, nullable types, dates, and arrays.
 * All methods return type guard functions that support nullable variants via the `.nullable()` method.
 *
 * @example
 * ```typescript
 * import { CommonTypeGuards } from '@bpits/type-guards';
 *
 * // Basic usage
 * const isString = CommonTypeGuards.basics.string();
 * if (isString(someValue)) {
 *   // someValue is now typed as string
 * }
 *
 * // With nullable types - specify exactly which nullish values to allow
 * const isStringOrNull = CommonTypeGuards.basics.string().nullable(null);
 * const isStringOrUndefined = CommonTypeGuards.basics.string().nullable(undefined);
 * const isStringOrNullish = CommonTypeGuards.basics.string().nullable(); // both null and undefined
 * ```
 */
export abstract class CommonTypeGuards {
    private static makeNullableFunction<T>(baseTypeGuard: TypeGuardPredicate<T>): NullableVariantFactory<T> {
        return <TNull extends Nullish = Nullish>(...nullishValues: TNull[]) => {
            return (obj: unknown): obj is T | TNull => {
                if (obj === null || obj === undefined) {
                    return CommonTypeGuards.basics.nullish(obj, ...nullishValues);
                }

                return baseTypeGuard(obj);
            };
        }

    };

    // TODO: in v2.x.x - change from using `TypeGuardFactoryWithNullable` to directly returning `TypeGuardPredicateWithNullable`
    private static createNullableTypeGuard<T>(
        baseGuard: TypeGuardPredicate<T>
    ): TypeGuardFactoryWithNullable<T> {
        const nullableFunction = CommonTypeGuards.makeNullableFunction(baseGuard);

        // Attach nullable() to the guard itself
        const nullableBaseGuard = baseGuard as TypeGuardPredicateWithNullable<T>;
        nullableBaseGuard.nullable = nullableFunction;

        // Attach nullable() to the factory as well for backwards-compatibility
        const guardFactory = (() => baseGuard) as TypeGuardFactoryWithNullable<T>;
        guardFactory.nullable = nullableFunction

        return guardFactory;
    }

    public static basics = {
        /**
         * Validates that a value is null, undefined, or one of the specified nullish values.
         *
         * @template TNull The specific nullish type to validate against
         * @param obj The value to validate
         * @param nullishValues Optional specific nullish values to allow. Defaults to [null, undefined]
         * @returns True if the value is one of the allowed nullish values
         *
         * @example
         * ```typescript
         * // Allow null and undefined (default)
         * CommonTypeGuards.basics.nullish(value)
         *
         * // Allow only null
         * CommonTypeGuards.basics.nullish(value, null)
         *
         * // Allow only undefined
         * CommonTypeGuards.basics.nullish(value, undefined)
         * ```
         */
        nullish: <TNull extends Nullish>(obj: unknown, ...nullishValues: TNull[]): obj is TNull => {
            const allowedNullish = nullishValues.length ? nullishValues : [ null, undefined ] as TNull[];
            return allowedNullish.includes(obj as TNull)
        },

        /**
         * Creates a type guard that validates string values.
         *
         * @returns A type guard function for string validation with nullable support
         *
         * @example
         * ```typescript
         * // Basic string validation
         * const stringGuard = CommonTypeGuards.basics.string();
         * if (stringGuard(value)) {
         *   // value is now typed as string
         *   console.log(value.toUpperCase());
         * }
         *
         * // Nullable variants
         * const stringOrNull = CommonTypeGuards.basics.string().nullable(null);
         * const stringOrUndefined = CommonTypeGuards.basics.string().nullable(undefined);
         * const stringOrNullish = CommonTypeGuards.basics.string().nullable(); // allows both null and undefined
         * ```
         */
        string: CommonTypeGuards.createNullableTypeGuard((obj: unknown): obj is string => typeof obj === 'string'),

        /**
         * Creates a type guard that validates string values.
         *
         * @returns A type guard function for string validation with nullable support
         *
         * @example
         * ```typescript
         * // Basic string validation
         * const stringGuard = CommonTypeGuards.basics.string();
         * if (stringGuard(value)) {
         *   // value is now typed as string
         *   console.log(value.toUpperCase());
         * }
         *
         * // Nullable variants
         * const stringOrNull = CommonTypeGuards.basics.string().nullable(null);
         * const stringOrUndefined = CommonTypeGuards.basics.string().nullable(undefined);
         * const stringOrNullish = CommonTypeGuards.basics.string().nullable(); // allows both null and undefined
         * ```
         */
        number: CommonTypeGuards.createNullableTypeGuard((obj: unknown): obj is number => typeof obj === 'number'),

        /**
         * Creates a type guard that validates boolean values.
         *
         * @returns A type guard function for boolean validation with nullable support
         *
         * @example
         * ```typescript
         * // Basic boolean validation
         * const booleanGuard = CommonTypeGuards.basics.boolean();
         * if (booleanGuard(value)) {
         *   // value is now typed as boolean
         *   console.log(value ? 'true' : 'false');
         * }
         *
         * // Nullable variants for feature flags
         * const enableNewUI = CommonTypeGuards.basics.boolean().nullable(null); // null = use system default
         * const betaFeatures = CommonTypeGuards.basics.boolean().nullable(undefined); // undefined = not set by user
         * ```
         */
        boolean: CommonTypeGuards.createNullableTypeGuard((obj: unknown): obj is boolean => typeof obj === 'boolean'),

        /**
         * Creates a type guard that validates object values (including arrays and null).
         *
         * @returns A type guard function for object validation with nullable support
         *
         * @example
         * ```typescript
         * // Basic object validation
         * const objectGuard = CommonTypeGuards.basics.object();
         * if (objectGuard(value)) {
         *   // value is now typed as object
         *   console.log(Object.keys(value));
         * }
         *
         * // Nullable variants
         * const objectOrNull = CommonTypeGuards.basics.object().nullable(null);
         * const objectOrUndefined = CommonTypeGuards.basics.object().nullable(undefined);
         * const objectOrNullish = CommonTypeGuards.basics.object().nullable();
         * ```
         */
        object: CommonTypeGuards.createNullableTypeGuard((obj: unknown): obj is object => typeof obj === 'object'),

        /**
         * Creates a type guard that validates string values or specified nullish values.
         *
         * @deprecated Use `CommonTypeGuards.basics.string().nullable()` instead. This method will be removed in a future version.
         *
         * **Migration Guide:**
         * - `nullableString()` → `string.nullable()`
         * - `nullableString(null)` → `string.nullable(null)`
         * - `nullableString(undefined)` → `string.nullable(undefined)`
         * - `nullableString(null, undefined)` → `string.nullable()` or `string.nullable(null, undefined)`
         *
         * **Customizable Nullish Values**: You can specify exactly which nullish values are allowed
         * by passing them as parameters. This gives you fine-grained control over what constitutes
         * "nullable" for your specific use case.
         *
         * @template TNull The specific nullish type to allow
         * @param nullishValues Optional specific nullish values to allow. If not provided, defaults to both null and undefined
         * @returns A type guard function for nullable string validation
         *
         * @example
         * ```typescript
         * // OLD (deprecated) - these examples still work but are deprecated
         * const defaultNullable = CommonTypeGuards.basics.nullableString();
         * const stringOrNull = CommonTypeGuards.basics.nullableString(null);
         * const stringOrUndefined = CommonTypeGuards.basics.nullableString(undefined);
         *
         * // NEW (recommended) - use these instead
         * const defaultNullable = CommonTypeGuards.basics.string().nullable();
         * const stringOrNull = CommonTypeGuards.basics.string().nullable(null);
         * const stringOrUndefined = CommonTypeGuards.basics.string().nullable(undefined);
         * ```
         */
        nullableString: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<string | TNull> => (obj: unknown): obj is string | TNull => {
            return typeof obj === 'string' || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },

        /**
         * Creates a type guard that validates number values or specified nullish values.
         *
         * @deprecated Use `CommonTypeGuards.basics.number().nullable()` instead. This method will be removed in a future version.
         *
         * **Migration Guide:**
         * - `nullableNumber()` → `number.nullable()`
         * - `nullableNumber(null)` → `number.nullable(null)`
         * - `nullableNumber(undefined)` → `number.nullable(undefined)`
         * - `nullableNumber(null, undefined)` → `number.nullable()` or `number.nullable(null, undefined)`
         *
         * **Customizable Nullish Values**: You can specify exactly which nullish values are allowed
         * by passing them as parameters, giving you precise control over nullable behavior.
         *
         * @template TNull The specific nullish type to allow
         * @param nullishValues Optional specific nullish values to allow. If not provided, defaults to both null and undefined
         * @returns A type guard function for nullable number validation
         *
         * @example
         * ```typescript
         * // OLD (deprecated) - these examples still work but are deprecated
         * const defaultNullable = CommonTypeGuards.basics.nullableNumber();
         * const numberOrNull = CommonTypeGuards.basics.nullableNumber(null);
         * const numberOrUndefined = CommonTypeGuards.basics.nullableNumber(undefined);
         *
         * // NEW (recommended) - use these instead
         * const defaultNullable = CommonTypeGuards.basics.number().nullable();
         * const numberOrNull = CommonTypeGuards.basics.number().nullable(null);
         * const numberOrUndefined = CommonTypeGuards.basics.number().nullable(undefined);
         * ```
         */
        nullableNumber: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<number | TNull> => (obj: unknown): obj is number | TNull => {
            return typeof obj === 'number' || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },

        /**
         * Creates a type guard that validates boolean values or specified nullish values.
         *
         * @deprecated Use `CommonTypeGuards.basics.boolean().nullable()` instead. This method will be removed in a future version.
         *
         * **Migration Guide:**
         * - `nullableBoolean()` → `boolean.nullable()`
         * - `nullableBoolean(null)` → `boolean.nullable(null)`
         * - `nullableBoolean(undefined)` → `boolean.nullable(undefined)`
         * - `nullableBoolean(null, undefined)` → `boolean.nullable()` or `boolean.nullable(null, undefined)`
         *
         * **Customizable Nullish Values**: You can specify exactly which nullish values are allowed
         * by passing them as parameters, providing precise control over what constitutes "nullable".
         *
         * @template TNull The specific nullish type to allow
         * @param nullishValues Optional specific nullish values to allow. If not provided, defaults to both null and undefined
         * @returns A type guard function for nullable boolean validation
         *
         * @example
         * ```typescript
         * // OLD (deprecated) - these examples still work but are deprecated
         * const defaultNullable = CommonTypeGuards.basics.nullableBoolean();
         * const booleanOrNull = CommonTypeGuards.basics.nullableBoolean(null);
         * const booleanOrUndefined = CommonTypeGuards.basics.nullableBoolean(undefined);
         *
         * // NEW (recommended) - use these instead
         * const defaultNullable = CommonTypeGuards.basics.boolean().nullable();
         * const booleanOrNull = CommonTypeGuards.basics.boolean().nullable(null);
         * const booleanOrUndefined = CommonTypeGuards.basics.boolean().nullable(undefined);
         * ```
         */
        nullableBoolean: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<boolean | TNull> => (obj: unknown): obj is boolean | TNull => {
            return typeof obj === 'boolean' || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },

        /**
         * Creates a type guard that validates object values or specified nullish values.
         *
         * @deprecated Use `CommonTypeGuards.basics.object().nullable()` instead. This method will be removed in a future version.
         *
         * **Migration Guide:**
         * - `nullableObject()` → `object.nullable()`
         * - `nullableObject(null)` → `object.nullable(null)`
         * - `nullableObject(undefined)` → `object.nullable(undefined)`
         * - `nullableObject(null, undefined)` → `object.nullable()` or `object.nullable(null, undefined)`
         *
         * **Customizable Nullish Values**: You can specify exactly which nullish values are allowed
         * by passing them as parameters, giving you fine-grained control over nullable object validation.
         *
         * Note: `null` is always considered an object, even if you don't specify `null` as a nullish value.
         *
         * @template TNull The specific nullish type to allow
         * @param nullishValues Optional specific nullish values to allow. If not provided, defaults to both null and undefined
         * @returns A type guard function for nullable object validation
         *
         * @example
         * ```typescript
         * // OLD (deprecated) - these examples still work but are deprecated
         * const defaultNullable = CommonTypeGuards.basics.nullableObject();
         * const objectOrNull = CommonTypeGuards.basics.nullableObject(null);
         * const objectOrUndefined = CommonTypeGuards.basics.nullableObject(undefined);
         *
         * // NEW (recommended) - use these instead
         * const defaultNullable = CommonTypeGuards.basics.object().nullable();
         * const objectOrNull = CommonTypeGuards.basics.object().nullable(null);
         * const objectOrUndefined = CommonTypeGuards.basics.object().nullable(undefined);
         * ```
         */
        nullableObject: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<object | TNull> => (obj: unknown): obj is object | TNull => {
            return typeof obj === 'object' || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },
    };


    /**
     * Type guards for Date objects and date strings.
     *
     * @example
     * ```typescript
     * // Validate a Date object
     * .validateProperty('createdAt', CommonTypeGuards.date.date())
     *
     * // Validate an ISO date string
     * .validateProperty('timestamp', CommonTypeGuards.date.dateString())
     *
     * // Validate nullable date
     * .validateProperty('updatedAt', CommonTypeGuards.date.nullableDate())
     * ```
     */
    public static date = {
        /**
         * Creates a type guard that validates Date objects.
         *
         * @returns A type guard function for Date validation with nullable support
         *
         * @example
         * ```typescript
         * // Basic Date validation
         * const dateGuard = CommonTypeGuards.date.date();
         * if (dateGuard(value)) {
         *   // value is now typed as Date
         *   console.log(value.getFullYear());
         * }
         *
         * // Nullable variants for database entities
         * const createdAt = CommonTypeGuards.date.date(); // Always present
         * const updatedAt = CommonTypeGuards.date.date().nullable(null); // null when never updated
         * const lastLogin = CommonTypeGuards.date.date().nullable(undefined); // undefined when never logged in
         * ```
         */
        date: CommonTypeGuards.createNullableTypeGuard((obj: unknown): obj is Date => obj instanceof Date),

        /**
         * Creates a type guard that validates strings that can be parsed as valid dates.
         *
         * @returns A type guard function for date string validation with nullable support
         *
         * @example
         * ```typescript
         * // Basic date string validation
         * const dateStringGuard = CommonTypeGuards.date.dateString();
         * if (dateStringGuard(value)) {
         *   // value is a valid date string
         *   const date = new Date(value);
         * }
         *
         * // Nullable variants for API timestamps
         * const timestamp = CommonTypeGuards.date.dateString(); // Always present as ISO string
         * const completedAt = CommonTypeGuards.date.dateString().nullable(null); // null when not completed
         * const archivedAt = CommonTypeGuards.date.dateString().nullable(undefined); // undefined when not archived
         * ```
         */
        dateString: CommonTypeGuards.createNullableTypeGuard((obj: unknown): obj is string => typeof obj === 'string' && new Date(obj).toString() !== 'Invalid Date'),

        /**
         * Creates a type guard that validates Date objects or specified nullish values.
         *
         * @deprecated Use `CommonTypeGuards.date.date().nullable()` instead. This method will be removed in a future version.
         *
         * **Migration Guide:**
         * - `nullableDate()` → `date.nullable()`
         * - `nullableDate(null)` → `date.nullable(null)`
         * - `nullableDate(undefined)` → `date.nullable(undefined)`
         * - `nullableDate(null, undefined)` → `date.nullable()` or `date.nullable(null, undefined)`
         *
         * **Customizable Nullish Values**: You can specify exactly which nullish values are allowed
         * by passing them as parameters, providing precise control over nullable Date validation.
         *
         * @template TNull The specific nullish type to allow
         * @param nullishValues Optional specific nullish values to allow. If not provided, defaults to both null and undefined
         * @returns A type guard function for nullable Date validation
         *
         * @example
         * ```typescript
         * // OLD (deprecated) - these examples still work but are deprecated
         * const defaultNullable = CommonTypeGuards.date.nullableDate();
         * const dateOrNull = CommonTypeGuards.date.nullableDate(null);
         * const dateOrUndefined = CommonTypeGuards.date.nullableDate(undefined);
         *
         * // NEW (recommended) - use these instead
         * const defaultNullable = CommonTypeGuards.date.date().nullable();
         * const dateOrNull = CommonTypeGuards.date.date().nullable(null);
         * const dateOrUndefined = CommonTypeGuards.date.date().nullable(undefined);
         * ```
         */
        nullableDate: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<Date | TNull> => (obj: unknown): obj is Date | TNull => {
            return (obj instanceof Date && obj.toString() !== 'Invalid Date') || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },

        /**
         * Creates a type guard that validates date strings or specified nullish values.
         *
         * @deprecated Use `CommonTypeGuards.date.dateString().nullable()` instead. This method will be removed in a future version.
         *
         * **Migration Guide:**
         * - `nullableDateString()` → `dateString.nullable()`
         * - `nullableDateString(null)` → `dateString.nullable(null)`
         * - `nullableDateString(undefined)` → `dateString.nullable(undefined)`
         * - `nullableDateString(null, undefined)` → `dateString.nullable()` or `dateString.nullable(null, undefined)`
         *
         * **Customizable Nullish Values**: You can specify exactly which nullish values are allowed
         * by passing them as parameters, giving you precise control over nullable date string validation.
         *
         * @template TNull The specific nullish type to allow
         * @param nullishValues Optional specific nullish values to allow. If not provided, defaults to both null and undefined
         * @returns A type guard function for nullable date string validation
         *
         * @example
         * ```typescript
         * // OLD (deprecated) - these examples still work but are deprecated
         * const defaultNullable = CommonTypeGuards.date.nullableDateString();
         * const dateStringOrNull = CommonTypeGuards.date.nullableDateString(null);
         * const dateStringOrUndefined = CommonTypeGuards.date.nullableDateString(undefined);
         *
         * // NEW (recommended) - use these instead
         * const defaultNullable = CommonTypeGuards.date.dateString().nullable();
         * const dateStringOrNull = CommonTypeGuards.date.dateString().nullable(null);
         * const dateStringOrUndefined = CommonTypeGuards.date.dateString().nullable(undefined);
         * ```
         */
        nullableDateString: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<string | TNull> => (obj: unknown): obj is string | TNull => {
            return (typeof obj === 'string' && new Date(obj).toString() !== 'Invalid Date') || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },
    };

    /**
     * Type guards for arrays and typed arrays.
     *
     * @example
     * ```typescript
     * // Validate any array
     * .validateProperty('items', CommonTypeGuards.array.array())
     *
     * // Validate an array of strings
     * .validateProperty('tags', CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.string()))
     *
     * // Validate nullable array of numbers
     * .validateProperty('scores', CommonTypeGuards.array.nullableArrayOf(CommonTypeGuards.basics.number()))
     * ```
     */
    public static array = {
        /**
         * Creates a type guard that validates arrays of any type.
         *
         * @returns A type guard function for array validation with nullable support
         *
         * @example
         * ```typescript
         * // Basic array validation
         * const arrayGuard = CommonTypeGuards.array.array();
         * if (arrayGuard(value)) {
         *   // value is now typed as Array<unknown>
         *   console.log(value.length);
         * }
         *
         * // Nullable variants for API responses
         * const results = CommonTypeGuards.array.array(); // Always an array
         * const suggestions = CommonTypeGuards.array.array().nullable(null); // null when no suggestions
         * const relatedItems = CommonTypeGuards.array.array().nullable(undefined); // undefined when not requested
         * ```
         */
        array: CommonTypeGuards.createNullableTypeGuard((obj: unknown): obj is Array<unknown> => Array.isArray(obj)),

        /**
         * Creates a type guard that validates arrays where every element matches the provided type guard.
         *
         * @template TChild The type of array elements to validate
         * @param typeGuard A type guard function to validate each array element
         * @returns A type guard function for typed array validation
         *
         * @example
         * ```typescript
         * // Array of strings
         * const stringArrayGuard = CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.string());
         *
         * // Array of custom objects
         * const userArrayGuard = CommonTypeGuards.array.arrayOf(isUser);
         *
         * // Two-dimensional array (array of arrays)
         * const stringMatrix = CommonTypeGuards.array.arrayOf(
         *   CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.string())
         * );
         * // This validates: string[][]
         *
         * // Three-dimensional array
         * const stringCube = CommonTypeGuards.array.arrayOf(
         *   CommonTypeGuards.array.arrayOf(
         *     CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.string())
         *   )
         * );
         * // This validates: string[][][]
         *
         * // Mixed two-dimensional array with numbers and nullable strings
         * interface DataGrid {
         *   headers: string[];
         *   rows: (string | null)[][];  // Each row can have nullable string cells
         * }
         *
         * const isDataGrid = StrictTypeGuardBuilder
         *   .start<DataGrid>('DataGrid')
         *   .validateProperty('headers', CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.string()))
         *   .validateProperty('rows', CommonTypeGuards.array.arrayOf(
         *     CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.nullableString(null))
         *   ))
         *   .build();
         *
         * // Usage examples
         * if (stringArrayGuard(value)) {
         *   // value is now typed as string[]
         *   value.forEach(str => str.toUpperCase());
         * }
         *
         * if (stringMatrix(matrix)) {
         *   // matrix is now typed as string[][]
         *   matrix.forEach(row => {
         *     row.forEach(cell => console.log(cell.length));
         *   });
         * }
         *
         * if (isDataGrid(gridData)) {
         *   // gridData.rows is (string | null)[][]
         *   gridData.rows.forEach((row, rowIndex) => {
         *     row.forEach((cell, colIndex) => {
         *       if (cell !== null) {
         *         console.log(`Cell [${rowIndex}][${colIndex}]: ${cell}`);
         *       }
         *     });
         *   });
         * }
         * ```
         */
        arrayOf: <TChild>(typeGuard: (childObj: unknown) => childObj is TChild): TypeGuardPredicateWithNullable<Array<TChild>> => {
            const baseArrayGuard = (obj: unknown): obj is Array<TChild> => {
                if (!Array.isArray(obj)) {
                    return false;
                }

                const membersValid = obj.every(typeGuard);
                if (!membersValid) {
                    console.warn('Validation failed for member of array');
                }

                return membersValid;
            };

            const nullableGuard = baseArrayGuard as TypeGuardPredicateWithNullable<Array<TChild>>;
            nullableGuard.nullable = CommonTypeGuards.makeNullableFunction(baseArrayGuard);

            return nullableGuard;
        },

        /**
         * Creates a type guard that validates arrays or specified nullish values.
         *
         * @deprecated Use `CommonTypeGuards.array.array().nullable()` instead. This method will be removed in a future version.
         *
         * **Migration Guide:**
         * - `nullableArray()` → `array.nullable()`
         * - `nullableArray(null)` → `array.nullable(null)`
         * - `nullableArray(undefined)` → `array.nullable(undefined)`
         * - `nullableArray(null, undefined)` → `array.nullable()` or `array.nullable(null, undefined)`
         *
         * **Customizable Nullish Values**: You can specify exactly which nullish values are allowed
         * by passing them as parameters, providing precise control over nullable array validation.
         *
         * @template TNull The specific nullish type to allow
         * @param nullishValues Optional specific nullish values to allow. If not provided, defaults to both null and undefined
         * @returns A type guard function for nullable array validation
         *
         * @example
         * ```typescript
         * // OLD (deprecated) - these examples still work but are deprecated
         * const defaultNullable = CommonTypeGuards.array.nullableArray();
         * const arrayOrNull = CommonTypeGuards.array.nullableArray(null);
         * const arrayOrUndefined = CommonTypeGuards.array.nullableArray(undefined);
         *
         * // NEW (recommended) - use these instead
         * const defaultNullable = CommonTypeGuards.array.array().nullable();
         * const arrayOrNull = CommonTypeGuards.array.array().nullable(null);
         * const arrayOrUndefined = CommonTypeGuards.array.array().nullable(undefined);
         * ```
         */
        nullableArray: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<Array<unknown> | TNull> => (obj: unknown): obj is Array<unknown> | TNull => {
            return Array.isArray(obj) || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },

        /**
         * Creates a type guard that validates typed arrays or specified nullish values.
         *
         * @deprecated Use `CommonTypeGuards.array.arrayOf(typeGuard).nullable()` instead. This method will be removed in a future version.
         *
         * **Migration Guide:**
         * - `nullableArrayOf(typeGuard)` → `arrayOf(typeGuard).nullable()`
         * - `nullableArrayOf(typeGuard, null)` → `arrayOf(typeGuard).nullable(null)`
         * - `nullableArrayOf(typeGuard, undefined)` → `arrayOf(typeGuard).nullable(undefined)`
         * - `nullableArrayOf(typeGuard, null, undefined)` → `arrayOf(typeGuard).nullable()` or `arrayOf(typeGuard).nullable(null, undefined)`
         *
         * **Customizable Nullish Values**: You can specify exactly which nullish values are allowed
         * by passing them as parameters, giving you precise control over nullable typed array validation.
         *
         * @template TChild The type of array elements to validate
         * @template TNull The specific nullish type to allow
         * @param typeGuard A type guard function to validate each array element
         * @param nullishValues Optional specific nullish values to allow. If not provided, defaults to both null and undefined
         * @returns A type guard function for nullable typed array validation
         *
         * @example
         * ```typescript
         * // OLD (deprecated) - these examples still work but are deprecated
         * const defaultNullable = CommonTypeGuards.array.nullableArrayOf(
         *   CommonTypeGuards.basics.string()
         * );
         * const stringArrayOrNull = CommonTypeGuards.array.nullableArrayOf(
         *   CommonTypeGuards.basics.string(),
         *   null
         * );
         *
         * // NEW (recommended) - use these instead
         * const defaultNullable = CommonTypeGuards.array.arrayOf(
         *   CommonTypeGuards.basics.string()
         * ).nullable();
         * const stringArrayOrNull = CommonTypeGuards.array.arrayOf(
         *   CommonTypeGuards.basics.string()
         * ).nullable(null);
         * ```
         */
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

    /**
     * Type guards for enums and object membership validation.
     *
     * @example
     * ```typescript
     * enum Color { Red = 'red', Green = 'green', Blue = 'blue' }
     * 
     * // Validate enum membership
     * const isColor = CommonTypeGuards.enums.memberOf(Color);
     * if (isColor(value)) {
     *   // value is now typed as Color
     * }
     * 
     * // With nullable variants
     * const isColorOrNull = CommonTypeGuards.enums.memberOf(Color).nullable(null);
     * ```
     */
    public static enums = {
        /**
         * Creates a type guard that validates whether a value is a member of an enum or object.
         * 
         * This function works with both numeric and string enums, as well as plain objects.
         * It checks if the input value matches any of the values in the provided enum/object.
         *
         * @template T The enum or object type to validate against
         * @param enumObject The enum or object to check membership against
         * @returns A type guard function for enum/object membership validation with nullable support
         *
         * @example
         * ```typescript
         * // String enum
         * enum Status { 
         *   Active = 'active', 
         *   Inactive = 'inactive', 
         *   Pending = 'pending' 
         * }
         * const isStatus = CommonTypeGuards.enums.memberOf(Status);
         * 
         * // Numeric enum
         * enum Priority { Low = 1, Medium = 2, High = 3 }
         * const isPriority = CommonTypeGuards.enums.memberOf(Priority);
         * 
         * // Plain object (acts like enum)
         * const Colors = { Red: 'red', Green: 'green', Blue: 'blue' } as const;
         * type Color = typeof Colors[keyof typeof Colors];
         * const isColor = CommonTypeGuards.enums.memberOf<Color>(Colors);
         * 
         * // Usage
         * if (isStatus('active')) {
         *   // value is now typed as Status
         *   console.log('Status is valid');
         * }
         * 
         * // With nullable variants
         * const isStatusOrNull = CommonTypeGuards.enums.memberOf(Status).nullable(null);
         * const isStatusOrUndefined = CommonTypeGuards.enums.memberOf(Status).nullable(undefined);
         * ```
         */
        memberOf: <T>(enumObject: Record<string | number, T>): TypeGuardPredicateWithNullable<T> => {
            const enumValues = Object.values(enumObject);
            const baseGuard = (obj: unknown): obj is T => {
                return enumValues.includes(obj as T);
            };

            const nullableGuard = baseGuard as TypeGuardPredicateWithNullable<T>;
            nullableGuard.nullable = CommonTypeGuards.makeNullableFunction(baseGuard);

            return nullableGuard;
        }
    }
}
