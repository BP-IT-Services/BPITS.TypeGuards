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

    describe('New nullable pattern', () => {
        describe('Basic types with .nullable()', () => {
            describe('string.nullable()', () => {
                it('should validate nullable strings with default nullish values', () => {
                    const guard = CommonTypeGuards.basics.string.nullable();
                    expect(guard('hello')).to.be.true;
                    expect(guard(null)).to.be.true;
                    expect(guard(undefined)).to.be.true;
                    expect(guard(123)).to.be.false;
                });

                it('should validate nullable strings with custom nullish values', () => {
                    const guardNull = CommonTypeGuards.basics.string.nullable(null);
                    expect(guardNull('hello')).to.be.true;
                    expect(guardNull(null)).to.be.true;
                    expect(guardNull(undefined)).to.be.false; // not in allowed nullish values

                    const guardUndefined = CommonTypeGuards.basics.string.nullable(undefined);
                    expect(guardUndefined('hello')).to.be.true;
                    expect(guardUndefined(undefined)).to.be.true;
                    expect(guardUndefined(null)).to.be.false; // not in allowed nullish values

                    const guardBoth = CommonTypeGuards.basics.string.nullable(null, undefined);
                    expect(guardBoth('hello')).to.be.true;
                    expect(guardBoth(null)).to.be.true;
                    expect(guardBoth(undefined)).to.be.true;
                });

                it('V2 nullable type guard should match V1 nullable type guard', () => {
                    const guardV1Null = CommonTypeGuards.basics.string.nullable(null);
                    const guardV2Null = CommonTypeGuards.basics.string().nullable(null);
                    expect(guardV2Null('hello')).to.be.equal(guardV1Null('hello'));
                    expect(guardV2Null(null)).to.be.equal(guardV1Null(null));
                    expect(guardV2Null(undefined)).to.be.equal(guardV1Null(undefined));

                    const guardV1Undefined = CommonTypeGuards.basics.string.nullable(undefined);
                    const guardV2Undefined = CommonTypeGuards.basics.string().nullable(undefined);
                    expect(guardV2Undefined('hello')).to.be.equal(guardV1Undefined('hello'));
                    expect(guardV2Undefined(null)).to.be.equal(guardV1Undefined(null));
                    expect(guardV2Undefined(undefined)).to.be.equal(guardV1Undefined(undefined));

                    const guardV1Both = CommonTypeGuards.basics.string.nullable(null, undefined);
                    const guardV2Both = CommonTypeGuards.basics.string().nullable(null, undefined);
                    expect(guardV2Both('hello')).to.be.equal(guardV1Both('hello'));
                    expect(guardV2Both(null)).to.be.equal(guardV1Both(null));
                    expect(guardV2Both(undefined)).to.be.equal(guardV1Both(undefined));
                });
            });

            describe('number.nullable()', () => {
                it('should validate nullable numbers with default nullish values', () => {
                    const guard = CommonTypeGuards.basics.number.nullable();
                    expect(guard(123)).to.be.true;
                    expect(guard(0)).to.be.true;
                    expect(guard(-1)).to.be.true;
                    expect(guard(null)).to.be.true;
                    expect(guard(undefined)).to.be.true;
                    expect(guard('123')).to.be.false;
                });

                it('should validate nullable numbers with custom nullish values', () => {
                    const guardNull = CommonTypeGuards.basics.number.nullable(null);
                    expect(guardNull(123)).to.be.true;
                    expect(guardNull(null)).to.be.true;
                    expect(guardNull(undefined)).to.be.false;

                    const guardUndefined = CommonTypeGuards.basics.number.nullable(undefined);
                    expect(guardUndefined(123)).to.be.true;
                    expect(guardUndefined(undefined)).to.be.true;
                    expect(guardUndefined(null)).to.be.false;
                });

                it('V2 nullable type guard should match V1 nullable type guard', () => {
                    const guardV1Null = CommonTypeGuards.basics.number.nullable(null);
                    const guardV2Null = CommonTypeGuards.basics.number().nullable(null);
                    expect(guardV2Null(123)).to.be.equal(guardV1Null(123));
                    expect(guardV2Null(null)).to.be.equal(guardV1Null(null));
                    expect(guardV2Null(undefined)).to.be.equal(guardV1Null(undefined));

                    const guardV1Undefined = CommonTypeGuards.basics.number.nullable(undefined);
                    const guardV2Undefined = CommonTypeGuards.basics.number().nullable(undefined);
                    expect(guardV2Undefined(123)).to.be.equal(guardV1Undefined(123));
                    expect(guardV2Undefined(null)).to.be.equal(guardV1Undefined(null));
                    expect(guardV2Undefined(undefined)).to.be.equal(guardV1Undefined(undefined));

                    const guardV1Both = CommonTypeGuards.basics.number.nullable(null, undefined);
                    const guardV2Both = CommonTypeGuards.basics.number().nullable(null, undefined);
                    expect(guardV2Both(123)).to.be.equal(guardV1Both(123));
                    expect(guardV2Both(null)).to.be.equal(guardV1Both(null));
                    expect(guardV2Both(undefined)).to.be.equal(guardV1Both(undefined));
                });
            });

            describe('boolean.nullable()', () => {
                it('should validate nullable booleans with default nullish values', () => {
                    const guard = CommonTypeGuards.basics.boolean.nullable();
                    expect(guard(true)).to.be.true;
                    expect(guard(false)).to.be.true;
                    expect(guard(null)).to.be.true;
                    expect(guard(undefined)).to.be.true;
                    expect(guard(1)).to.be.false;
                    expect(guard(0)).to.be.false;
                });

                it('should validate nullable booleans with custom nullish values', () => {
                    const guardNull = CommonTypeGuards.basics.boolean.nullable(null);
                    expect(guardNull(true)).to.be.true;
                    expect(guardNull(false)).to.be.true;
                    expect(guardNull(null)).to.be.true;
                    expect(guardNull(undefined)).to.be.false;
                });

                it('V2 nullable type guard should match V1 nullable type guard', () => {
                    const guardV1Null = CommonTypeGuards.basics.boolean.nullable(null);
                    const guardV2Null = CommonTypeGuards.basics.boolean().nullable(null);
                    expect(guardV2Null(true)).to.be.equal(guardV1Null(true));
                    expect(guardV2Null(false)).to.be.equal(guardV1Null(false));
                    expect(guardV2Null(null)).to.be.equal(guardV1Null(null));
                    expect(guardV2Null(undefined)).to.be.equal(guardV1Null(undefined));

                    const guardV1Undefined = CommonTypeGuards.basics.boolean.nullable(undefined);
                    const guardV2Undefined = CommonTypeGuards.basics.boolean().nullable(undefined);
                    expect(guardV2Undefined(true)).to.be.equal(guardV1Undefined(true));
                    expect(guardV2Undefined(false)).to.be.equal(guardV1Undefined(false));
                    expect(guardV2Undefined(null)).to.be.equal(guardV1Undefined(null));
                    expect(guardV2Undefined(undefined)).to.be.equal(guardV1Undefined(undefined));

                    const guardV1Both = CommonTypeGuards.basics.boolean.nullable(null, undefined);
                    const guardV2Both = CommonTypeGuards.basics.boolean().nullable(null, undefined);
                    expect(guardV2Both(true)).to.be.equal(guardV1Both(true));
                    expect(guardV2Both(false)).to.be.equal(guardV1Both(false));
                    expect(guardV2Both(null)).to.be.equal(guardV1Both(null));
                    expect(guardV2Both(undefined)).to.be.equal(guardV1Both(undefined));
                });
            });

            describe('object.nullable()', () => {
                it('should validate nullable objects with default nullish values', () => {
                    const guard = CommonTypeGuards.basics.object.nullable();
                    expect(guard({})).to.be.true;
                    expect(guard({ key: 'value' })).to.be.true;
                    expect(guard([])).to.be.true; // arrays are objects
                    expect(guard(null)).to.be.true;
                    expect(guard(undefined)).to.be.true;
                    expect(guard('string')).to.be.false;
                    expect(guard(123)).to.be.false;
                });

                it('should validate nullable objects with custom nullish values', () => {
                    const guardUndefined = CommonTypeGuards.basics.object.nullable(undefined);
                    expect(guardUndefined({})).to.be.true;
                    expect(guardUndefined(undefined)).to.be.true;
                    expect(guardUndefined(null)).to.be.false;
                });

                it('V2 nullable type guard should match V1 nullable type guard', () => {
                    const guardV1Null = CommonTypeGuards.basics.object.nullable(null);
                    const guardV2Null = CommonTypeGuards.basics.object().nullable(null);
                    expect(guardV2Null({})).to.be.equal(guardV1Null({}));
                    expect(guardV2Null(null)).to.be.equal(guardV1Null(null));
                    expect(guardV2Null(undefined)).to.be.equal(guardV1Null(undefined));

                    const guardV1Undefined = CommonTypeGuards.basics.object.nullable(undefined);
                    const guardV2Undefined = CommonTypeGuards.basics.object().nullable(undefined);
                    expect(guardV2Undefined({})).to.be.equal(guardV1Undefined({}));
                    expect(guardV2Undefined(null)).to.be.equal(guardV1Undefined(null));
                    expect(guardV2Undefined(undefined)).to.be.equal(guardV1Undefined(undefined));

                    const guardV1Both = CommonTypeGuards.basics.object.nullable(null, undefined);
                    const guardV2Both = CommonTypeGuards.basics.object().nullable(null, undefined);
                    expect(guardV2Both({})).to.be.equal(guardV1Both({}));
                    expect(guardV2Both(null)).to.be.equal(guardV1Both(null));
                    expect(guardV2Both(undefined)).to.be.equal(guardV1Both(undefined));
                });
            });
        });

        describe('Date types with .nullable()', () => {
            describe('date.nullable()', () => {
                it('should validate nullable dates with default nullish values', () => {
                    const guard = CommonTypeGuards.date.date.nullable();
                    expect(guard(new Date())).to.be.true;
                    expect(guard(new Date('2023-01-01'))).to.be.true;
                    expect(guard(null)).to.be.true;
                    expect(guard(undefined)).to.be.true;
                    expect(guard('2023-01-01')).to.be.false;
                    expect(guard(1234567890)).to.be.false;
                });

                it('should validate nullable dates with custom nullish values', () => {
                    const guardNull = CommonTypeGuards.date.date.nullable(null);
                    expect(guardNull(new Date())).to.be.true;
                    expect(guardNull(null)).to.be.true;
                    expect(guardNull(undefined)).to.be.false;

                    const guardUndefined = CommonTypeGuards.date.date.nullable(undefined);
                    expect(guardUndefined(new Date())).to.be.true;
                    expect(guardUndefined(undefined)).to.be.true;
                    expect(guardUndefined(null)).to.be.false;
                });
            });

            describe('dateString.nullable()', () => {
                it('should validate nullable date strings with default nullish values', () => {
                    const guard = CommonTypeGuards.date.dateString.nullable();
                    expect(guard('2023-01-01')).to.be.true;
                    expect(guard('2023-01-01T10:00:00Z')).to.be.true;
                    expect(guard('January 1, 2023')).to.be.true;
                    expect(guard(null)).to.be.true;
                    expect(guard(undefined)).to.be.true;
                    expect(guard('invalid date string')).to.be.false;
                    expect(guard(new Date())).to.be.false;
                });

                it('should validate nullable date strings with custom nullish values', () => {
                    const guardNull = CommonTypeGuards.date.dateString.nullable(null);
                    expect(guardNull('2023-01-01')).to.be.true;
                    expect(guardNull(null)).to.be.true;
                    expect(guardNull(undefined)).to.be.false;

                    const guardUndefined = CommonTypeGuards.date.dateString.nullable(undefined);
                    expect(guardUndefined('2023-01-01')).to.be.true;
                    expect(guardUndefined(undefined)).to.be.true;
                    expect(guardUndefined(null)).to.be.false;
                });

                it('V2 nullable type guard should match V1 nullable type guard', () => {
                    const guardV1Null = CommonTypeGuards.date.dateString.nullable(null);
                    const guardV2Null = CommonTypeGuards.date.dateString().nullable(null);
                    expect(guardV2Null('2023-01-01')).to.be.equal(guardV1Null('2023-01-01'));
                    expect(guardV2Null(null)).to.be.equal(guardV1Null(null));
                    expect(guardV2Null(undefined)).to.be.equal(guardV1Null(undefined));

                    const guardV1Undefined = CommonTypeGuards.date.dateString.nullable(undefined);
                    const guardV2Undefined = CommonTypeGuards.date.dateString().nullable(undefined);
                    expect(guardV2Undefined('2023-01-01')).to.be.equal(guardV1Undefined('2023-01-01'));
                    expect(guardV2Undefined(null)).to.be.equal(guardV1Undefined(null));
                    expect(guardV2Undefined(undefined)).to.be.equal(guardV1Undefined(undefined));

                    const guardV1Both = CommonTypeGuards.date.dateString.nullable(null, undefined);
                    const guardV2Both = CommonTypeGuards.date.dateString().nullable(null, undefined);
                    expect(guardV2Both('2023-01-01')).to.be.equal(guardV1Both('2023-01-01'));
                    expect(guardV2Both(null)).to.be.equal(guardV1Both(null));
                    expect(guardV2Both(undefined)).to.be.equal(guardV1Both(undefined));
                });
            });
        });

        describe('Array types with .nullable()', () => {
            describe('array.nullable()', () => {
                it('should validate nullable arrays with default nullish values', () => {
                    const guard = CommonTypeGuards.array.array.nullable();
                    expect(guard([])).to.be.true;
                    expect(guard([1, 2, 3])).to.be.true;
                    expect(guard(['a', 'b', 'c'])).to.be.true;
                    expect(guard(null)).to.be.true;
                    expect(guard(undefined)).to.be.true;
                    expect(guard('not array')).to.be.false;
                    expect(guard({})).to.be.false;
                });

                it('should validate nullable arrays with custom nullish values', () => {
                    const guardNull = CommonTypeGuards.array.array.nullable(null);
                    expect(guardNull([])).to.be.true;
                    expect(guardNull([1, 2, 3])).to.be.true;
                    expect(guardNull(null)).to.be.true;
                    expect(guardNull(undefined)).to.be.false;

                    const guardUndefined = CommonTypeGuards.array.array.nullable(undefined);
                    expect(guardUndefined([])).to.be.true;
                    expect(guardUndefined(undefined)).to.be.true;
                    expect(guardUndefined(null)).to.be.false;
                });

                it('V2 nullable type guard should match V1 nullable type guard', () => {
                    const guardV1Null = CommonTypeGuards.array.array.nullable(null);
                    const guardV2Null = CommonTypeGuards.array.array().nullable(null);
                    expect(guardV2Null([])).to.be.equal(guardV1Null([]));
                    expect(guardV2Null(null)).to.be.equal(guardV1Null(null));
                    expect(guardV2Null(undefined)).to.be.equal(guardV1Null(undefined));

                    const guardV1Undefined = CommonTypeGuards.array.array.nullable(undefined);
                    const guardV2Undefined = CommonTypeGuards.array.array().nullable(undefined);
                    expect(guardV2Undefined([])).to.be.equal(guardV1Undefined([]));
                    expect(guardV2Undefined(null)).to.be.equal(guardV1Undefined(null));
                    expect(guardV2Undefined(undefined)).to.be.equal(guardV1Undefined(undefined));

                    const guardV1Both = CommonTypeGuards.array.array.nullable(null, undefined);
                    const guardV2Both = CommonTypeGuards.array.array().nullable(null, undefined);
                    expect(guardV2Both([])).to.be.equal(guardV1Both([]));
                    expect(guardV2Both(null)).to.be.equal(guardV1Both(null));
                    expect(guardV2Both(undefined)).to.be.equal(guardV1Both(undefined));
                });
            });

            describe('arrayOf.nullable()', () => {
                it('should validate nullable typed arrays with default nullish values', () => {
                    const stringArrayGuard = CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.string()).nullable();
                    const numberArrayGuard = CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.number()).nullable();

                    expect(stringArrayGuard(['a', 'b', 'c'])).to.be.true;
                    expect(stringArrayGuard([])).to.be.true;
                    expect(stringArrayGuard(null)).to.be.true;
                    expect(stringArrayGuard(undefined)).to.be.true;
                    expect(stringArrayGuard(['a', 1, 'c'])).to.be.false;
                    expect(stringArrayGuard('not array')).to.be.false;

                    expect(numberArrayGuard([1, 2, 3])).to.be.true;
                    expect(numberArrayGuard([])).to.be.true;
                    expect(numberArrayGuard(null)).to.be.true;
                    expect(numberArrayGuard(undefined)).to.be.true;
                    expect(numberArrayGuard([1, 'b', 3])).to.be.false;
                });

                it('should validate nullable typed arrays with custom nullish values', () => {
                    const guardNull = CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.string()).nullable(null);
                    expect(guardNull(['a', 'b'])).to.be.true;
                    expect(guardNull([])).to.be.true;
                    expect(guardNull(null)).to.be.true;
                    expect(guardNull(undefined)).to.be.false;
                    expect(guardNull(['a', 1])).to.be.false;

                    const guardUndefined = CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.string()).nullable(undefined);
                    expect(guardUndefined(['a', 'b'])).to.be.true;
                    expect(guardUndefined(undefined)).to.be.true;
                    expect(guardUndefined(null)).to.be.false;
                });
            });

            describe('nested arrayOf.nullable()', () => {
                it('should validate nullable nested arrays', () => {
                    const nestedArrayGuard = CommonTypeGuards.array.arrayOf(
                        CommonTypeGuards.array.arrayOf(CommonTypeGuards.basics.string())
                    ).nullable();

                    expect(nestedArrayGuard([['a', 'b'], ['c', 'd']])).to.be.true;
                    expect(nestedArrayGuard([])).to.be.true;
                    expect(nestedArrayGuard(null)).to.be.true;
                    expect(nestedArrayGuard(undefined)).to.be.true;
                    expect(nestedArrayGuard([['a', 1], ['c', 'd']])).to.be.false;
                    expect(nestedArrayGuard(['not', 'nested'])).to.be.false;
                });
            });
        });
    });
});