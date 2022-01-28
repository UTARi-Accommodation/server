import { Value } from '../postgres';
import { camelCaseToUnderScore } from '../common/convertName';

type NullableValueOperand = Readonly<{
    key: string;
    value: Value;
    operand: '=';
}>;

const equal = (column: string, value: Value): NullableValueOperand => ({
    key: camelCaseToUnderScore(column),
    value,
    operand: '=',
});

type NumberOperand = Readonly<{
    key: string;
    value: number;
    operand: '>' | '>=' | '<' | '<=' | '=';
}>;

const moreThan = (column: string, value: number): NumberOperand => ({
    key: camelCaseToUnderScore(column),
    value,
    operand: '>',
});

const moreThanOrEqual = (column: string, value: number): NumberOperand => ({
    key: camelCaseToUnderScore(column),
    value,
    operand: '>=',
});

const lessThan = (column: string, value: number): NumberOperand => ({
    key: camelCaseToUnderScore(column),
    value,
    operand: '<',
});

const lessThanOrEqual = (column: string, value: number): NumberOperand => ({
    key: camelCaseToUnderScore(column),
    value,
    operand: '<=',
});

const contains = (column: string, value: string) =>
    `LOWER(${camelCaseToUnderScore(column)}) LIKE '${value.toLowerCase()}%'`;

type Data = NullableValueOperand | NumberOperand;

type Values = Readonly<
    Data & {
        type: '' | 'and' | 'or';
    }
>;

export {
    equal,
    moreThanOrEqual,
    moreThan,
    lessThanOrEqual,
    lessThan,
    contains,
    Data,
    Values,
};
