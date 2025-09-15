import { CommonTypeGuards, StrictTypeGuardBuilder } from "../../../src";

type ExampleVariants = 'VariantA' | 'StrainB' | 'SpeciesC';

type BaseType = {
    variant: ExampleVariants;
    name: string;
}

type VariantA = BaseType & {
    variant: 'VariantA';
}

type StrainB = BaseType & {
    variant: 'StrainB';
}

const isBaseVariant = StrictTypeGuardBuilder
    .start<BaseType>('BaseType')
    .validateProperty('variant', (obj): obj is ExampleVariants =>
        typeof obj === 'string' && ['VariantA', 'StrainB', 'SpeciesC'].includes(obj))
    .validateProperty('name', CommonTypeGuards.basics.string())
    .build()

const isVariantA = StrictTypeGuardBuilder
    .start<VariantA>('VariantA')
    .validateProperty('variant', obj => obj === 'VariantA')
    .validateProperty('name', CommonTypeGuards.basics.string())
    .build();

const isStrainB = StrictTypeGuardBuilder
    .start<StrainB>('StrainB')
    .validateProperty('variant', (obj): obj is 'StrainB' => obj === 'StrainB')
    .validateProperty('name', CommonTypeGuards.basics.string())
    .build();

const isStrainB2 = StrictTypeGuardBuilder
    .start<StrainB>('StrainB')
    .validateProperty('variant', (obj): obj is StrainB['variant'] => obj === 'StrainB')
    .validateProperty('name', CommonTypeGuards.basics.string())
    .build();

const isStrainB3 = StrictTypeGuardBuilder
    .start<StrainB>('StrainB')
    .validateProperty('variant', (obj): obj is ExampleVariants => obj === 'StrainB')
    .validateProperty('name', CommonTypeGuards.basics.string())
    .build();