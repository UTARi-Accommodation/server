import { Data, Values } from '../common/whereClause';
import { Value, Fields } from '../postgres';
import { camelCaseToUnderScore } from '../common/convertName';

type Query = Readonly<{
    statement: string;
    values: ReadonlyArray<Value> | undefined;
}>;

const selectStatementBuilder = (
    fields: Fields,
    table: string,
    values: ReadonlyArray<Values>
) => ({
    and: (data: Data) =>
        selectStatementBuilder(
            fields,
            table,
            values.concat({
                type: 'and',
                ...data,
            })
        ),
    or: (data: Data) =>
        selectStatementBuilder(
            fields,
            table,
            values.concat({
                type: 'or',
                ...data,
            })
        ),
    toQuery: (): Query => {
        const { index, values: parameterizedValues } = values.reduce(
            ({ index, values }, { key, value, type, operand }, i) => ({
                index: !index
                    ? `${key}${operand}$${i + 1}`
                    : `${index} ${type} ${key}${operand}$${i + 1}`,
                values: values.concat(value),
            }),
            {
                index: '',
                values: [] as ReadonlyArray<Value>,
            }
        );
        return {
            statement: `SELECT ${renameAllFieldToUnderScore(
                fields
            )} FROM ${table}${values.length ? ` WHERE ${index}` : ''}`,
            values: parameterizedValues,
        };
    },
});

const renameAllFieldToUnderScore = (fields: Fields) =>
    fields.reduce((prev, key) => {
        const underScoredFields = camelCaseToUnderScore(key);
        return !prev ? underScoredFields : `${prev}, ${underScoredFields}`;
    }, '');

const select = (fields: Fields) => ({
    from: (table: string) => {
        return {
            toQuery: (): Query => ({
                statement: `SELECT ${renameAllFieldToUnderScore(
                    fields
                )} FROM ${table}`,
                values: undefined,
            }),
            where: (data: Data) =>
                selectStatementBuilder(fields, table, [
                    {
                        type: '',
                        ...data,
                    },
                ]),
        };
    },
});

export default select;

export type { Data, Query };
