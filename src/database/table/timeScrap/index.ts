import { Pool } from '../../postgres';
import { insert, IInsertParams } from './insert.queries';

const timeScrap = {
    insert: async (
        params: Readonly<IInsertParams['params']>,
        pool: Pool
    ): Promise<
        Readonly<{
            timeStarted: Date;
            timeCompleted: Date;
            id: number;
        }>
    > => {
        const timeScraps = await insert.run(
            {
                params,
            },
            pool
        );
        if (timeScraps.length !== 1) {
            throw new Error(
                `Expect room to have 1 id, got ${timeScraps.length} instead`
            );
        }
        const [timeScrap] = timeScraps;
        if (!timeScrap) {
            throw new Error('room from roomVisit insert is undefined');
        }
        return timeScrap;
    },
};

export default timeScrap;
