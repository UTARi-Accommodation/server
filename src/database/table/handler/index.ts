import { parseAsString } from 'parse-dont-validate';
import { upsert, IUpsertParams, IUpsertResult } from './upsert.queries';
import { Pool } from '../../postgres';

const handler = {
    upsert: async (
        params: Readonly<IUpsertParams['params']>,
        pool: Pool
    ): Promise<IUpsertResult['id']> => {
        const handlers = await upsert.run(
            { params, handlerType: params.handlerType, name: params.name },
            pool
        );
        if (handlers.length !== 1) {
            throw new Error(
                `Expect handler to have 1 element, got ${handlers.length} instead`
            );
        }
        const id = handlers[0]?.id;
        return parseAsString(id).elseThrow(
            `handler id is not a string, it is ${id}`
        );
    },
};

export default handler;
