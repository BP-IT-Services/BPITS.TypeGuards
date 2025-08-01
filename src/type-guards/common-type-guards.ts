import { TypeGuardPredicate } from "../types";
import { Nullish } from "../types/internal/nullish";

/**
 * A collection of commonly used type guard predicates for basic TypeScript types.
 *
 * This class provides pre-built type guards for primitive types, nullable types, dates, and arrays.
 * All methods return type guard functions that can be used directly or composed with the TypeGuardBuilder classes.
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
 * // With nullable types
 * const isNullableNumber = CommonTypeGuards.basics.nullableNumber();
 * if (isNullableNumber(someValue)) {
 *   // someValue is now typed as number | null | undefined
 * }
 * ```
 */
export abstract class CommonTypeGuards {
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
            const allowedNullish = nullishValues.length ? nullishValues : [null, undefined] as TNull[];
            return allowedNullish.includes(obj as TNull)
        },

        /**
         * Creates a type guard that validates string values.
         *
         * @returns A type guard function for string validation
         *
         * @example
         * ```typescript
         * const stringGuard = CommonTypeGuards.basics.string();
         * if (stringGuard(value)) {
         *   // value is now typed as string
         *   console.log(value.toUpperCase());
         * }
         * ```
         */
        string: (): TypeGuardPredicate<string> => (obj: unknown): obj is string => typeof obj === 'string',

        /**
         * Creates a type guard that validates number values.
         *
         * @returns A type guard function for number validation
         *
         * @example
         * ```typescript
         * const numberGuard = CommonTypeGuards.basics.number();
         * if (numberGuard(value)) {
         *   // value is now typed as number
         *   console.log(value.toFixed(2));
         * }
         * ```
         */
        number: (): TypeGuardPredicate<number> => (obj: unknown): obj is number => typeof obj === 'number',

        /**
         * Creates a type guard that validates boolean values.
         *
         * @returns A type guard function for boolean validation
         *
         * @example
         * ```typescript
         * const booleanGuard = CommonTypeGuards.basics.boolean();
         * if (booleanGuard(value)) {
         *   // value is now typed as boolean
         *   console.log(value ? 'true' : 'false');
         * }
         * ```
         */
        boolean: (): TypeGuardPredicate<boolean> => (obj: unknown): obj is boolean => typeof obj === 'boolean',

        /**
         * Creates a type guard that validates object values (including arrays and null).
         *
         * @returns A type guard function for object validation
         *
         * @example
         * ```typescript
         * const objectGuard = CommonTypeGuards.basics.object();
         * if (objectGuard(value)) {
         *   // value is now typed as object
         *   console.log(Object.keys(value));
         * }
         * ```
         */
        object: (): TypeGuardPredicate<object> => (obj: unknown): obj is object => typeof obj === 'object',

        /**
         * Creates a type guard that validates string values or specified nullish values.
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
         * // Allow string, null, or undefined (default behavior)
         * const defaultNullable = CommonTypeGuards.basics.nullableString();
         * // Equivalent to: string | null | undefined
         *
         * // Allow string or only null (excludes undefined)
         * const stringOrNull = CommonTypeGuards.basics.nullableString(null);
         * // Equivalent to: string | null
         *
         * // Allow string or only undefined (excludes null)
         * const stringOrUndefined = CommonTypeGuards.basics.nullableString(undefined);
         * // Equivalent to: string | undefined
         *
         * // Explicitly allow both null and undefined
         * const explicitBoth = CommonTypeGuards.basics.nullableString(null, undefined);
         * // Equivalent to: string | null | undefined
         *
         * // Usage example
         * interface User {
         *   name: string;
         *   nickname: string | null; // API returns null when no nickname, never undefined
         * }
         *
         * const isUser = StrictTypeGuardBuilder
         *   .start<User>('User')
         *   .validateProperty('name', CommonTypeGuards.basics.string())
         *   .validateProperty('nickname', CommonTypeGuards.basics.nullableString(null)) // Only null allowed
         *   .build();
         * ```
         */
        nullableString: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<string | TNull> => (obj: unknown): obj is string | TNull => {
            return typeof obj === 'string' || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },

        /**
         * Creates a type guard that validates number values or specified nullish values.
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
         * // Allow number, null, or undefined (default)
         * const defaultNullable = CommonTypeGuards.basics.nullableNumber();
         *
         * // Allow number or only null
         * const numberOrNull = CommonTypeGuards.basics.nullableNumber(null);
         *
         * // Allow number or only undefined
         * const numberOrUndefined = CommonTypeGuards.basics.nullableNumber(undefined);
         *
         * // Usage in API response validation
         * interface Product {
         *   price: number | null; // API returns null for "price on request" items
         *   discount: number | undefined; // Optional field, omitted when no discount
         * }
         *
         * const isProduct = StrictTypeGuardBuilder
         *   .start<Product>('Product')
         *   .validateProperty('price', CommonTypeGuards.basics.nullableNumber(null))
         *   .validateProperty('discount', CommonTypeGuards.basics.nullableNumber(undefined))
         *   .build();
         * ```
         */
        nullableNumber: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<number | TNull> => (obj: unknown): obj is number | TNull => {
            return typeof obj === 'number' || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },

        /**
         * Creates a type guard that validates boolean values or specified nullish values.
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
         * // Allow boolean, null, or undefined (default)
         * const defaultNullable = CommonTypeGuards.basics.nullableBoolean();
         *
         * // Allow boolean or only null
         * const booleanOrNull = CommonTypeGuards.basics.nullableBoolean(null);
         *
         * // Allow boolean or only undefined
         * const booleanOrUndefined = CommonTypeGuards.basics.nullableBoolean(undefined);
         *
         * // Real-world example: feature flags
         * interface FeatureFlags {
         *   enableNewUI: boolean | null;        // null = use system default
         *   betaFeatures: boolean | undefined;  // undefined = not set by user
         * }
         *
         * const isFeatureFlags = StrictTypeGuardBuilder
         *   .start<FeatureFlags>('FeatureFlags')
         *   .validateProperty('enableNewUI', CommonTypeGuards.basics.nullableBoolean(null))
         *   .validateProperty('betaFeatures', CommonTypeGuards.basics.nullableBoolean(undefined))
         *   .build();
         * ```
         */
        nullableBoolean: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<boolean | TNull> => (obj: unknown): obj is boolean | TNull => {
            return typeof obj === 'boolean' || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },

        /**
         * Creates a type guard that validates object values or specified nullish values.
         *
         * **Customizable Nullish Values**: You can specify exactly which nullish values are allowed
         * by passing them as parameters, giving you fine-grained control over nullable object validation.
         *
         * Note: `null` is always considered an object, even if you don't specify `null`` as a nullish value.
         *
         * @template TNull The specific nullish type to allow
         * @param nullishValues Optional specific nullish values to allow. If not provided, defaults to both null and undefined
         * @returns A type guard function for nullable object validation
         *
         * @example
         * ```typescript
         * // Allow object, null, or undefined (default)
         * const defaultNullable = CommonTypeGuards.basics.nullableObject();
         *
         * // Allow object or only null
         * const objectOrNull = CommonTypeGuards.basics.nullableObject(null);
         *
         * // Allow object or only undefined (but, remember, null is also an object)
         * const objectOrUndefined = CommonTypeGuards.basics.nullableObject(undefined);
         *
         * // API response example
         * interface ApiResponse {
         *   data: Record<string, any> | null;      // null when no data available
         *   metadata: Record<string, any> | undefined; // undefined when not requested
         * }
         *
         * const isApiResponse = StrictTypeGuardBuilder
         *   .start<ApiResponse>('ApiResponse')
         *   .validateProperty('data', CommonTypeGuards.basics.nullableObject(null))
         *   .validateProperty('metadata', CommonTypeGuards.basics.nullableObject(undefined))
         *   .build();
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
         * @returns A type guard function for Date validation
         *
         * @example
         * ```typescript
         * const dateGuard = CommonTypeGuards.date.date();
         * if (dateGuard(value)) {
         *   // value is now typed as Date
         *   console.log(value.getFullYear());
         * }
         * ```
         */
        date: (): TypeGuardPredicate<Date> => (obj: unknown): obj is Date => obj instanceof Date,

        /**
         * Creates a type guard that validates strings that can be parsed as valid dates.
         *
         * @returns A type guard function for date string validation
         *
         * @example
         * ```typescript
         * const dateStringGuard = CommonTypeGuards.date.dateString();
         * if (dateStringGuard(value)) {
         *   // value is a valid date string
         *   const date = new Date(value);
         * }
         * ```
         */
        dateString: (): TypeGuardPredicate<string> => (obj: unknown): obj is string => typeof obj === 'string' && new Date(obj).toString() !== 'Invalid Date',

        /**
         * Creates a type guard that validates Date objects or specified nullish values.
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
         * // Allow Date, null, or undefined (default)
         * const defaultNullable = CommonTypeGuards.date.nullableDate();
         *
         * // Allow Date or only null
         * const dateOrNull = CommonTypeGuards.date.nullableDate(null);
         *
         * // Allow Date or only undefined
         * const dateOrUndefined = CommonTypeGuards.date.nullableDate(undefined);
         *
         * // Database entity example
         * interface User {
         *   createdAt: Date;
         *   updatedAt: Date | null;      // null when never updated
         *   lastLogin: Date | undefined; // undefined when never logged in
         * }
         *
         * const isUser = StrictTypeGuardBuilder
         *   .start<User>('User')
         *   .validateProperty('createdAt', CommonTypeGuards.date.date())
         *   .validateProperty('updatedAt', CommonTypeGuards.date.nullableDate(null))
         *   .validateProperty('lastLogin', CommonTypeGuards.date.nullableDate(undefined))
         *   .build();
         * ```
         */
        nullableDate: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<Date | TNull> => (obj: unknown): obj is Date | TNull => {
            return (obj instanceof Date && obj.toString() !== 'Invalid Date') || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },

        /**
         * Creates a type guard that validates date strings or specified nullish values.
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
         * // Allow valid date string, null, or undefined (default)
         * const defaultNullable = CommonTypeGuards.date.nullableDateString();
         *
         * // Allow valid date string or only null
         * const dateStringOrNull = CommonTypeGuards.date.nullableDateString(null);
         *
         * // Allow valid date string or only undefined
         * const dateStringOrUndefined = CommonTypeGuards.date.nullableDateString(undefined);
         *
         * // API timestamp example
         * interface EventLog {
         *   timestamp: string;              // Always present as ISO string
         *   completedAt: string | null;     // null when not completed
         *   archivedAt: string | undefined; // undefined when not archived
         * }
         *
         * const isEventLog = StrictTypeGuardBuilder
         *   .start<EventLog>('EventLog')
         *   .validateProperty('timestamp', CommonTypeGuards.date.dateString())
         *   .validateProperty('completedAt', CommonTypeGuards.date.nullableDateString(null))
         *   .validateProperty('archivedAt', CommonTypeGuards.date.nullableDateString(undefined))
         *   .build();
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
         * @returns A type guard function for array validation
         *
         * @example
         * ```typescript
         * const arrayGuard = CommonTypeGuards.array.array();
         * if (arrayGuard(value)) {
         *   // value is now typed as Array<unknown>
         *   console.log(value.length);
         * }
         * ```
         */
        array: (): TypeGuardPredicate<Array<unknown>> => (obj: unknown): obj is Array<unknown> => Array.isArray(obj),

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
        arrayOf: <TChild>(typeGuard: (childObj: unknown) => childObj is TChild): TypeGuardPredicate<Array<TChild>> => (obj: unknown): obj is Array<TChild> => Array.isArray(obj) && obj.every(typeGuard),

        /**
         * Creates a type guard that validates arrays or specified nullish values.
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
         * // Allow array, null, or undefined (default)
         * const defaultNullable = CommonTypeGuards.array.nullableArray();
         *
         * // Allow array or only null
         * const arrayOrNull = CommonTypeGuards.array.nullableArray(null);
         *
         * // Allow array or only undefined
         * const arrayOrUndefined = CommonTypeGuards.array.nullableArray(undefined);
         *
         * // API response example
         * interface SearchResponse {
         *   results: unknown[];               // Always an array
         *   suggestions: unknown[] | null;    // null when no suggestions available
         *   relatedItems: unknown[] | undefined; // undefined when not requested
         * }
         *
         * const isSearchResponse = StrictTypeGuardBuilder
         *   .start<SearchResponse>('SearchResponse')
         *   .validateProperty('results', CommonTypeGuards.array.array())
         *   .validateProperty('suggestions', CommonTypeGuards.array.nullableArray(null))
         *   .validateProperty('relatedItems', CommonTypeGuards.array.nullableArray(undefined))
         *   .build();
         * ```
         */
        nullableArray: <TNull extends Nullish = Nullish>(...nullishValues: TNull[]): TypeGuardPredicate<Array<unknown> | TNull> => (obj: unknown): obj is Array<unknown> | TNull => {
            return Array.isArray(obj) || CommonTypeGuards.basics.nullish(obj, ...nullishValues);
        },

        /**
         * Creates a type guard that validates typed arrays or specified nullish values.
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
         * // Allow string array, null, or undefined (default)
         * const defaultNullable = CommonTypeGuards.array.nullableArrayOf(
         *   CommonTypeGuards.basics.string()
         * );
         *
         * // Allow string array or only null
         * const stringArrayOrNull = CommonTypeGuards.array.nullableArrayOf(
         *   CommonTypeGuards.basics.string(),
         *   null
         * );
         *
         * // Allow string array or only undefined
         * const stringArrayOrUndefined = CommonTypeGuards.array.nullableArrayOf(
         *   CommonTypeGuards.basics.string(),
         *   undefined
         * );
         *
         * // E-commerce example
         * interface Product {
         *   tags: string[];                    // Always present, even if empty
         *   categories: string[] | null;       // null when uncategorized
         *   relatedProducts: string[] | undefined; // undefined when not computed
         * }
         *
         * const isProduct = StrictTypeGuardBuilder
         *   .start<Product>('Product')
         *   .validateProperty('tags', CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.string()))
         *   .validateProperty('categories', CommonTypeGuards.array.nullableArrayOf(
         *     CommonTypeGuards.basics.string(),
         *     null
         *   ))
         *   .validateProperty('relatedProducts', CommonTypeGuards.array.nullableArrayOf(
         *     CommonTypeGuards.basics.string(),
         *     undefined
         *   ))
         *   .build();
         *
         * // Usage
         * if (isProduct(data)) {
         *   // data.tags is string[]
         *   // data.categories is string[] | null
         *   // data.relatedProducts is string[] | undefined
         *
         *   if (data.categories) {
         *     // data.categories is now typed as string[] (null-checked)
         *     data.categories.forEach(cat => console.log(cat));
         *   }
         * }
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
}
