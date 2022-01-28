import { create, drop } from './initDb';
import PostgreSQL from '../../src/database/postgres';
import { Accommodations } from '../../src/scrapper/scrapper/fetchParser';
import insertToDatabase from '../../src/scrapper/populate/populate';
import room from '../dummy/database/emptyContact/room.json';
import select from '../../src/database/query/select';
import Puppeteer from '../../src/scrapper/scrapper/puppeteer';

describe('Insert Empty Contact', () => {
    beforeAll(async () => {
        await PostgreSQL.getPoolInstance().exec(create);
    });
    describe('Only handler with non-empty contact can be inserted', () => {
        it('should insert only 1 handler with non-empty contact', async () => {
            await insertToDatabase(room as Accommodations, 'BTHO');

            const handlers = await PostgreSQL.getPoolInstance().select(
                select(['name', 'id', 'handlerType']).from('handler').toQuery()
            );

            expect(handlers.length).toBe(1);

            const [handler] = handlers;

            if (!handler) {
                throw new Error('handler is undefined');
            }

            const { name, id, handlerType } = handler;

            expect(name).toBe('Chew Chu Yao');
            expect(id).toBe('0183899550');
            expect(handlerType).toBe('Owner');
        });
    });
    afterAll(async () => {
        await PostgreSQL.getPoolInstance().exec(drop);
        await PostgreSQL.getPoolInstance().close();
        (await Puppeteer.getInstance()).close();
    });
});
