import { NullableValue } from '../postgres';
import { camelCaseToUnderScore } from '../common/convertName';
import { MutationValue, Query } from './util';
import { Fields } from '../postgres';

const insertInto = (table: string) => ({
    values: (mutationValue: MutationValue) => {
        const { field, index, values } = Object.entries(mutationValue).reduce(
            ({ field, index, values }, [key, val], i) => {
                const underScoredKey = camelCaseToUnderScore(key);
                return {
                    field: !field
                        ? underScoredKey
                        : `${field}, ${underScoredKey}`,
                    index: !index ? `$${i + 1}` : `${index}, $${i + 1}`,
                    values: values.concat(val),
                };
            },
            {
                field: '',
                index: '',
                values: [] as ReadonlyArray<NullableValue>,
            }
        );
        return {
            toQuery: (): Query => ({
                statement: `INSERT INTO ${table} (${field}) VALUES (${index})`,
                values,
            }),
            returning: (fields: Fields) => ({
                command: (): Query => {
                    const underScoredFields = fields.reduce((prev, key) => {
                        const underscoreCasedKey = camelCaseToUnderScore(key);
                        return !prev
                            ? `${underscoreCasedKey}`
                            : `${prev}, ${underscoreCasedKey}`;
                    }, '');
                    return {
                        statement: `INSERT INTO ${table} (${field}) VALUES (${index}) RETURNING ${underScoredFields}`,
                        values,
                    };
                },
            }),
        };
    },
});

export default insertInto;
