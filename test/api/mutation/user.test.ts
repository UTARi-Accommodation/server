import postgreSQL from '../../../src/database/postgres';
import utariUser from '../../../src/database/table/utariUser';

describe('user', () => {
    const id = '41bd91ae-a2bf-4715-9496';
    it('should select undefined id', async () => {
        expect(await utariUser.select({ id }, postgreSQL.instance.pool)).toBe(
            undefined
        );
    });
    it('should insert the id', async () => {
        expect(await utariUser.select({ id }, postgreSQL.instance.pool)).toBe(
            undefined
        );
        expect(
            await utariUser.insert(
                { id, timeCreated: new Date() },
                postgreSQL.instance.pool
            )
        ).toStrictEqual({
            id,
            type: 'created',
        });
        expect(await utariUser.select({ id }, postgreSQL.instance.pool)).toBe(
            id
        );
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
    it('should delete the id', async () => {
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
        expect(await utariUser.select({ id }, postgreSQL.instance.pool)).toBe(
            undefined
        );
    });
    afterAll(async () => {
        await postgreSQL.instance.close();
    });
});
