import { parseAsNumber } from 'parse-dont-validate';
import { upsert, IUpsertParams, IUpsertResult } from './upsert.queries';
import { setAvailabilityFalse } from './setAvailabilityFalse.queries';
import { Pool } from '../../postgres';
import { parseNumericFromRental } from '../../../api/query/common';

const unit = {
    upsert: async (
        params: Readonly<
            Omit<IUpsertParams['params'], 'rental' | 'available'> &
                Readonly<{
                    rental: number;
                }>
        >,
        pool: Pool
    ): Promise<IUpsertResult['id']> => {
        const units = await upsert.run(
            {
                params: {
                    ...params,
                    rental: parseNumericFromRental(params.rental),
                    available: true,
                },
                rental: parseNumericFromRental(params.rental),
                bathRooms: params.bathRooms,
                bedRooms: params.bedRooms,
                unitType: params.unitType,
            },
            pool
        );
        if (units.length !== 1) {
            throw new Error(
                `Expect unit to have 1 element, got ${units.length} instead`
            );
        }
        return parseAsNumber(units[0]?.id).orElseThrowDefault('unit Id');
    },
    setAvailabilityFalse: async (pool: Pool) => {
        await setAvailabilityFalse.run(undefined as void, pool);
    },
};

export default unit;
