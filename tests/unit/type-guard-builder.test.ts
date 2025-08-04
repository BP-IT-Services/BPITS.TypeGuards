import {afterEach, beforeEach, describe, it} from "mocha";
import {CommonTypeGuards, TypeGuardBuilder} from "../../src";
import {expect} from "chai";
import {Person, SimpleUser} from "./models/test-models";

describe('TypeGuardBuilder', () => {
    let originalConsoleWarn: typeof console.warn;
    let consoleWarnCalls: string[];

    beforeEach(() => {
        // Capture console.warn calls for testing
        consoleWarnCalls = [];
        originalConsoleWarn = console.warn;
        console.warn = (...args: any[]) => {
            consoleWarnCalls.push(args.join(' '));
        };
        TypeGuardBuilder.LogValueReceived = false; // Avoid cluttering test output
    });

    afterEach(() => {
        console.warn = originalConsoleWarn;
    });

    describe('Basic functionality', () => {
        it('should create a type guard builder', () => {
            const builder = TypeGuardBuilder
                .start<SimpleUser>('SimpleUser');
            expect(builder).to.be.instanceOf(TypeGuardBuilder);
        });

        it('should validate simple objects correctly', () => {
            const guard = TypeGuardBuilder
                .start<SimpleUser>('SimpleUser')
                .validateProperty('id', CommonTypeGuards.basics.number())
                .validateProperty('username', CommonTypeGuards.basics.string())
                .build();

            const validUser = { id: 1, username: 'john_doe' };
            const invalidUser1 = { id: 'not-a-number', username: 'john_doe' };
            const invalidUser2 = { id: 1, username: 123 };

            expect(guard(validUser)).to.be.true;
            expect(guard(invalidUser1)).to.be.false;
            expect(guard(invalidUser2)).to.be.false;
        });

        it('should handle null and undefined inputs', () => {
            const guard = TypeGuardBuilder
                .start<SimpleUser>('SimpleUser')
                .validateProperty('id', CommonTypeGuards.basics.number())
                .validateProperty('username', CommonTypeGuards.basics.string())
                .build();

            expect(guard(null)).to.be.false;
            expect(guard(undefined)).to.be.false;
            expect(guard('not an object')).to.be.false;
            expect(guard(123)).to.be.false;
        });

        it('should handle empty objects', () => {
            const guard = TypeGuardBuilder
                .start<SimpleUser>('SimpleUser')
                .validateProperty('id', CommonTypeGuards.basics.number())
                .validateProperty('username', CommonTypeGuards.basics.string())
                .build();

            expect(guard({})).to.be.false;
        });
    });

    describe('Complex object validation', () => {
        it('should validate complex objects with multiple property types', () => {
            const guard = TypeGuardBuilder
                .start<Person>('Person')
                .validateProperty('name', CommonTypeGuards.basics.string())
                .validateProperty('age', CommonTypeGuards.basics.number())
                .validateProperty('email', CommonTypeGuards.basics.nullableString())
                .validateProperty('isActive', CommonTypeGuards.basics.boolean())
                .validateProperty('birthDate', CommonTypeGuards.date.date())
                .validateProperty('hobbies', CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.string()))
                .build();

            const validPerson: Person = {
                name: 'John Doe',
                age: 30,
                email: 'john@example.com',
                isActive: true,
                birthDate: new Date('1994-01-01'),
                hobbies: ['reading', 'coding']
            };

            const validPersonWithoutEmail: Person = {
                name: 'Jane Doe',
                age: 25,
                isActive: false,
                birthDate: new Date('1999-01-01'),
                hobbies: []
            };

            expect(guard(validPerson)).to.be.true;
            expect(guard(validPersonWithoutEmail)).to.be.true;
        });

        it('should fail validation for invalid complex objects', () => {
            const guard = TypeGuardBuilder
                .start<Person>('Person')
                .validateProperty('name', CommonTypeGuards.basics.string())
                .validateProperty('age', CommonTypeGuards.basics.number())
                .validateProperty('email', CommonTypeGuards.basics.nullableString())
                .validateProperty('isActive', CommonTypeGuards.basics.boolean())
                .validateProperty('birthDate', CommonTypeGuards.date.date())
                .validateProperty('hobbies', CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.string()))
                .build();

            const invalidPersons = [
                { name: 123, age: 30, isActive: true, birthDate: new Date(), hobbies: [] }, // invalid name
                { name: 'John', age: '30', isActive: true, birthDate: new Date(), hobbies: [] }, // invalid age
                { name: 'John', age: 30, isActive: 'yes', birthDate: new Date(), hobbies: [] }, // invalid isActive
                { name: 'John', age: 30, isActive: true, birthDate: 'not-a-date', hobbies: [] }, // invalid birthDate
                { name: 'John', age: 30, isActive: true, birthDate: new Date(), hobbies: 'not-an-array' }, // invalid hobbies
                { name: 'John', age: 30, isActive: true, birthDate: new Date(), hobbies: [1, 2, 3] }, // invalid hobbies content
            ];

            invalidPersons.forEach((person, index) => {
                expect(guard(person)).to.be.false;
            });
        });
    });

    describe('Root validation', () => {
        it('should validate using root validators', () => {
            const guard = TypeGuardBuilder
                .start<SimpleUser>('SimpleUser')
                .validateRoot((obj): obj is SimpleUser => {
                    return typeof obj === 'object' && obj !== null &&
                        typeof (obj as any).id === 'number' &&
                        typeof (obj as any).username === 'string';
                })
                .build();

            expect(guard({ id: 1, username: 'test' })).to.be.true;
            expect(guard({ id: 'invalid', username: 'test' })).to.be.false;
        });

        it('should combine root and property validators', () => {
            const guard = TypeGuardBuilder
                .start<SimpleUser>('SimpleUser')
                .validateRoot((obj): obj is SimpleUser => {
                    return typeof obj === 'object' && obj !== null;
                })
                .validateProperty('id', CommonTypeGuards.basics.number())
                .validateProperty('username', CommonTypeGuards.basics.string())
                .build();

            expect(guard({ id: 1, username: 'test' })).to.be.true;
            expect(guard({ id: 'invalid', username: 'test' })).to.be.false;
        });

        it('should not show property warnings when root validator is present', () => {
            const guard = TypeGuardBuilder
                .start<SimpleUser>('SimpleUser')
                .validateRoot((obj): obj is SimpleUser => true)
                .build();

            guard({ id: 1, username: 'test', extraProperty: 'value' });
            expect(consoleWarnCalls.length).to.equal(0);
        });
    });

    describe('Multiple validators per property', () => {
        it('should support multiple validators for the same property', () => {
            const guard = TypeGuardBuilder
                .start<{ value: number }>('NumberTest')
                .validateProperty('value', CommonTypeGuards.basics.number())
                .validateProperty('value', (obj): obj is number => (obj as number) > 0)
                .validateProperty('value', (obj): obj is number => (obj as number) < 100)
                .build();

            expect(guard({ value: 50 })).to.be.true;
            expect(guard({ value: -10 })).to.be.false; // fails second validator
            expect(guard({ value: 150 })).to.be.false; // fails third validator
            expect(guard({ value: 'not-a-number' })).to.be.false; // fails first validator
        });
    });

    describe('Nullable builders', () => {
        it('V1 should create nullable type guards', () => {
            const guard = TypeGuardBuilder
                .start<SimpleUser>('SimpleUser')
                .validateProperty('id', CommonTypeGuards.basics.number())
                .validateProperty('username', CommonTypeGuards.basics.string())
                .build.nullable();

            expect(guard(null)).to.be.true;
            expect(guard(undefined)).to.be.true;
            expect(guard({ id: 1, username: 'test' })).to.be.true;
            expect(guard({ id: 'invalid', username: 'test' })).to.be.false;
        });
        
        it('V2 should create nullable type guards', () => {
            const guard = TypeGuardBuilder
                .start<SimpleUser>('SimpleUser')
                .validateProperty('id', CommonTypeGuards.basics.number())
                .validateProperty('username', CommonTypeGuards.basics.string())
                .build().nullable();

            expect(guard(null)).to.be.true;
            expect(guard(undefined)).to.be.true;
            expect(guard({ id: 1, username: 'test' })).to.be.true;
            expect(guard({ id: 'invalid', username: 'test' })).to.be.false;
        });
    });

    describe('Ignore property functionality', () => {
        it('should ignore specified properties', () => {
            const guard = TypeGuardBuilder
                .start<{ required: string; ignored: any }>('TestType')
                .validateProperty('required', CommonTypeGuards.basics.string())
                .ignoreProperty('ignored')
                .build();

            expect(guard({ required: 'test', ignored: 'anything' })).to.be.true;
            expect(guard({ required: 'test', ignored: 123 })).to.be.true;
            expect(guard({ required: 'test', ignored: null })).to.be.true;
            expect(guard({ required: 123, ignored: 'anything' })).to.be.false; // required fails
        });
    });

    describe('Warning system', () => {
        it('should warn about unhandled properties', () => {
            const guard = TypeGuardBuilder
                .start<SimpleUser>('SimpleUser')
                .validateProperty('id', CommonTypeGuards.basics.number())
                .build();

            guard({ id: 1, username: 'test' });
            expect(consoleWarnCalls.some(call => call.includes('No validator specified for property \'username\''))).to.be.true;
        });

        it('should warn about validation failures', () => {
            const guard = TypeGuardBuilder
                .start<SimpleUser>('SimpleUser')
                .validateProperty('id', CommonTypeGuards.basics.number())
                .validateProperty('username', CommonTypeGuards.basics.string())
                .build();

            guard({ id: 'invalid', username: 'test' });
            expect(consoleWarnCalls.some(call => call.includes('Validation failed for property \'id\''))).to.be.true;
        });
    });
});
