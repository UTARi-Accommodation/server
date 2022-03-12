import { insert, IInsertParams } from './insert.queries';
import { select, ISelectParams } from './select.queries';
import { remove, IRemoveParams } from './delete.queries';
import { Pool } from '../../postgres';

const roomBookmarked = {
    select: async (
        params: Readonly<ISelectParams>,
        pool: Pool
    ): Promise<number> => {
        const rooms = await select.run(params, pool);
        if (rooms.length !== 1) {
            throw new Error(
                `Expect room to have 1 id, got ${rooms.length} instead`
            );
        }
        const [room] = rooms;
        if (!room) {
            throw new Error('room from roomBookmarked select is undefined');
        }
        const { count } = room;
        return typeof count === 'string' ? parseInt(count) : 0;
    },
    insert: async (params: Readonly<IInsertParams['params']>, pool: Pool) => {
        const rooms = await insert.run(
            {
                params,
            },
            pool
        );
        if (rooms.length > 1) {
            throw new Error(
                `Expect room to have 0 or 1 id, got ${rooms.length} instead`
            );
        }
        const [room] = rooms;
        return !room
            ? undefined
            : {
                  room: room.room,
                  user: room.utari_user,
              };
    },
    delete: async (params: Readonly<IRemoveParams>, pool: Pool) => {
        const rooms = await remove.run(params, pool);
        if (rooms.length > 1) {
            throw new Error(
                `Expect room to have 0 or 1 id, got ${rooms.length} instead`
            );
        }
        const [room] = rooms;
        return !room
            ? undefined
            : {
                  room: room.room,
                  user: room.utari_user,
              };
    },
};

export default roomBookmarked;
