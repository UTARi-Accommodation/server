import { parseAsNumber } from 'parse-dont-validate';
import { upsert, IUpsertParams, IUpsertResult } from './upsert.queries';
import { setAvailabilityFalse } from './setAvailabilityFalse.queries';
import {
    updateScore,
    IUpdateScoreParams,
    IUpdateScoreResult,
} from './updateScore.queries';
import { Pool } from '../../postgres';
import { parseNumericFromRental } from '../../../api/query/common';

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
                    rental: parseNumericFromRental(params.rental),
                    available: true,
                },
                rental: parseNumericFromRental(params.rental),
                roomType: params.roomType,
                score: params.score,
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
    updateScore: async (
        params: Readonly<IUpdateScoreParams>,
        pool: Pool
    ): Promise<IUpdateScoreResult['id']> => {
        const rooms = await updateScore.run(params, pool);
        if (rooms.length !== 1) {
            throw new Error(
                `Expect room to have 1 id, got ${rooms.length} instead`
            );
        }
        return parseAsNumber(rooms[0]?.id).orElseThrowDefault('room ID');
    },
};

export default room;
