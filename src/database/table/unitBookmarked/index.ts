import { insert, IInsertParams } from './insert.queries';
import { select, ISelectParams } from './select.queries';
import { remove, IRemoveParams } from './delete.queries';
import { Pool } from '../../postgres';

const unitBookmarked = {
    select: async (
        params: Readonly<ISelectParams>,
        pool: Pool
    ): Promise<number> => {
        const units = await select.run(params, pool);
        if (units.length !== 1) {
            throw new Error(
                `Expect room to have 1 id, got ${units.length} instead`
            );
        }
        const [room] = units;
        if (!room) {
            throw new Error('unit from unitBookmarked select is undefined');
        }
        const { count } = room;
        return typeof count === 'string' ? parseInt(count) : 0;
    },
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
        return !unit
            ? undefined
            : {
                  unit: unit.unit,
                  user: unit.utari_user,
              };
    },
    delete: async (params: Readonly<IRemoveParams>, pool: Pool) => {
        const units = await remove.run(params, pool);
        if (units.length > 1) {
            throw new Error(
                `Expect unit to have 0 or 1 id, got ${units.length} instead`
            );
        }
        const [unit] = units;
        return !unit
            ? undefined
            : {
                  unit: unit.unit,
                  user: unit.utari_user,
              };
    },
};

export default unitBookmarked;
