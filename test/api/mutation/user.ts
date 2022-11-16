import postgreSQL from '../../../src/database/postgres';
import utariUser from '../../../src/database/table/utariUser';
import { describe, it, expect } from 'vitest';

const testUserMutation = () =>
    describe('User querying and mutation', () => {
        const id = '41bd91ae-a2bf-4715-9496';
        it('should return undefined for non-existing id', async () => {
            expect(
                await utariUser.select({ id }, postgreSQL.instance.pool)
            ).toBe(undefined);
        });
        it('should attest that id can be inserted, once inserted, attempt to insert will not do anything to it', async () => {
            expect(
                await utariUser.insert(
                    { id, timeCreated: new Date() },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual({
                id,
                type: 'created',
            });
            expect(
                await utariUser.select({ id }, postgreSQL.instance.pool)
            ).toBe(id);
            expect(
                await utariUser.insert(
                    { id, timeCreated: new Date() },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual({
                id,
                type: 'existed',
            });
        });
        it('should delete the id inserted', async () => {
            const timeDeleted = new Date();
            expect(
                await utariUser.softDelete(
                    { id, timeDeleted },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual({
                id,
                timeDeleted,
            });
            expect(
                await utariUser.select({ id }, postgreSQL.instance.pool)
            ).toBe(undefined);
        });
    });

export default testUserMutation;
