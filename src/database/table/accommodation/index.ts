import { parseAsNumber } from 'parse-dont-validate';
import { update, IUpdateParams, IUpdateResult } from './update.queries';
import { insert, IInsertParams, IInsertResult } from './insert.queries';
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
    insert: async (
        params: Readonly<Omit<IInsertParams['params'], 'available'>>,
        pool: Pool
    ): Promise<IInsertResult['id']> => {
        const accommodations = await insert.run(
            { params: { ...params, available: true } },
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
    update: async (
        params: Readonly<IUpdateParams>,
        pool: Pool
    ): Promise<IUpdateResult['id']> => {
        const accommodations = await update.run(params, pool);
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
