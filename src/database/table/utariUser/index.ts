import { Pool } from '../../postgres';
import { select, ISelectParams, ISelectResult } from './select.queries';
import { insert, IInsertParams } from './insert.queries';
import { softDelete, ISoftDeleteParams } from './delete.queries';

const user = {
    select: async (
        params: Readonly<ISelectParams>,
        pool: Pool
    ): Promise<ISelectResult['id'] | undefined> => {
        const users = await select.run(params, pool);
        if (users.length > 1) {
            throw new Error(
                `Expect users to have 0 or 1 element, got ${users.length} instead`
            );
        }
        return users[0]?.id;
    },
    insert: async (params: Readonly<IInsertParams['params']>, pool: Pool) => {
        const users = await insert.run({ params }, pool);
        if (users.length > 1) {
            throw new Error(
                `Expect users to have 0 or 1 element, got ${users.length} instead`
            );
        }
        const [user] = users;
        return !user
            ? ({
                  id: params.id,
                  type: 'existed',
              } as const)
            : ({
                  id: user.id,
                  type: 'created',
              } as const);
    },
    softDelete: async (params: Readonly<ISoftDeleteParams>, pool: Pool) => {
        const users = await softDelete.run(params, pool);
        if (users.length !== 1) {
            throw new Error(
                `Expect users to have 1 element, got ${users.length} instead`
            );
        }
        const [user] = users;
        if (!user) {
            throw new Error('user cannot be undefined');
        }
        const { id, time_deleted } = user;
        if (time_deleted === null) {
            throw new Error(`Expect time_deleted to be Date, got null instead`);
        }
        return {
            id,
            timeDeleted: time_deleted,
        };
    },
};

export default user;
