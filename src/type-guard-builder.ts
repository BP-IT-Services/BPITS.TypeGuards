import {TypeGuardPredicate} from "./types";

export class TypeGuardBuilder<T> {
    public static LogValueReceived: boolean = true;

    private _rootValidators: Array<(obj: unknown) => obj is T> = [];
    private _validators = new Map<keyof T, Array<(obj: unknown) => obj is T[keyof T]>>();

    /**
     * @param _rootTypeName Name of the type being validated. Used for console error/warning logging.
     */
    constructor(private readonly _rootTypeName: string) {
    }

    /**
     * Validates the entire object at the root level using the provided type guard.
     * Multiple validators can be added - all must pass for the object to be valid.
     * @param predicate
     */
    public validateRoot(predicate: (obj: unknown) => obj is T): this {
        this._rootValidators.push(predicate);
        return this;
    }

    /**
     * Validates an individual property using the provided type guard.
     * Multiple validators can be added - all must pass for the object to be valid.
     * @param property Property name to add validator for.
     * @param predicate Type guard that will return true if the property is valid, false otherwise.
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
     * @param property Name of the property to be ignored.
     */
    public ignoreProperty<TProperty extends keyof T>(property: TProperty): this {
        const previousValue = this._validators.get(property) ?? [];
        const predicate = (obj: unknown): obj is T[TProperty] => true;
        this._validators.set(property, [...previousValue, predicate]);
        return this;
    }

    /**
     * Build a type guard using the provided validators.
     * * Warnings will be shown for unhandled properties.
     * * Errors will be shown for properties with validation failures.
     *
     * @return Callable type guard
     */
    public build(): (value: unknown) => value is T {
        return (obj: unknown): obj is T => {
            if (typeof obj !== 'object')
                return false;

            if (!obj)
                return false;

            if (!this._rootValidators.every(v => v(obj))) {
                console.warn(`Validation failed for root object '${this._rootTypeName}'. Value received:`, this.sanitiseValueReceived(obj));
                return false;
            }

            const hasRootValidator = this._rootValidators.length > 0;
            const recordObj = obj as Record<keyof T, unknown>;
            const objKeys = Object.keys(obj) as Array<keyof T>;
            for (const key of objKeys) {
                const keyValidator = this._validators.get(key);
                if (!keyValidator) {
                    if(!hasRootValidator) {
                        // Only show console warnings if a root validator wasn't supplied
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

    /**
     * Similar to `build()`, except the type guard will also allow null/undefined objects.
     * * Warnings will be shown for unhandled properties.
     * * Errors will be shown for properties with validation failures.
     *
     * @return Callable type guard
     */
    public buildNullable(): TypeGuardPredicate<T | null | undefined> {
        return (obj: unknown): obj is T | null | undefined => {
            if (obj === null || obj === undefined)
                return true;

            return this.build()(obj);
        }
    }

    /**
     * Create a TypeGuardBuilder instance.
     * @param typeName Name of the type being validated. Used for console error/warning logging.
     */
    public static start<T>(typeName: string): TypeGuardBuilder<T> {
        return new TypeGuardBuilder<T>(typeName);
    }

    private sanitiseValueReceived(value: unknown): unknown {
        return TypeGuardBuilder.LogValueReceived ? value : 'redacted';
    }
}
