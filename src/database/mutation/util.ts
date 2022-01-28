import { NullableValue } from '../postgres';

type MutationValue = Readonly<{
    [name: string]: NullableValue;
}>;

type Query = Readonly<{
    statement: string;
    values: ReadonlyArray<NullableValue>;
}>;

export { MutationValue, Query };
