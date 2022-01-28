import { Data, Values } from '../common/whereClause';
import { NullableValue, Fields } from '../postgres';
import { camelCaseToUnderScore } from '../common/convertName';
import { MutationValue, Query } from './util';

const updateStateBuilder = (
    table: string,
    values: ReadonlyArray<Values>,
    mutationValue: MutationValue,
    fields: Fields
) => ({
    and: (data: Data) =>
        updateStateBuilder(
            table,
            values.concat({
                type: 'and',
                ...data,
            }),
            mutationValue,
            []
        ),

    or: (data: Data) =>
        updateStateBuilder(
            table,
            values.concat({
                type: 'or',
                ...data,
            }),
            mutationValue,
            []
        ),
    returning: (fields: Fields) => ({
        toQuery: updateStateBuilder(table, values, mutationValue, fields)
            .toQuery,
    }),
    toQuery: (): Query => {
        const { index, value } = Object.entries(mutationValue).reduce(
            ({ index, value }, [key, val], i) => {
                const underScoredKey = camelCaseToUnderScore(key);
                return {
                    index: !index
                        ? `${underScoredKey}=$${i + 1}`
                        : `${index}, ${underScoredKey}=$${i + 1}`,
                    value: value.concat(val),
                };
            },
            {
                index: '',
                value: [] as ReadonlyArray<NullableValue>,
            }
        );

        const currentValuesLength = value.length;

        const { whereIndex, whereValue } = values.reduce(
            ({ whereIndex, whereValue }, { key, value, type, operand }, i) => {
                return {
                    whereIndex: !whereIndex
                        ? `${key}${operand}$${currentValuesLength + i + 1}`
                        : `${whereIndex} ${type} ${key}${operand}$${
                              currentValuesLength + i + 1
                          }`,
                    whereValue: whereValue.concat(value),
                };
            },
            {
                whereIndex: '',
                whereValue: [] as ReadonlyArray<NullableValue>,
            }
        );

        return {
            statement: `UPDATE ${table} SET ${index} WHERE ${whereIndex}${
                !fields.length
                    ? ''
                    : ` RETURNING ${fields.reduce((prev, key) => {
                          const underscoreCasedKey = camelCaseToUnderScore(key);
                          return !prev
                              ? `${underscoreCasedKey}`
                              : `${prev}, ${underscoreCasedKey}`;
                      }, '')}`
            }`,
            values: value.concat(whereValue),
        };
    },
});

const update = (table: string) => ({
    set: (mutationValue: MutationValue) => ({
        where: (data: Data) =>
            updateStateBuilder(
                table,
                [{ type: '', ...data }],
                mutationValue,
                []
            ),
    }),
});

export default update;
