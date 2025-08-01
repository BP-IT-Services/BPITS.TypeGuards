/**
 * Type representing a compilation error when required properties are missing validation.
 *
 * This type is used by the TypeScript compiler to provide helpful error messages
 * when `StrictTypeGuardBuilder.build()` or `StrictTypeGuardBuilder.build.nullable()`
 * are called without validating all required properties.
 *
 * @template TMissing Union type of property keys that are missing validation
 *
 * @example
 * ```typescript
 * // When you see this error:
 * // "Type 'MissingPropertiesError<"email" | "age">' has no call signatures"
 * // It means you need to validate the 'email' and 'age' properties
 *
 * const fixedGuard = StrictTypeGuardBuilder
 *   .start<User>('User')
 *   .validateProperty('id', CommonTypeGuards.basics.string())
 *   .validateProperty('name', CommonTypeGuards.basics.string())
 *   .validateProperty('email', CommonTypeGuards.basics.string())    // ✅ Added
 *   .validateProperty('age', CommonTypeGuards.basics.number())      // ✅ Added
 *   .build(); // ✅ Now compiles successfully
 * ```
 */
export type MissingPropertiesError<TMissing extends PropertyKey> = {
    error: "Missing required properties";
    missing: TMissing;
    hint: "Add validateProperty()/ignoreProperty() calls for the missing properties or use validateRoot() for custom validation";
};