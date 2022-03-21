import schema from '../../script/schema';
import postgreSQL from '../../../src/database/postgres';
import insertToDatabase from '../../../src/api/populate';
import room from '../../dummy/api/populate/emptyContact.json';
import { Accommodations } from 'utari-common';

const testEmptyContactPopulation = () =>
    describe('Insert Empty Contact', () => {
        beforeAll(async () => {
            await postgreSQL.instance.exec((await schema).drop);
            await postgreSQL.instance.exec((await schema).create);
        });
        describe('Only handler with non-empty contact can be inserted', () => {
            it('should insert only 1 handler with non-empty contact', async () => {
                await insertToDatabase(room as Accommodations, 'BTHO');

                const handlers = (
                    await postgreSQL.instance.exec('SELECT * FROM handler')
                ).rows;

                expect(handlers.length).toBe(1);

                const [handler] = handlers;

                if (!handler) {
                    throw new Error('handler is undefined');
                }

                const { name, id, handler_type: handlerType } = handler;

                expect(name).toBe('Chew Chu Yao');
                expect(id).toBe('0183899550');
                expect(handlerType).toBe('Owner');
            });
        });
    });

export default testEmptyContactPopulation;
