import { parseAsNumber } from 'parse-dont-validate';
import { upsert, IUpsertParams, IUpsertResult } from './upsert.queries';
import { setAvailabilityFalse } from './setAvailabilityFalse.queries';
import { Pool } from '../../postgres';
import { parseCurrencyFromRental } from '../../../api/query/common';

const room = {
    upsert: async (
        params: Readonly<
            Omit<IUpsertParams['params'], 'rental' | 'available'> &
                Readonly<{
                    rental: number;
                }>
        >,
        pool: Pool
    ): Promise<IUpsertResult['id']> => {
        const rooms = await upsert.run(
            {
                params: {
                    ...params,
                    rental: parseCurrencyFromRental(params.rental),
                    available: true,
                },
                rental: parseCurrencyFromRental(params.rental),
                roomType: params.roomType,
            },
            pool
        );
        if (rooms.length !== 1) {
            throw new Error(
                `Expect room to have 1 id, got ${rooms.length} instead`
            );
        }
        return parseAsNumber(rooms[0]?.id).orElseThrowDefault('room ID');
    },
    setAvailabilityFalse: async (pool: Pool) => {
        await setAvailabilityFalse.run(undefined as void, pool);
    },
};

export default room;
