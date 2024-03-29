import postgreSQL, { Pool } from '../../postgres';
import { insert, IInsertParams } from './insert.queries';
import updateScore from '../../action/updateScore/unit';
import { remove, IRemoveParams } from './delete.queries';
import { parseAsNumber } from 'parse-dont-validate';

const unitRating = {
    insert: async (
        params: Readonly<IInsertParams['params']>,
        pool: Pool
    ): Promise<
        Readonly<{
            unit: number;
            user: string;
        }>
    > => {
        const results = await insert.run(
            {
                params,
            },
            pool
        );
        if (results.length !== 1) {
            throw new Error(
                `Expect result to have 1 id, got ${results.length} instead`
            );
        }
        const [result] = results;
        if (!result) {
            throw new Error('result from unitRating insert is undefined');
        }
        await updateScore.one(
            {
                id: result.unit,
            },
            postgreSQL.instance.pool
        );
        return {
            unit: result.unit,
            user: result.utariUser,
        };
    },
    delete: async (params: Readonly<IRemoveParams>, pool: Pool) => {
        const results = await remove.run(params, pool);
        if (results.length === 0) {
            throw new Error(
                `Expect result to have at least 1 id, got 0 instead`
            );
        }
        const id = results[0]?.unit;
        await updateScore.one(
            {
                id: parseAsNumber(id).elseThrow(
                    'unit rating unit id is not a number, it is undefined'
                ),
            },
            postgreSQL.instance.pool
        );
        return results.map(({ utariUser, unit }) => ({
            user: utariUser,
            unit,
        }));
    },
};

export default unitRating;
