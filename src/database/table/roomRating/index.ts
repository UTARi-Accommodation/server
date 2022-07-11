import postgreSQL, { Pool } from '../../postgres';
import { insert, IInsertParams } from './insert.queries';
import updateScore from '../../action/updateScore/room';
import { IRemoveParams, remove } from './delete.queries';
import { parseAsNumber } from 'parse-dont-validate';

const roomRating = {
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
            throw new Error('result from roomRating insert is undefined');
        }
        await updateScore.one(
            {
                id: result.room,
            },
            postgreSQL.instance.pool
        );
        return {
            room: result.room,
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
        await updateScore.one(
            {
                id: parseAsNumber(results[0]?.room).orElseThrowDefault(
                    'room rating room id'
                ),
            },
            postgreSQL.instance.pool
        );
        return results.map(({ utariUser, room }) => ({
            user: utariUser,
            room,
        }));
    },
};

export default roomRating;
