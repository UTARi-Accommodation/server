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
        return parseAsString(handlers[0]?.id).orElseThrowDefault('handler Id');
    },
};

export default handler;
