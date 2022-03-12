import postgreSQL from '../../../src/database/postgres';
import visitor from '../../../src/database/table/visitor';

describe('visitor', () => {
    it('should insert the id', async () => {
        const id = '41bd91ae-a2bf-4715-9496';
        expect(
            await visitor.insert(
                { id, timeCreated: new Date() },
                postgreSQL.instance.pool
            )
        ).toStrictEqual({
            id,
            type: 'created',
        });
        expect(
            await visitor.insert(
                { id, timeCreated: new Date() },
                postgreSQL.instance.pool
            )
        ).toStrictEqual({
            type: 'existed',
        });
    });
    afterAll(async () => {
        await postgreSQL.instance.close();
    });
});
