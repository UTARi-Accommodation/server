import postgreSQL from '../../../src/database/postgres';
import timeScrap from '../../../src/database/table/timeScrap';

describe('Scrapper', () => {
    it('should insert the time started and completed scrapping', async () => {
        const timeStarted = new Date();
        const timeCompleted = new Date();
        expect(
            await timeScrap.insert(
                { timeStarted, timeCompleted },
                postgreSQL.instance.pool
            )
        ).toStrictEqual({
            timeStarted,
            timeCompleted,
            id: 1,
        });
    });
    afterAll(async () => {
        await postgreSQL.instance.close();
    });
});
