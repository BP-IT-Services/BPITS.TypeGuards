import { TypeGuardPredicate, TypeGuardPredicateWithNullable } from "./types";
import { Nullish } from "./types/internal/nullish";
import { CommonTypeGuards } from "./type-guards";
import { BuildResult } from "./types/internal/build-result";

/**
 * A flexible builder for creating type guard functions with runtime validation and debugging support.
 *
 * This class allows you to build complex type guards by validating individual properties or the entire object.
 * It provides helpful console warnings when validation fails and supports both root-level and property-level validation.
 *
 * Unlike `StrictTypeGuardBuilder`, this class does not enforce compile-time validation of all properties,
 * making it more flexible but less type-safe during development.
 *
 * @template T The type to create a type guard for
 *
 * @example
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   email?: string;
 * }
 *
 * const isUser = TypeGuardBuilder
 *   .start<User>('User')
 *   .validateProperty('id', CommonTypeGuards.basics.string())
 *   .validateProperty('name', CommonTypeGuards.basics.string())
 *   // email is optional - no validation required
 *   .build();
 *
 * // Usage
 * if (isUser(someData)) {
 *   // someData is now typed as User
 *   console.log(someData.name);
 * }
 * ```
 */
export class TypeGuardBuilder<T> {
    /**
     * Controls whether actual values are logged when validation fails.
     * Set to false to log "redacted" instead of actual values for security purposes.
     *
     * @default true
     *
     * @example
     * ```typescript
     * // Disable logging actual values for sensitive data
     * TypeGuardBuilder.LogValueReceived = false;
     *
     * // Now validation failures will show "redacted" instead of the actual value
     * ```
     */
    public static LogValueReceived: boolean = true;

    private _rootValidators: Array<(obj: unknown) => obj is T> = [];
    private _validators = new Map<keyof T, Array<(obj: unknown) => obj is T[keyof T]>>();
    private _suppressAllMissingValidatorWarnings: boolean = false;
    private _suppressedMissingValidatorWarningProperties = new Set<string>();

    /**
     * Creates a new TypeGuardBuilder instance.
     *
     * @param _rootTypeName Name of the type being validated. Used for console error/warning logging.
     *
     * @example
     * ```typescript
     * const builder = new TypeGuardBuilder<User>('User');
     * // Or use the static factory method:
     * const builder = TypeGuardBuilder.start<User>('User');
     * ```
     */
    constructor(private readonly _rootTypeName: string) {
    }

    /**
     * Validates the entire object at the root level using the provided type guard.
     * Multiple validators can be added - all must pass for the object to be valid.
     *
     * When root validators are present, property-level validation becomes optional
     * and no warnings are shown for unvalidated properties.
     *
     * @param predicate A type guard function that validates the entire object
     * @returns This builder instance for method chaining
     *
     * @example
     * ```typescript
     * const isValidUser = (obj: unknown): obj is User => {
     *   // Custom validation logic for the entire object
     *   return typeof obj === 'object'
     *     && obj !== null
     *     && 'id' in obj
     *     && 'name' in obj;
     * };
     *
     * const userGuard = TypeGuardBuilder
     *   .start<User>('User')
     *   .validateRoot(isValidUser)
     *   .build();
     * ```
     */
    public validateRoot(predicate: (obj: unknown) => obj is T): this {
        this._rootValidators.push(predicate);
        return this;
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
    public validateProperty<TProperty extends keyof T>(property: TProperty, predicate: TypeGuardPredicate<T[TProperty]>): this {
        const previousValue = this._validators.get(property) ?? [];
        this._validators.set(property, [ ...previousValue, predicate ]);
        return this;
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
    public ignoreProperty<TProperty extends keyof T>(property: TProperty): this {
        const previousValue = this._validators.get(property) ?? [];
        const predicate = (obj: unknown): obj is T[TProperty] => true;
        this._validators.set(property, [ ...previousValue, predicate ]);
        return this;
    }

    /**
     * Suppresses missing validator warnings for this type guard builder.
     *
     * This method only suppresses "No validator specified for property..." warnings.
     * Validation failure warnings (e.g., "Validation failed for property...") are still shown.
     *
     * - When called with no arguments, suppresses ALL missing validator warnings
     * - When called with property names, suppresses missing validator warnings only for those specific properties
     *
     * Use this when working with APIs that return extra properties you don't control.
     * The validation will still work correctly - it just won't warn about missing validators
     * for properties you don't care about.
     *
     * @param properties Optional property names to suppress missing validator warnings for. If empty, suppresses all missing validator warnings.
     * @returns This builder instance for method chaining
     *
     * @example
     * ```typescript
     * interface User {
     *   id: string;
     *   name: string;
     * }
     *
     * // Suppress all missing validator warnings
     * const isUserNoWarnings = TypeGuardBuilder
     *   .start<User>('User')
     *   .suppressMissingValidatorWarnings() // No "missing validator" warnings for any properties
     *   .validateProperty('id', CommonTypeGuards.basics.string())
     *   .validateProperty('name', CommonTypeGuards.basics.string())
     *   .build();
     *
     * // API returns { id: "1", name: "John", _internal: "xyz", created_at: "2023-01-01" }
     * // Suppress missing validator warnings only for specific extra properties
     * const isUserSpecific = TypeGuardBuilder
     *   .start<User>('User')
     *   .suppressMissingValidatorWarnings('_internal', 'created_at') // Only suppress these
     *   .validateProperty('id', CommonTypeGuards.basics.string())
     *   .validateProperty('name', CommonTypeGuards.basics.string())
     *   .build();
     *
     * // Validation failure warnings are still shown:
     * isUserSpecific({ id: 123, name: "John", _internal: "xyz" }); 
     * // Will still warn: "Validation failed for property 'id'" (because 123 is not a string)
     * // Will NOT warn about '_internal' missing validator
     * ```
     */
    public suppressMissingValidatorWarnings(...properties: (keyof T | PropertyKey)[]): this {
        if (properties.length === 0) {
            this._suppressAllMissingValidatorWarnings = true;
            return this;
        }

        for (const property of properties) {
            // Convert to string since Object.keys() returns string keys
            this._suppressedMissingValidatorWarningProperties.add(String(property));
        }

        return this;
    }

    /**
     * Build a type guard using the provided validators.
     *
     * **Runtime Behavior**:
     * - Never throws exceptions - always returns boolean
     * - Negligible performance impact
     * - Compatible with ES5+ browsers and TypeScript 2.x+
     * - Shows warnings for validation failures (unless `TypeGuardBuilder.LogValueReceived = false`)
     * - Shows errors for properties with validation failures
     *
     * **Nullable Variants**: Use `.build().nullable()` to create a type guard that also accepts null/undefined values.
     *
     * @returns A BuildResult object containing both the main type guard creator and nullable variant methods
     *
     * @example
     * ```typescript
     * interface User {
     *   id: string;
     *   name: string;
     *   email?: string;
     * }
     *
     * const userBuilder = TypeGuardBuilder
     *   .start<User>('User')
     *   .validateProperty('id', CommonTypeGuards.basics.string())
     *   .validateProperty('name', CommonTypeGuards.basics.string())
     *   // email is optional - no validation required
     *   .build(); // Returns BuildResult<User>
     *
     * // Create the standard type guard
     * const isUser = userBuilder(); // (value: unknown) => value is User
     *
     * // Create nullable variants
     * const isUserOrNull = userBuilder.nullable(null); // (value: unknown) => value is User | null
     * const isUserOrUndefined = userBuilder.nullable(undefined); // (value: unknown) => value is User | undefined
     * const isUserOrNullish = userBuilder.nullable(); // (value: unknown) => value is User | null | undefined
     *
     * // Usage examples
     * const someData: unknown = getApiData();
     * if (isUser(someData)) {
     *   // someData is now typed as User
     *   console.log(someData.name);
     *   if (someData.email) {
     *     console.log(someData.email);
     *   }
     * }
     *
     * const nullableData: unknown = getOptionalApiData();
     * if (isUserOrNull(nullableData)) {
     *   // nullableData is now typed as User | null
     *   if (nullableData !== null) {
     *     // nullableData is now typed as User (null-checked)
     *     console.log(nullableData.name);
     *   } else {
     *     console.log('No user data available');
     *   }
     * }
     *
     * // With root validation (bypasses property-level validation warnings)
     * const rootValidatedBuilder = TypeGuardBuilder
     *   .start<User>('User')
     *   .validateRoot((obj): obj is User => {
     *     return typeof obj === 'object' && obj !== null && 'id' in obj && 'name' in obj;
     *   })
     *   .build();
     *
     * const isValidUser = rootValidatedBuilder();
     * const isValidUserOrNull = rootValidatedBuilder.nullable(null);
     * ```
     */
    public get build(): BuildResult<T> {
        const baseGuard = this.buildTypeGuard() as TypeGuardPredicateWithNullable<T>;
        baseGuard.nullable = <TNull extends Nullish = null | undefined>(...nullishValues: TNull[]) => {
            return (obj: unknown): obj is T | TNull => {
                if (obj === null || obj === undefined) {
                    return CommonTypeGuards.basics.nullish(obj, ...nullishValues);
                }

                return baseGuard(obj);
            };
        };


        const mainFunction = () => baseGuard;
        mainFunction.nullable = <TNull extends Nullish = null | undefined>(...nullishValues: TNull[]) => {
            return (obj: unknown): obj is T | TNull => {
                if (obj === null || obj === undefined) {
                    return CommonTypeGuards.basics.nullish(obj, ...nullishValues);
                }

                return baseGuard(obj);
            };
        };

        return mainFunction;
    }

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
    public static start<T>(typeName: string): TypeGuardBuilder<T> {
        return new TypeGuardBuilder<T>(typeName);
    }

    private buildTypeGuard(): (value: unknown) => value is T {
        return (obj: unknown): obj is T => {
            if (typeof obj !== 'object')
                return false;

            if (!obj)
                return false;

            if (!this._rootValidators.every(v => v(obj))) {
                console.warn(`Validation failed for root object in '${this._rootTypeName}'. Value received:`, this.sanitiseValueReceived(obj));
                return false;
            }

            const hasRootValidator = this._rootValidators.length > 0;
            const recordObj = obj as Record<keyof T, unknown>;
            const objKeys = Object.keys(obj) as Array<keyof T>;
            for (const key of objKeys) {
                const keyValidator = this._validators.get(key);
                if (!keyValidator) {
                    if (!hasRootValidator && !this._suppressAllMissingValidatorWarnings && !this._suppressedMissingValidatorWarningProperties.has(key.toString())) {
                        // Only show console warnings if a root validator wasn't supplied and warnings aren't suppressed
                        console.warn(`No validator specified for property '${key.toString()}' in '${this._rootTypeName}'`);
                    }

                    continue;
                }

                const value = recordObj[key];
                if (!keyValidator.every(v => v(value))) {
                    console.warn(`Validation failed for property '${key.toString()}' in '${this._rootTypeName}'. Value received:`, this.sanitiseValueReceived(value));
                    return false;
                }
            }

            // If the object is empty, AND:
            // 1. We have no root validator defined
            // 2. We DO have property validators defined
            if (objKeys.length === 0 && !hasRootValidator && this._validators.size > 0) {
                return false;
            }

            return true;
        };
    }

    private sanitiseValueReceived(value: unknown): unknown {
        return TypeGuardBuilder.LogValueReceived ? value : 'redacted';
    }
}
