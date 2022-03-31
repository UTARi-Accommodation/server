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
            user: result.utari_user,
        };
    },
    delete: async (params: Readonly<IRemoveParams>, pool: Pool) => {
        const results = await remove.run(params, pool);
        if (results.length === 0) {
            throw new Error(
                `Expect result to have at least 1 id, got 0 instead`
            );
        }
        await updateScore.one(
            {
                id: parseAsNumber(results[0]?.unit).orElseThrowDefault(
                    'unit rating unit id'
                ),
            },
            postgreSQL.instance.pool
        );
        return results.map(({ utari_user, unit }) => ({
            user: utari_user,
            unit,
        }));
    },
};

export default unitRating;
