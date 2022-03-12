import { Pool } from '../../postgres';
import { insert, IInsertParams, IInsertResult } from './insert.queries';
import { truncate } from './truncate.queries';

const mobileNumber = {
    insert: async (
        params: Readonly<IInsertParams['params']>,
        pool: Pool
    ): Promise<IInsertResult | undefined> => {
        const mobileNumbers = await insert.run({ params }, pool);
        if (mobileNumbers.length > 1) {
            throw new Error(
                `Expect mobile number to have 0 or 1 element, got ${mobileNumbers.length} instead`
            );
        }
        return mobileNumbers[0];
    },
    truncate: async (pool: Pool) => {
        await truncate.run(undefined as void, pool);
    },
};

export default mobileNumber;
