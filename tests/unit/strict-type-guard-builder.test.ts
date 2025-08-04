import {describe, it} from "mocha";
import {CommonTypeGuards, StrictTypeGuardBuilder} from "../../src";
import {expect} from "chai";
import {OptionalFieldsTest, SimpleUser} from "./models/test-models";

describe('StrictTypeGuardBuilder', () => {
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
});