import reset from '../../../script/resetDatabase';
import postgreSQL from '../../../src/database/postgres';
import insertToDatabase from '../../../src/api/populate';
import room from '../../dummy/api/populate/emptyContact.json';
import { Accommodations } from 'utari-common';
import { beforeAll, describe, it, expect } from 'vitest';

const testEmptyContactPopulation = () =>
    describe('Insert Empty Contact', () => {
        beforeAll(async () => {
            const { db } = await reset;
            await db(postgreSQL.instance.exec);
        });
        describe('Only handler with non-empty contact (array of email or contact number) can be inserted', () => {
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
