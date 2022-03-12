import { parseAsNumber } from 'parse-dont-validate';
import { upsert, IUpsertParams, IUpsertResult } from './upsert.queries';
import { select, ISelectParams, ISelectResult } from './select.queries';
import { setAvailabilityFalse } from './setAvailabilityFalse.queries';
import { Pool } from '../../postgres';

const accommodation = {
    select: async (
        params: Readonly<ISelectParams>,
        pool: Pool
    ): Promise<ISelectResult['id'] | undefined> => {
        const accommodations = await select.run(params, pool);
        if (accommodations.length > 1) {
            throw new Error(
                `Expect accommodation to have 0 or 1 element, got ${accommodations.length} instead`
            );
        }
        return accommodations[0]?.id;
    },
    upsert: async (
        params: Readonly<Omit<IUpsertParams['params'], 'available'>>,
        pool: Pool
    ): Promise<IUpsertResult['id']> => {
        const accommodations = await upsert.run(
            {
                params: {
                    ...params,
                    available: true,
                },
                ...params,
                handler: params.handler,
                remark: params.remark,
                month: params.month,
                year: params.year,
                region: params.region,
                facilities: params.facilities,
                accommodationType: params.accommodationType,
            },
            pool
        );
        if (accommodations.length !== 1) {
            throw new Error(
                `Expect accommodation to have 1 element, got ${accommodations.length} instead`
            );
        }
        return parseAsNumber(accommodations[0]?.id).orElseThrowDefault(
            'accommodation Id'
        );
    },
    setAvailabilityFalse: async (pool: Pool) => {
        await setAvailabilityFalse.run(undefined as void, pool);
    },
};

export default accommodation;
