import { parseAsNumber } from 'parse-dont-validate';
import { upsert, IUpsertParams, IUpsertResult } from './upsert.queries';
import { setAvailabilityFalse } from './setAvailabilityFalse.queries';
import { Pool } from '../../postgres';
import { parseNumericFromRental } from '../../../api/query/common';
import {
    IUpdateScoreParams,
    IUpdateScoreResult,
    updateScore,
} from './updateScore.queries';

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
                score: params.score,
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

export default unit;
