import {afterEach, beforeEach, describe, it} from "mocha";
import {CommonTypeGuards, StrictTypeGuardBuilder, TypeGuardBuilder} from "./imports";
import {expect} from "chai";
import {OptionalFieldsTest, SimpleUser} from "./models/test-models";

describe('StrictTypeGuardBuilder', () => {
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
    describe('Compilation-time type safety', () => {
        it('should create a strict type guard builder', () => {
            const builder = StrictTypeGuardBuilder
                .start<SimpleUser>('SimpleUser');
            expect(builder).to.be.instanceOf(StrictTypeGuardBuilder);
        });

        it('should build when all properties are validated', () => {
            const guard = StrictTypeGuardBuilder
                .start<SimpleUser>('SimpleUser')
                .validateProperty('id', CommonTypeGuards.basics.number())
                .validateProperty('username', CommonTypeGuards.basics.string())
                .build();

            expect(guard({ id: 1, username: 'test' })).to.be.true;
            expect(guard({ id: 'invalid', username: 'test' })).to.be.false;
        });

        it('should build when root validator is used', () => {
            const guard = StrictTypeGuardBuilder
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

        it('should support nullable builds', () => {
            const guard = StrictTypeGuardBuilder
                .start<SimpleUser>('SimpleUser')
                .validateProperty('id', CommonTypeGuards.basics.number())
                .validateProperty('username', CommonTypeGuards.basics.string())
                .build().nullable();

            expect(guard(null)).to.be.true;
            expect(guard(undefined)).to.be.true;
            expect(guard({ id: 1, username: 'test' })).to.be.true;
        });

        it('should support ignoring properties', () => {
            const guard = StrictTypeGuardBuilder
                .start<{ required: string; ignored: any }>('TestType')
                .validateProperty('required', CommonTypeGuards.basics.string())
                .ignoreProperty('ignored')
                .build();

            expect(guard({ required: 'test', ignored: 'anything' })).to.be.true;
        });
    });

    describe('Optional properties handling', () => {
        it('should handle optional properties correctly', () => {
            const guard = StrictTypeGuardBuilder
                .start<OptionalFieldsTest>('OptionalFieldsTest')
                .validateProperty('required', CommonTypeGuards.basics.string())
                .validateProperty('optional', CommonTypeGuards.basics.nullableNumber())
                .validateProperty('nullable', CommonTypeGuards.basics.nullableString())
                .build();

            expect(guard({ required: 'test', nullable: 'value' })).to.be.true;
            expect(guard({ required: 'test', optional: 123, nullable: null })).to.be.true;
            expect(guard({ required: 'test', optional: undefined, nullable: 'value' })).to.be.true;
        });
    });

    describe('Warning suppression', () => {
        describe('suppressMissingValidatorWarnings', () => {
            it('should suppress all missing validator warnings when called with no arguments', () => {
                const guard = StrictTypeGuardBuilder
                    .start<SimpleUser>('SimpleUser')
                    .suppressMissingValidatorWarnings() // Suppress all warnings
                    .validateProperty('id', CommonTypeGuards.basics.number())
                    .validateProperty('username', CommonTypeGuards.basics.string())
                    .build();

                // This object has extra properties that would normally cause warnings
                guard({ id: 1, username: 'test', extraProp: 'value', anotherExtra: 123 });
                
                // Should not have any "No validator specified" warnings
                expect(consoleWarnCalls.some(call => call.includes('No validator specified'))).to.be.false;
                expect(consoleWarnCalls.length).to.equal(0);
            });

            it('should suppress missing validator warnings for specific properties only', () => {
                const guard = StrictTypeGuardBuilder
                    .start<SimpleUser>('SimpleUser')
                    .suppressMissingValidatorWarnings('apiVersion', 'timestamp') // Only suppress these specific properties
                    .validateProperty('id', CommonTypeGuards.basics.number())
                    .validateProperty('username', CommonTypeGuards.basics.string())
                    .build();

                // This object has suppressed properties and one non-suppressed property
                guard({ id: 1, username: 'test', apiVersion: '1.0', timestamp: 123456, shouldWarn: 'value' });
                
                // Should not warn about 'apiVersion' or 'timestamp' but should warn about 'shouldWarn'
                expect(consoleWarnCalls.some(call => call.includes('No validator specified for property \'apiVersion\''))).to.be.false;
                expect(consoleWarnCalls.some(call => call.includes('No validator specified for property \'timestamp\''))).to.be.false;
                expect(consoleWarnCalls.some(call => call.includes('No validator specified for property \'shouldWarn\''))).to.be.true;
            });

            it('should still show validation failure warnings even when missing validator warnings are suppressed', () => {
                const guard = StrictTypeGuardBuilder
                    .start<SimpleUser>('SimpleUser')
                    .suppressMissingValidatorWarnings() // Suppress missing validator warnings
                    .validateProperty('id', CommonTypeGuards.basics.number())
                    .validateProperty('username', CommonTypeGuards.basics.string())
                    .build();

                // This should still show validation failure warnings
                guard({ id: 'invalid', username: 123, extraProp: 'value' });
                
                // Should have validation failure warnings but no missing validator warnings
                expect(consoleWarnCalls.some(call => call.includes('Validation failed for property \'id\''))).to.be.true;
            });

            it('should work with fluent API and compile-time safety', () => {
                // This should compile successfully - all required properties are validated
                const guard = StrictTypeGuardBuilder
                    .start<SimpleUser>('SimpleUser')
                    .validateProperty('id', CommonTypeGuards.basics.number())
                    .suppressMissingValidatorWarnings('extraApiField') // Can be called anywhere in the chain
                    .validateProperty('username', CommonTypeGuards.basics.string())
                    .build(); // Should compile because all properties of SimpleUser are validated

                expect(guard({ id: 1, username: 'test', extraApiField: 'no warning' })).to.be.true;
                expect(consoleWarnCalls.some(call => call.includes('No validator specified for property \'extraApiField\''))).to.be.false;
            });
        });
    });
});