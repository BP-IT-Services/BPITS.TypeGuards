import { CommonTypeGuards, StrictTypeGuardBuilder } from "../../../src";

type ExampleVariants = 'VariantA' | 'StrainB' | 'SpeciesC';

type BaseType = {
    variant: ExampleVariants;
    name: string;
}

type VariantA = BaseType & {
    variant: 'VariantA';
}

const isVariantA = StrictTypeGuardBuilder
    .start<VariantA>('VariantA')
    .validateProperty('variant', variant => variant === 'unrelated') // Should throw a compilation error but does not
    .validateProperty('name', CommonTypeGuards.basics.number())
    .build();
