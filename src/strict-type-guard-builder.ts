import { TypeGuardPredicate } from "./types";
import { TypeGuardBuilder } from "./type-guard-builder";
import { MissingPropertiesError } from "./types/internal/missing-properties-error";
import { Nullish } from "./types/internal/nullish";

type ValidatedBuildResult<T, TValidated extends keyof T> = keyof T extends TValidated
    ? {
        (): (value: unknown) => value is T;
        nullable<TNull extends Nullish = null | undefined>(...nullishValues: TNull[]): (value: unknown) => value is T | TNull;
    }
    : MissingPropertiesError<Exclude<keyof T, TValidated>>;

/**
 * A strict, compile-time safe builder for creating type guard functions.
 *
 * This class enforces that all properties of the target type are either validated or explicitly ignored
 * before the type guard can be built. This provides maximum type safety and prevents developers from
 * accidentally forgetting to validate properties.
 *
 * The class uses TypeScript's type system to track which properties have been validated and will
 * show helpful compile-time errors if any properties are missing validation.
 *
 * @template T The type to create a type guard for
 * @template TValidated Union type of properties that have been validated (internal use)
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 *   age: number;
 * }
 *
 * // This will compile successfully
 * const isUser = StrictTypeGuardBuilder
 *   .start<User>('User')
 *   .validateProperty('id', CommonTypeGuards.basics.string())
 *   .validateProperty('name', CommonTypeGuards.basics.string())
 *   .validateProperty('email', CommonTypeGuards.basics.string())
 *   .validateProperty('age', CommonTypeGuards.basics.number())
 *   .build(); // ✅ All properties validated
 *
 * // This will show a compile error indicating missing properties
 * const incompleteUser = StrictTypeGuardBuilder
 *   .start<User>('User')
 *   .validateProperty('id', CommonTypeGuards.basics.string())
 *   .validateProperty('name', CommonTypeGuards.basics.string())
 *   // Missing 'email' and 'age'
 *   .build(); // ❌ Compile error: Missing required properties: "email" | "age"
 * ```
 */
export class StrictTypeGuardBuilder<T, TValidated extends keyof T = never> {
    private readonly _internalBuilder: TypeGuardBuilder<T>;

    /**
     * Creates a new StrictTypeGuardBuilder instance.
     *
     * @param rootTypeName Name of the type being validated. Used for console error/warning logging.
     *
     * @example
     * ```typescript
     * const builder = new StrictTypeGuardBuilder<User>('User');
     * // Or use the static factory method:
     * const builder = StrictTypeGuardBuilder.start<User>('User');
     * ```
     */
    constructor(rootTypeName: string) {
        this._internalBuilder = new TypeGuardBuilder<T>(rootTypeName);
    }

    /**
     * Validates the entire object at the root level using the provided type guard.
     * Multiple validators can be added - all must pass for the object to be valid.
     *
     * **Important**: Calling this method satisfies the strict validation requirement, allowing you to
     * call `build()` or `buildNullable()` immediately without validating individual properties.
     *
     * @param predicate A type guard function that validates the entire object
     * @returns A new builder instance with all properties marked as validated
     *
     * @example
     * ```typescript
     * const isValidUser = (obj: unknown): obj is User => {
     *   // Custom validation logic for the entire object
     *   return typeof obj === 'object'
     *     && obj !== null
     *     && 'id' in obj
     *     && typeof (obj as any).id === 'string';
     * };
     *
     * const userGuard = StrictTypeGuardBuilder
     *   .start<User>('User')
     *   .validateRoot(isValidUser) // Satisfies all property requirements
     *   .build(); // ✅ Can build immediately
     * ```
     */
    public validateRoot(predicate: (obj: unknown) => obj is T): StrictTypeGuardBuilder<T, keyof T> {
        this._internalBuilder.validateRoot(predicate);
        return this as unknown as StrictTypeGuardBuilder<T, keyof T>;
    }

    /**
     * Validates an individual property using the provided type guard.
     * Multiple validators can be added for the same property - all must pass for the property to be valid.
     *
     * @param property Property name to add validator for
     * @param predicate Type guard that will return true if the property is valid, false otherwise
     * @returns A new builder instance with the specified property marked as validated
     *
     * @example
     * ```typescript
     * const userGuard = StrictTypeGuardBuilder
     *   .start<User>('User')
     *   .validateProperty('id', CommonTypeGuards.basics.string())
     *   .validateProperty('email', (obj): obj is string => {
     *     return typeof obj === 'string' && obj.includes('@');
     *   })
     *   // Continue until all properties are validated...
     *   .build();
     * ```
     */
    public validateProperty<TProperty extends keyof T>(
        property: TProperty,
        predicate: TypeGuardPredicate<T[TProperty]>
    ): StrictTypeGuardBuilder<T, TValidated | TProperty> {
        this._internalBuilder.validateProperty(property, predicate);
        return this as unknown as StrictTypeGuardBuilder<T, TValidated | TProperty>;
    }

    /**
     * Ignore a property so that no warnings are shown at runtime.
     * This simply adds a validator of `() => true` and will not override
     * any existing validators added for this property.
     *
     * Use this for properties you don't want to validate (such as internal fields,
     * computed properties, or legacy fields you're planning to remove).
     *
     * @param property Name of the property to be ignored
     * @returns A new builder instance with the specified property marked as validated
     *
     * @example
     * ```typescript
     * interface ApiUser {
     *   id: string;
     *   name: string;
     *   _internal: any; // Legacy field we don't care about
     *   _computed: string; // Computed on the client
     * }
     *
     * const userGuard = StrictTypeGuardBuilder
     *   .start<ApiUser>('ApiUser')
     *   .validateProperty('id', CommonTypeGuards.basics.string())
     *   .validateProperty('name', CommonTypeGuards.basics.string())
     *   .ignoreProperty('_internal')   // No validation, no warnings
     *   .ignoreProperty('_computed')   // No validation, no warnings
     *   .build(); // ✅ All properties accounted for
     * ```
     */
    public ignoreProperty<TProperty extends keyof T>(property: TProperty): StrictTypeGuardBuilder<T, TValidated | TProperty> {
        this._internalBuilder.ignoreProperty(property);
        return this as unknown as StrictTypeGuardBuilder<T, TValidated | TProperty>;
    }

    /**
     * Build a type guard using the provided validators.
     *
     * **Compile-time Safety**: This method can only be called when one of these conditions is met:
     * 1. All properties have been validated using `validateProperty()` or ignored using `ignoreProperty()`
     * 2. At least one call to `validateRoot()` has been made
     *
     * If properties are missing validation, TypeScript will show a helpful compile error indicating
     * exactly which properties need attention.
     *
     * **Runtime Behavior**:
     * - Never throws exceptions - always returns boolean
     * - Negligible performance impact
     * - Compatible with ES5+ browsers and TypeScript 2.x+
     * - Shows warnings for validation failures (unless `TypeGuardBuilder.LogValueReceived = false`)
     * - Shows errors for properties with validation failures
     *
     * @returns A callable type guard function, or a compile error if properties are missing validation
     *
     * @example
     * ```typescript
     * // ✅ This compiles - all properties validated
     * const isUser = StrictTypeGuardBuilder
     *   .start<User>('User')
     *   .validateProperty('id', CommonTypeGuards.basics.string())
     *   .validateProperty('name', CommonTypeGuards.basics.string())
     *   .validateProperty('email', CommonTypeGuards.basics.string())
     *   .build(); // Note: double parentheses - build() returns a function that returns the guard
     *
     * // ❌ This shows compile error: "Missing required properties: email"
     * const incompleteUser = StrictTypeGuardBuilder
     *   .start<User>('User')
     *   .validateProperty('id', CommonTypeGuards.basics.string())
     *   .validateProperty('name', CommonTypeGuards.basics.string())
     *   .build(); // Compile error guides you to missing properties
     *
     * // Usage
     * const userData: unknown = getApiData();
     * if (isUser(userData)) {
     *   // userData is now fully typed as User
     *   console.log(userData.email.toLowerCase());
     * }
     * ```
     */
    public get build(): ValidatedBuildResult<T, TValidated>
    {
        return this._internalBuilder.build as ValidatedBuildResult<T, TValidated>;
    }

    /**
     * Build a nullable type guard using the provided validators.
     *
     * Similar to `build()`, but the resulting type guard will also accept null/undefined objects as valid.
     *
     * **Compile-time Safety**: Same requirements as `build()` - all properties must be validated or ignored,
     * or at least one root validator must be present.
     *
     * **Runtime Behavior**:
     * - Never throws exceptions - always returns boolean
     * - Returns true for null or undefined values
     * - For non-null values, applies the same validation as `build()`
     * - Negligible performance impact
     * - Compatible with ES5+ browsers and TypeScript 2.x+
     *
     * @returns A callable type guard function that accepts T | null | undefined, or a compile error if properties are missing validation
     *
     * @example
     * ```typescript
     * const isUserOrNull = StrictTypeGuardBuilder
     *   .start<User>('User')
     *   .validateProperty('id', CommonTypeGuards.basics.string())
     *   .validateProperty('name', CommonTypeGuards.basics.string())
     *   .validateProperty('email', CommonTypeGuards.basics.string())
     *   .build.nullable(); // Returns guard that accepts User | null | undefined
     *
     * // Usage
     * const userData: unknown = getOptionalApiData(); // might be null
     * if (isUserOrNull(userData)) {
     *   // userData is now typed as User | null | undefined
     *   if (userData) {
     *     // userData is now typed as User (null-checked)
     *     console.log(userData.name);
     *   } else {
     *     console.log('No user data available');
     *   }
     * }
     * ```
     */
    // public buildNullable<TNull extends Nullish = Nullish>(...nullishValues: TNull[]): keyof T extends TValidated
    //     ? (value: unknown) => value is T | TNull
    //     : MissingPropertiesError<Exclude<keyof T, TValidated>>;

    // public buildNullable<TNull extends Nullish = Nullish>(...nullishValues: TNull[]): () => (value: unknown) => value is T | null | undefined {
    //     const guard = this._internalBuilder.build.nullable()(...nullishValues);
    //     return (() => guard) as any;
    // }

    // public buildNullable<TNull extends Nullish = Nullish>(
    //     ...nullishValues: TNull[]
    // ): keyof T extends TValidated
    //     ? (value: unknown) => value is T | TNull
    //     : MissingPropertiesError<Exclude<keyof T, TValidated>>
    // {
    //     const mainFunction = () => () => {};
    //
    //     // Add the nullable method
    //     mainFunction.nullable = <TNull extends Nullish = null | undefined>(...nullishValues: TNull[]) => {
    //         const allowedNullish = nullishValues.length ? nullishValues : [null, undefined] as TNull[];
    //         return (obj: unknown): obj is T | TNull => {
    //             if (allowedNullish.includes(obj as TNull)) {
    //                 return true;
    //             }
    //             return baseGuard(obj);
    //         };
    //     };
    //
    //     return this._internalBuilder.build.nullable()(...nullishValues);
    //     // const allowedNullish = nullishValues.length ? nullishValues : [ null, undefined ] as TNull[];
    //     //
    //     // return ((obj: unknown): obj is T | TNull => {
    //     //     if (allowedNullish.includes(obj as TNull)) {
    //     //         return true;
    //     //     }
    //     //     return baseGuard(obj);
    //     // }) as any;
    // }

    /**
     * Create a StrictTypeGuardBuilder instance.
     *
     * This is the recommended way to start building a strict type guard.
     *
     * @param typeName Name of the type being validated. Used for console error/warning logging
     * @returns A new StrictTypeGuardBuilder instance
     *
     * @example
     * ```typescript
     * interface Product {
     *   id: string;
     *   name: string;
     *   price: number;
     *   inStock: boolean;
     * }
     *
     * const isProduct = StrictTypeGuardBuilder
     *   .start<Product>('Product') // Clear, descriptive type name for debugging
     *   .validateProperty('id', CommonTypeGuards.basics.string())
     *   .validateProperty('name', CommonTypeGuards.basics.string())
     *   .validateProperty('price', CommonTypeGuards.basics.number())
     *   .validateProperty('inStock', CommonTypeGuards.basics.boolean())
     *   .build();
     * ```
     */
    public static start<T>(typeName: string): StrictTypeGuardBuilder<T> {
        return new StrictTypeGuardBuilder<T>(typeName);
    }
}
