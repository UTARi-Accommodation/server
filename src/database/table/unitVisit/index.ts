import postgreSQL, { Pool } from '../../postgres';
import { insert, IInsertParams } from './insert.queries';
import updateScore from '../../action/updateScore/unit';

const unitVisit = {
    insert: async (params: Readonly<IInsertParams['params']>, pool: Pool) => {
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
            throw new Error('unit is undefined');
        }
        await updateScore.one(
            {
                id: result.unit,
            },
            postgreSQL.instance.pool
        );
        return result;
    },
};

export default unitVisit;
