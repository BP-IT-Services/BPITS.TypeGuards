import {TypeGuardPredicate} from "./types";
import {TypeGuardBuilder} from "./type-guard-builder";

type MissingPropertiesError<TMissing extends PropertyKey> = {
    error: "Missing required properties";
    missing: TMissing;
    hint: "Add validateProperty()/ignoreProperty() calls for the missing properties or use validateRoot() for custom validation";
};

export class StrictTypeGuardBuilder<T, TValidated extends keyof T = never> {
    private readonly _internalBuilder: TypeGuardBuilder<T>;

    /**
     * @param rootTypeName Name of the type being validated. Used for console error/warning logging.
     */
    constructor(rootTypeName: string) {
        this._internalBuilder = new TypeGuardBuilder<T>(rootTypeName);
    }

    /**
     * Validates the entire object at the root level using the provided type guard.
     * Multiple validators can be added - all must pass for the object to be valid.
     * @param predicate
     */
    public validateRoot(predicate: (obj: unknown) => obj is T): StrictTypeGuardBuilder<T, keyof T> {
        this._internalBuilder.validateRoot(predicate);
        return this as unknown as StrictTypeGuardBuilder<T, keyof T>;
    }

    /**
     * Validates an individual property using the provided type guard.
     * Multiple validators can be added - all must pass for the object to be valid.
     * @param property Property name to add validator for.
     * @param predicate Type guard that will return true if the property is valid, false otherwise.
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
     * @param property Name of the property to be ignored.
     */
    public ignoreProperty<TProperty extends keyof T>(property: TProperty): StrictTypeGuardBuilder<T, TValidated | TProperty> {
        this._internalBuilder.ignoreProperty(property);
        return this as unknown as StrictTypeGuardBuilder<T, TValidated | TProperty>;
    }

    /**
     * This method can only be called once one of the two conditions is met:
     * 1. All properties have been specified using `validateProperty()` or `ignoreProperty()`.
     * 2. At least one call to `validateRoot()` has been made.
     * 
     * If you do not validate or ignore any properties, you will see an error that looks like:
     * ```
     * TS6234: This expression is not callable because it is a get accessor. Did you mean to use it without '()'?
     * Type MissingPropertiesError<keyof T> has no call signatures.
     * ```
     * 
     * If you only validate or ignore some of the properties, you will see an error that looks like:
     * ```
     * TS6234: This expression is not callable because it is a get accessor. Did you mean to use it without '()'?
     * Type MissingPropertiesError<"age" | "favoriteColor" | "relatives"> has no call signatures.
     * ```
     * 
     * NOTE: This error is informing you which properties have not been validated,
     *       and can be used to quickly identify and resolve compilation errors.
     * 
     * Otherwise, build a type guard using the provided validators.
     * * Warnings will be shown for unhandled properties.
     * * Errors will be shown for properties with validation failures.
     *
     * @return Callable type guard
     */
    public get build(): keyof T extends TValidated
        ? () => (value: unknown) => value is T
        : MissingPropertiesError<Exclude<keyof T, TValidated>> {
        const guard = this._internalBuilder.build();
        return (() => guard) as any;
    }

    /**
     * This method can only be called once one of the two conditions is met:
     * 1. All properties have been specified using `validateProperty()` or `ignoreProperty()`.
     * 2. At least one call to `validateRoot()` has been made.
     *
     * If you do not validate or ignore any properties, you will see an error that looks like:
     * ```
     * TS6234: This expression is not callable because it is a get accessor. Did you mean to use it without '()'?
     * Type MissingPropertiesError<keyof T> has no call signatures.
     * ```
     *
     * If you only validate or ignore some of the properties, you will see an error that looks like:
     * ```
     * TS6234: This expression is not callable because it is a get accessor. Did you mean to use it without '()'?
     * Type MissingPropertiesError<"age" | "favoriteColor" | "relatives"> has no call signatures.
     * ```
     *
     * NOTE: This error is informing you which properties have not been validated,
     *       and can be used to quickly identify and resolve compilation errors.
     * 
     * Similar to `build()`, except the type guard will also allow null/undefined objects.
     * * Warnings will be shown for unhandled properties.
     * * Errors will be shown for properties with validation failures.
     *
     * @return Callable type guard
     */
    public get buildNullable(): keyof T extends TValidated
        ? () => (value: unknown) => value is T | null | undefined
        : MissingPropertiesError<Exclude<keyof T, TValidated>> {
        const guard = this._internalBuilder.buildNullable();
        return (() => guard) as any;
    }

    /**
     * Create a StrictTypeGuardBuilder instance.
     * @param typeName Name of the type being validated. Used for console error/warning logging.
     */
    public static start<T>(typeName: string): StrictTypeGuardBuilder<T> {
        return new StrictTypeGuardBuilder<T>(typeName);
    }
}
