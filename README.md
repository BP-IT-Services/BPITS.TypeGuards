# @bpits/type-guards

A TypeScript library that provides a fluent, type-safe way to build runtime type guards with compile-time validation and helpful debugging features.

## Table of Contents

- [Quick Start](#quick-start)
- [Why Use This Library?](#why-use-this-library)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Built-in Type Guards](#built-in-type-guards)
- [Advanced Usage](#advanced-usage)
- [TypeGuardBuilder vs StrictTypeGuardBuilder](#typeguardbuilder-vs-stricttypeguardbuilder)
- [Debugging and Logging](#debugging-and-logging)
- [Real-World Examples](#real-world-examples)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)
- [TypeScript Configuration](#typescript-configuration)
- [Contributing](#contributing)
- [License](#license)

## Quick Start

```bash
npm install @bpits/type-guards
```

```typescript
import { StrictTypeGuardBuilder, CommonTypeGuards } from '@bpits/type-guards';

interface User {
  id: string;
  name: string;
  email: string;
}

const isUser = StrictTypeGuardBuilder
  .start<User>('User')
  .validateProperty('id', CommonTypeGuards.basics.string())
  .validateProperty('name', CommonTypeGuards.basics.string())
  .validateProperty('email', CommonTypeGuards.basics.string())
  .build();

// Usage
const data: unknown = { id: "123", name: "John", email: "john@example.com" };
if (isUser(data)) {
  // data is now typed as User
  console.log(data.name); // TypeScript knows this is safe
}
```

## Why Use This Library?

### The Problem

When working with external data (APIs, user input, file parsing), we often face a choice between type safety and development speed. Traditional type guards become verbose and error-prone:

```typescript
// Traditional approach - verbose and error-prone
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object'
    && obj !== null
    && typeof (obj as User).id === 'string'  // Easy to make mistakes
    && typeof (obj as User).name === 'string'
    && typeof (obj as User).email === 'string'
    // Forgot to validate age? Compiler won't help you
  );
}
```

### The Solution

This library provides:
- **Compile-time safety**: TypeScript ensures you validate all properties
- **Runtime debugging**: Helpful console warnings when validation fails
- **Fluent API**: Easy to read and maintain
- **Reusable validators**: Common type guards included
- **Flexible validation**: Support for complex nested structures

## Installation

```bash
npm install @bpits/type-guards
```

## Basic Usage

### Simple Object Validation

```typescript
import { StrictTypeGuardBuilder, CommonTypeGuards } from '@bpits/type-guards';

interface Person {
  name: string;
  age: number;
}

const isPerson = StrictTypeGuardBuilder
  .start<Person>('Person')
  .validateProperty('name', CommonTypeGuards.basics.string())
  .validateProperty('age', CommonTypeGuards.basics.number())
  .build();

// Usage
const data: unknown = JSON.parse('{"name": "Alice", "age": 30}');
if (isPerson(data)) {
  console.log(`${data.name} is ${data.age} years old`);
}
```

### Nullable Types

```typescript
interface UserProfile {
  username: string;
  bio: string | null;
  avatar: string | undefined;
}

const isUserProfile = StrictTypeGuardBuilder
  .start<UserProfile>('UserProfile')
  .validateProperty('username', CommonTypeGuards.basics.string())
  .validateProperty('bio', CommonTypeGuards.basics.nullableString())
  .validateProperty('avatar', CommonTypeGuards.basics.nullableString())
  .build();
```

### Optional Properties and Ignoring Fields

Sometimes you want to ignore certain properties (perhaps they're computed or internal):

```typescript
interface ApiResponse {
  data: string;
  timestamp: number;
  _internal: any; // We don't care about this field
}

const isApiResponse = StrictTypeGuardBuilder
  .start<ApiResponse>('ApiResponse')
  .validateProperty('data', CommonTypeGuards.basics.string())
  .validateProperty('timestamp', CommonTypeGuards.basics.number())
  .ignoreProperty('_internal') // No validation, no warnings
  .build();
```

## Built-in Type Guards

### Basic Types

```typescript
CommonTypeGuards.basics.string()      // string
CommonTypeGuards.basics.number()      // number  
CommonTypeGuards.basics.boolean()     // boolean
CommonTypeGuards.basics.object()      // object

// Nullable versions
CommonTypeGuards.basics.nullableString()   // string | null | undefined
CommonTypeGuards.basics.nullableNumber()   // number | null | undefined
CommonTypeGuards.basics.nullableBoolean()  // boolean | null | undefined
CommonTypeGuards.basics.nullableObject()   // object | null | undefined
```

### Date Validation

```typescript
CommonTypeGuards.date.date()           // Date object
CommonTypeGuards.date.dateString()     // Valid date string
CommonTypeGuards.date.nullableDate()   // Date | null | undefined
CommonTypeGuards.date.nullableDateString() // Valid date string | null | undefined

// Usage
interface Event {
  name: string;
  date: Date;
  created: string; // ISO date string
}

const isEvent = StrictTypeGuardBuilder
  .start<Event>('Event')
  .validateProperty('name', CommonTypeGuards.basics.string())
  .validateProperty('date', CommonTypeGuards.date.date())
  .validateProperty('created', CommonTypeGuards.date.dateString())
  .build();
```

### Array Validation

```typescript
CommonTypeGuards.array.array()                    // Array<unknown>
CommonTypeGuards.array.arrayOf(typeGuard)         // Array<T>
CommonTypeGuards.array.nullableArray()            // Array<unknown> | null | undefined
CommonTypeGuards.array.nullableArrayOf(typeGuard) // Array<T> | null | undefined

// Usage
interface TodoList {
  items: string[];
  priorities: number[];
}

const isTodoList = StrictTypeGuardBuilder
  .start<TodoList>('TodoList')
  .validateProperty('items', CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.string()))
  .validateProperty('priorities', CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.number()))
  .build();
```

## Advanced Usage

### Custom Type Guards

Create your own type guard predicates for complex validation:

```typescript
interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

// Custom email validator
const isEmail = (obj: unknown): obj is string => {
  return typeof obj === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj);
};

// Custom role validator
const isValidRole = (obj: unknown): obj is 'admin' | 'user' | 'guest' => {
  return obj === 'admin' || obj === 'user' || obj === 'guest';
};

const isUser = StrictTypeGuardBuilder
  .start<User>('User')
  .validateProperty('id', CommonTypeGuards.basics.string())
  .validateProperty('email', isEmail)
  .validateProperty('role', isValidRole)
  .build();
```

### Nested Object Validation

```typescript
interface Address {
  street: string;
  city: string;
  zipCode: string;
}

interface Person {
  name: string;
  address: Address;
}

// First, create a type guard for the nested object
const isAddress = StrictTypeGuardBuilder
  .start<Address>('Address')
  .validateProperty('street', CommonTypeGuards.basics.string())
  .validateProperty('city', CommonTypeGuards.basics.string())
  .validateProperty('zipCode', CommonTypeGuards.basics.string())
  .build();

// Then use it in the parent object
const isPerson = StrictTypeGuardBuilder
  .start<Person>('Person')
  .validateProperty('name', CommonTypeGuards.basics.string())
  .validateProperty('address', isAddress)
  .build();
```

### Root-Level Validation

Sometimes you need to validate the entire object structure or want to bypass individual property validation. The `validateRoot()` method allows you to validate the complete object and automatically satisfies the `StrictTypeGuardBuilder`'s requirement to validate all properties:

```typescript
interface Coordinates {
  x: number;
  y: number;
}

// Custom validator for the entire object
const isValidCoordinates = (obj: unknown): obj is Coordinates => {
  if (typeof obj !== 'object' || !obj) return false;
  const coords = obj as Coordinates;
  return typeof coords.x === 'number' 
    && typeof coords.y === 'number'
    && coords.x >= 0 && coords.x <= 100 
    && coords.y >= 0 && coords.y <= 100;
};

// Root validation allows immediate build() - no individual properties needed
const isCoordinates = StrictTypeGuardBuilder
  .start<Coordinates>('Coordinates')
  .validateRoot(isValidCoordinates)
  .build(); // ✅ Compiles immediately

// You can also combine root validation with property validation
const isCoordinatesWithDetails = StrictTypeGuardBuilder
  .start<Coordinates>('Coordinates')
  .validateProperty('x', CommonTypeGuards.basics.number())
  .validateProperty('y', CommonTypeGuards.basics.number())
  .validateRoot(isValidCoordinates) // Additional validation on top
  .build();
```

**Key Point**: `validateRoot()` tells the `StrictTypeGuardBuilder` that you're handling the entire object validation yourself, so it won't require individual property validations.

### Nullable Objects

Build type guards that accept null or undefined:

```typescript
const isUserOrNull = StrictTypeGuardBuilder
  .start<User>('User')
  .validateProperty('id', CommonTypeGuards.basics.string())
  .validateProperty('name', CommonTypeGuards.basics.string())
  .validateProperty('email', CommonTypeGuards.basics.string())
  .buildNullable(); // Returns (obj: unknown) => obj is User | null | undefined
```

## TypeGuardBuilder vs StrictTypeGuardBuilder

This library provides two builders:

### StrictTypeGuardBuilder (Recommended)
- **Compile-time validation**: Ensures all properties are validated or ignored
- **Type safety**: Prevents you from forgetting to validate properties
- **Better developer experience**: Clear error messages guide you to missing validations

**Important**: When using `StrictTypeGuardBuilder`, you **must** validate or ignore all properties before calling `build()` or `buildNullable()`. If you don't, TypeScript will show a compile error indicating which properties are missing validation.

**Exception**: If you call `validateRoot()`, it assumes the entire object structure will be validated at the root level, allowing you to call `build()` or `buildNullable()` immediately without validating individual properties.

### TypeGuardBuilder
- **More flexible**: Allows partial property validation
- **Runtime warnings**: Shows warnings for unvalidated properties
- **Backward compatibility**: Easier migration from manual type guards

```typescript
// StrictTypeGuardBuilder - compile error if you miss a property
const strictGuard = StrictTypeGuardBuilder
  .start<User>('User')
  .validateProperty('id', CommonTypeGuards.basics.string())
  // Missing 'name' and 'email' - TypeScript error!
  .build(); // ❌ Compile error: "Missing required properties"

// With root validation - bypasses individual property requirements
const rootValidatedGuard = StrictTypeGuardBuilder
  .start<User>('User')
  .validateRoot(myCustomUserValidator) // Validates entire object
  .build(); // ✅ Compiles immediately

// TypeGuardBuilder - allows partial validation
const flexibleGuard = TypeGuardBuilder
  .start<User>('User')
  .validateProperty('id', CommonTypeGuards.basics.string())
  // Missing properties will show runtime warnings
  .build(); // ✅ Compiles, but shows warnings at runtime
```

### Understanding StrictTypeGuardBuilder Compilation Errors

When you forget to validate properties, TypeScript will show helpful error messages:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

const incompleteGuard = StrictTypeGuardBuilder
  .start<User>('User')
  .validateProperty('id', CommonTypeGuards.basics.string())
  .validateProperty('name', CommonTypeGuards.basics.string())
  // Missing 'email' and 'age'
  .build(); // ❌ Error: Missing required properties: "email" | "age"
```

The error message tells you exactly which properties need validation, making it easy to fix.

## Debugging and Logging

The library provides helpful debugging features:

### Console Warnings

When validation fails, you'll see detailed console warnings:

```typescript
// If validation fails, you'll see:
// "Validation failed for property 'email' in 'User'. Value received: 'not-an-email'"
// "No validator specified for property 'unexpected' in 'User'"
```

### Controlling Log Output

You can control whether actual values are logged (useful for sensitive data):

```typescript
import { TypeGuardBuilder } from '@bpits/type-guards';

// Disable logging of actual values for security
TypeGuardBuilder.LogValueReceived = false;
// Now failed validations will show "redacted" instead of actual values
```

## Real-World Examples

### API Response Validation

```typescript
interface ApiUser {
    id: string;
    username: string;
    email: string;
    profile: {
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    roles: string[];
    lastLogin: string; // ISO date string
    isActive: boolean;
}

const isProfile = StrictTypeGuardBuilder
    .start<ApiUser['profile']>('UserProfile')
    .validateProperty('firstName', CommonTypeGuards.basics.string())
    .validateProperty('lastName', CommonTypeGuards.basics.string())
    .validateProperty('avatar', CommonTypeGuards.basics.nullableString())
    .build();

const isApiUser = StrictTypeGuardBuilder
    .start<ApiUser>('ApiUser')
    .validateProperty('id', CommonTypeGuards.basics.string())
    .validateProperty('username', CommonTypeGuards.basics.string())
    .validateProperty('email', CommonTypeGuards.basics.string())
    .validateProperty('profile', isProfile)
    .validateProperty('roles', CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.string()))
    .validateProperty('lastLogin', CommonTypeGuards.date.dateString())
    .validateProperty('isActive', CommonTypeGuards.basics.boolean())
    .build();

// Usage in API call
async function fetchUser(id: string): Promise<ApiUser | null> {
    const response = await fetch(`/api/users/${id}`);
    const data = await response.json();

    if (isApiUser(data)) {
        return data; // Fully typed as ApiUser
    }

    console.error('Invalid user data received from API');
    return null;
}
```

### Form Validation

```typescript
interface ContactForm {
    name: string;
    email: string;
    phone?: string;
    message: string;
    newsletter: boolean;
}

const isEmail = (obj: unknown): obj is string => {
    return typeof obj === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj);
};

const isContactForm = StrictTypeGuardBuilder
    .start<ContactForm>('ContactForm')
    .validateProperty('name', CommonTypeGuards.basics.string())
    .validateProperty('email', isEmail)
    .validateProperty('phone', CommonTypeGuards.basics.nullableString())
    .validateProperty('message', CommonTypeGuards.basics.string())
    .validateProperty('newsletter', CommonTypeGuards.basics.boolean())
    .build();

function handleFormSubmit(formData: unknown) {
    if (isContactForm(formData)) {
        // Process valid form data
        console.log(`Contact form from ${formData.name} <${formData.email}>`);
    } else {
        // Handle invalid data
        console.error('Invalid form data submitted');
    }
}
```

## Migration Guide

### From Manual Type Guards

Before:
```typescript
function isUser(obj: unknown): obj is User {
    return (
        typeof obj === 'object'
        && obj !== null
        && typeof (obj as User).id === 'string'
        && typeof (obj as User).name === 'string'
        && typeof (obj as User).email === 'string'
    );
}
```

After:
```typescript
const isUser = StrictTypeGuardBuilder
    .start<User>('User')
    .validateProperty('id', CommonTypeGuards.basics.string())
    .validateProperty('name', CommonTypeGuards.basics.string())
    .validateProperty('email', CommonTypeGuards.basics.string())
    .build();
```

### Gradual Migration

You can migrate gradually using `TypeGuardBuilder` for partial validation:

```typescript
// Start with basic validation
const isUser = TypeGuardBuilder
    .start<User>('User')
    .validateProperty('id', CommonTypeGuards.basics.string())
    .build(); // Warns about missing properties, but works

// Later, add more validations
const isUser = TypeGuardBuilder
    .start<User>('User')
    .validateProperty('id', CommonTypeGuards.basics.string())
    .validateProperty('name', CommonTypeGuards.basics.string())
    .validateProperty('email', CommonTypeGuards.basics.string())
    .build();

// Finally, switch to strict mode
const isUser = StrictTypeGuardBuilder
    .start<User>('User')
    .validateProperty('id', CommonTypeGuards.basics.string())
    .validateProperty('name', CommonTypeGuards.basics.string())
    .validateProperty('email', CommonTypeGuards.basics.string())
    .build();
```

## Best Practices

### 1. Use Descriptive Type Names
```typescript
// Good
StrictTypeGuardBuilder.start<User>('User')
StrictTypeGuardBuilder.start<ApiResponse>('WeatherApiResponse')

// Less helpful
StrictTypeGuardBuilder.start<User>('obj')
```

### 2. Create Reusable Validators
```typescript
// Create common validators for your domain
const isPositiveNumber = (obj: unknown): obj is number => {
    return typeof obj === 'number' && obj > 0;
};

const isValidEmail = (obj: unknown): obj is string => {
    return typeof obj === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj);
};
```

### 3. Validate at Boundaries
```typescript
// Validate data when it enters your system
async function fetchUsers(): Promise<User[]> {
    const response = await fetch('/api/users');
    const data = await response.json();

    if (CommonTypeGuards.array.arrayOf(isUser)(data)) {
        return data; // Now safely typed
    }

    throw new Error('Invalid user data from API');
}
```

### 4. Combine with Error Handling
```typescript
function processApiData(data: unknown): User | null {
    try {
        if (isUser(data)) {
            return data;
        }
        console.warn('Data validation failed, using defaults');
        return null;
    } catch (error) {
        console.error('Error processing API data:', error);
        return null;
    }
}
```

## TypeScript Configuration

For the best experience, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

## Contributing

This library is designed to be extensible. You can contribute by:

1. Adding new common type guards
2. Improving error messages
3. Adding utility functions
4. Improving documentation

## License

MIT License - see [LICENSE](LICENSE) file for details.