import {afterEach, beforeEach, describe, it} from "mocha";
import {CommonTypeGuards, StrictTypeGuardBuilder, TypeGuardBuilder} from "./imports";
import {expect} from "chai";

describe('Integration tests', () => {
    let originalConsoleWarn: typeof console.warn;
    let consoleWarnCalls: string[];

    beforeEach(() => {
        consoleWarnCalls = [];
        originalConsoleWarn = console.warn;
        console.warn = (...args: any[]) => {
            consoleWarnCalls.push(args.join(' '));
        };
        TypeGuardBuilder.LogValueReceived = false;
    });

    afterEach(() => {
        console.warn = originalConsoleWarn;
    });

    it('should handle complex nested validation scenarios', () => {
        interface UserProfile {
            user: {
                id: number;
                name: string;
                contacts: {
                    emails: string[];
                    phone?: string;
                };
            };
            preferences: {
                theme: 'light' | 'dark';
                notifications: boolean;
            };
            lastLogin?: Date;
        }

        const contactsGuard = TypeGuardBuilder
            .start<UserProfile['user']['contacts']>('Contacts')
            .validateProperty('emails', CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.string()))
            .validateProperty('phone', CommonTypeGuards.basics.nullableString())
            .build();

        const userGuard = TypeGuardBuilder
            .start<UserProfile['user']>('User')
            .validateProperty('id', CommonTypeGuards.basics.number())
            .validateProperty('name', CommonTypeGuards.basics.string())
            .validateProperty('contacts', contactsGuard)
            .build();

        const preferencesGuard = TypeGuardBuilder
            .start<UserProfile['preferences']>('Preferences')
            .validateProperty('theme', (obj): obj is 'light' | 'dark' => obj === 'light' || obj === 'dark')
            .validateProperty('notifications', CommonTypeGuards.basics.boolean())
            .build();

        const profileGuard = TypeGuardBuilder
            .start<UserProfile>('UserProfile')
            .validateProperty('user', userGuard)
            .validateProperty('preferences', preferencesGuard)
            .validateProperty('lastLogin', CommonTypeGuards.date.nullableDate())
            .build();

        const validProfile: UserProfile = {
            user: {
                id: 1,
                name: 'John Doe',
                contacts: {
                    emails: ['john@example.com', 'john.doe@work.com'],
                    phone: '+1234567890'
                }
            },
            preferences: {
                theme: 'dark',
                notifications: true
            },
            lastLogin: new Date()
        };

        const invalidProfile = {
            user: {
                id: 'not-a-number', // invalid
                name: 'John Doe',
                contacts: {
                    emails: ['john@example.com'],
                    phone: '+1234567890'
                }
            },
            preferences: {
                theme: 'invalid-theme', // invalid
                notifications: true
            }
        };

        expect(profileGuard(validProfile)).to.be.true;
        expect(profileGuard(invalidProfile)).to.be.false;
    });

    it('should demonstrate the difference between TypeGuardBuilder and StrictTypeGuardBuilder warnings', () => {
        interface TestType {
            prop1: string;
            prop2: number;
        }

        // Regular TypeGuardBuilder - shows warnings for unhandled properties
        const regularGuard = TypeGuardBuilder
            .start<TestType>('TestType')
            .validateProperty('prop1', CommonTypeGuards.basics.string())
            // Note: not validating prop2
            .build();

        regularGuard({ prop1: 'test', prop2: 123 });
        expect(consoleWarnCalls.some(call => call.includes('No validator specified for property \'prop2\''))).to.be.true;

        // Reset console warnings
        consoleWarnCalls = [];

        // StrictTypeGuardBuilder with all properties validated - no warnings
        const strictGuard = StrictTypeGuardBuilder
            .start<TestType>('TestType')
            .validateProperty('prop1', CommonTypeGuards.basics.string())
            .validateProperty('prop2', CommonTypeGuards.basics.number())
            .build();

        strictGuard({ prop1: 'test', prop2: 123 });
        expect(consoleWarnCalls.length).to.equal(0);
    });
});