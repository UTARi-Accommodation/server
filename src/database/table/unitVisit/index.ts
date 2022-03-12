import { Pool } from '../../postgres';
import { insert, IInsertParams } from './insert.queries';

const unitVisit = {
    insert: async (params: Readonly<IInsertParams['params']>, pool: Pool) => {
        const units = await insert.run(
            {
                params,
            },
            pool
        );
        if (units.length > 1) {
            throw new Error(
                `Expect unit to have 0 or 1 id, got ${units.length} instead`
            );
        }
        const [unit] = units;
        if (!unit) {
            throw new Error('unit is undefined');
        }
        return unit;
    },
};

export default unitVisit;
