import { Pool } from '../../postgres';
import { insert, IInsertParams, IInsertResult } from './insert.queries';
import { truncate } from './truncate.queries';

const email = {
    insert: async (
        params: Readonly<IInsertParams['params']>,
        pool: Pool
    ): Promise<IInsertResult | undefined> => {
        const emails = await insert.run({ params }, pool);
        if (emails.length > 1) {
            throw new Error(
                `Expect email to have O or 1 element, got ${emails.length} instead`
            );
        }
        return emails[0];
    },
    truncate: async (pool: Pool) => {
        await truncate.run(undefined, pool);
    },
};

export default email;
