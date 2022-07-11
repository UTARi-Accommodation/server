import { insert, IInsertParams, IInsertResult } from './insert.queries';
import { truncate } from './truncate.queries';
import { alterIdSequence } from './alterIdSequence.queries';
import { parseAsNumber } from 'parse-dont-validate';
import { Pool } from '../../postgres';

const roomCapacities = {
    insert: async (
        params: Readonly<IInsertParams['params']>,
        pool: Pool
    ): Promise<IInsertResult['id']> => {
        const capacities = await insert.run(
            {
                params,
            },
            pool
        );
        if (capacities.length !== 1) {
            throw new Error(
                `Expect capacities to have 1 id, got ${capacities.length} instead`
            );
        }
        return parseAsNumber(capacities[0]?.id).orElseThrowDefault(
            'capacity ID'
        );
    },
    alterIdSequence: async (pool: Pool) => {
        await alterIdSequence.run(undefined, pool);
    },
    truncate: async (pool: Pool) => {
        await truncate.run(undefined, pool);
    },
};

export default roomCapacities;
