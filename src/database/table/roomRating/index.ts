import { Pool } from '../../postgres';
import { insert, IInsertParams } from './insert.queries';

const roomRating = {
    insert: async (params: Readonly<IInsertParams['params']>, pool: Pool) => {
        const rooms = await insert.run(
            {
                params,
            },
            pool
        );
        if (rooms.length !== 1) {
            throw new Error(
                `Expect room to have 1 id, got ${rooms.length} instead`
            );
        }
        const [room] = rooms;
        if (!room) {
            throw new Error('room from roomRating insert is undefined');
        }
        return {
            room: room.room,
            user: room.utari_user,
        };
    },
};

export default roomRating;
