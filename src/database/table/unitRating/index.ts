import postgreSQL, { Pool } from '../../postgres';
import { insert, IInsertParams } from './insert.queries';
import updateScore from '../../action/updateScore/unit';

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
};

export default unitRating;
