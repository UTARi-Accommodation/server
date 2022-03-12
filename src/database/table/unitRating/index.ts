import { Pool } from '../../postgres';
import { insert, IInsertParams } from './insert.queries';

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
        const units = await insert.run(
            {
                params,
            },
            pool
        );
        if (units.length !== 1) {
            throw new Error(
                `Expect unit to have 1 id, got ${units.length} instead`
            );
        }
        const [unit] = units;
        if (!unit) {
            throw new Error('unit from unitRating insert is undefined');
        }
        return {
            unit: unit.unit,
            user: unit.utari_user,
        };
    },
};

export default unitRating;
