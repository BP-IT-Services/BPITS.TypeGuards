import {describe, it} from "mocha";
import {expect} from "chai";
import {CommonTypeGuards} from "../../src";

describe('CommonTypeGuards', () => {
    describe('Basic type guards', () => {
        describe('nullish', () => {
            it('should validate nullish values', () => {
                expect(CommonTypeGuards.basics.nullish(null, null)).to.be.true;
                expect(CommonTypeGuards.basics.nullish(undefined, undefined)).to.be.true;
                expect(CommonTypeGuards.basics.nullish(null, null, undefined)).to.be.true;
                expect(CommonTypeGuards.basics.nullish('not null', null)).to.be.false;
                expect(CommonTypeGuards.basics.nullish(0, null)).to.be.false;
            });
        });

        describe('string', () => {
            it('should validate strings', () => {
                const guard = CommonTypeGuards.basics.string();
                expect(guard('hello')).to.be.true;
                expect(guard('')).to.be.true;
                expect(guard(123)).to.be.false;
                expect(guard(null)).to.be.false;
                expect(guard(undefined)).to.be.false;
            });
        });

        describe('number', () => {
            it('should validate numbers', () => {
                const guard = CommonTypeGuards.basics.number();
                expect(guard(123)).to.be.true;
                expect(guard(0)).to.be.true;
                expect(guard(-1)).to.be.true;
                expect(guard(3.14)).to.be.true;
                expect(guard('123')).to.be.false;
                expect(guard(null)).to.be.false;
                expect(guard(NaN)).to.be.true; // NaN is of type number
            });
        });

        describe('boolean', () => {
            it('should validate booleans', () => {
                const guard = CommonTypeGuards.basics.boolean();
                expect(guard(true)).to.be.true;
                expect(guard(false)).to.be.true;
                expect(guard(1)).to.be.false;
                expect(guard(0)).to.be.false;
                expect(guard('true')).to.be.false;
                expect(guard(null)).to.be.false;
            });
        });

        describe('object', () => {
            it('should validate objects', () => {
                const guard = CommonTypeGuards.basics.object();
                expect(guard({})).to.be.true;
                expect(guard({ key: 'value' })).to.be.true;
                expect(guard([])).to.be.true; // arrays are objects
                expect(guard(null)).to.be.true; // null is of type object in JavaScript
                expect(guard('string')).to.be.false;
                expect(guard(123)).to.be.false;
            });
        });

        describe('nullable types', () => {
            it('should validate nullable strings', () => {
                const guard = CommonTypeGuards.basics.nullableString();
                expect(guard('hello')).to.be.true;
                expect(guard(null)).to.be.true;
                expect(guard(undefined)).to.be.true;
                expect(guard(123)).to.be.false;
            });

            it('should validate nullable strings with custom nullish values', () => {
                const guard = CommonTypeGuards.basics.nullableString(null);
                expect(guard('hello')).to.be.true;
                expect(guard(null)).to.be.true;
                expect(guard(undefined)).to.be.false; // not in allowed nullish values
            });

            it('should validate nullable numbers', () => {
                const guard = CommonTypeGuards.basics.nullableNumber();
                expect(guard(123)).to.be.true;
                expect(guard(null)).to.be.true;
                expect(guard(undefined)).to.be.true;
                expect(guard('123')).to.be.false;
            });

            it('should validate nullable booleans', () => {
                const guard = CommonTypeGuards.basics.nullableBoolean();
                expect(guard(true)).to.be.true;
                expect(guard(false)).to.be.true;
                expect(guard(null)).to.be.true;
                expect(guard(undefined)).to.be.true;
                expect(guard(1)).to.be.false;
            });

            it('should validate nullable objects', () => {
                const guard = CommonTypeGuards.basics.nullableObject();
                expect(guard({})).to.be.true;
                expect(guard(null)).to.be.true;
                expect(guard(undefined)).to.be.true;
                expect(guard('string')).to.be.false;
            });
        });
    });

    describe('Date type guards', () => {
        describe('date', () => {
            it('should validate Date objects', () => {
                const guard = CommonTypeGuards.date.date();
                expect(guard(new Date())).to.be.true;
                expect(guard(new Date('2023-01-01'))).to.be.true;
                expect(guard(new Date('invalid'))).to.be.true; // Invalid Date is still a Date object
                expect(guard('2023-01-01')).to.be.false;
                expect(guard(1234567890)).to.be.false;
                expect(guard(null)).to.be.false;
            });
        });

        describe('dateString', () => {
            it('should validate date strings', () => {
                const guard = CommonTypeGuards.date.dateString();
                expect(guard('2023-01-01')).to.be.true;
                expect(guard('2023-01-01T10:00:00Z')).to.be.true;
                expect(guard('January 1, 2023')).to.be.true;
                expect(guard('invalid date string')).to.be.false;
                expect(guard('')).to.be.false;
                expect(guard(new Date())).to.be.false;
                expect(guard(null)).to.be.false;
            });
        });

        describe('nullable date types', () => {
            it('should validate nullable dates', () => {
                const guard = CommonTypeGuards.date.nullableDate();
                expect(guard(new Date())).to.be.true;
                expect(guard(null)).to.be.true;
                expect(guard(undefined)).to.be.true;
                expect(guard(new Date('invalid'))).to.be.false; // Invalid Date should fail
                expect(guard('2023-01-01')).to.be.false;
            });

            it('should validate nullable date strings', () => {
                const guard = CommonTypeGuards.date.nullableDateString();
                expect(guard('2023-01-01')).to.be.true;
                expect(guard(null)).to.be.true;
                expect(guard(undefined)).to.be.true;
                expect(guard('invalid date')).to.be.false;
                expect(guard(new Date())).to.be.false;
            });
        });
    });

    describe('Array type guards', () => {
        describe('array', () => {
            it('should validate arrays', () => {
                const guard = CommonTypeGuards.array.array();
                expect(guard([])).to.be.true;
                expect(guard([1, 2, 3])).to.be.true;
                expect(guard(['a', 'b', 'c'])).to.be.true;
                expect(guard([1, 'mixed', true])).to.be.true;
                expect(guard({})).to.be.false;
                expect(guard('not array')).to.be.false;
                expect(guard(null)).to.be.false;
            });
        });

        describe('arrayOf', () => {
            it('should validate arrays of specific types', () => {
                const stringArrayGuard = CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.string());
                const numberArrayGuard = CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.number());

                expect(stringArrayGuard(['a', 'b', 'c'])).to.be.true;
                expect(stringArrayGuard([])).to.be.true;
                expect(stringArrayGuard(['a', 1, 'c'])).to.be.false;
                expect(stringArrayGuard('not array')).to.be.false;

                expect(numberArrayGuard([1, 2, 3])).to.be.true;
                expect(numberArrayGuard([])).to.be.true;
                expect(numberArrayGuard([1, 'b', 3])).to.be.false;
            });
        });

        describe('nullable array types', () => {
            it('should validate nullable arrays', () => {
                const guard = CommonTypeGuards.array.nullableArray();
                expect(guard([])).to.be.true;
                expect(guard([1, 2, 3])).to.be.true;
                expect(guard(null)).to.be.true;
                expect(guard(undefined)).to.be.true;
                expect(guard('not array')).to.be.false;
            });

            it('should validate nullable arrays of specific types', () => {
                const guard = CommonTypeGuards.array.nullableArrayOf(CommonTypeGuards.basics.string());
                expect(guard(['a', 'b'])).to.be.true;
                expect(guard([])).to.be.true;
                expect(guard(null)).to.be.true;
                expect(guard(undefined)).to.be.true;
                expect(guard(['a', 1])).to.be.false;
                expect(guard('not array')).to.be.false;
            });
        });
    });
});