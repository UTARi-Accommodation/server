import postgreSQL, { Pool } from '../../postgres';
import { insert, IInsertParams } from './insert.queries';
import updateScore from '../../action/updateScore/room';

const roomVisit = {
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
            throw new Error('result is undefined');
        }
        await updateScore.one(
            {
                id: result.room,
            },
            postgreSQL.instance.pool
        );
        return result;
    },
};

export default roomVisit;
