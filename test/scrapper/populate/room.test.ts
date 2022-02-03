import { create, drop } from '../../script/schema';
import PostgreSQL from '../../../src/database/postgres';
import { Accommodations } from '../../../src/scrapper/scrapper/fetchParser';
import insertToDatabase from '../../../src/scrapper/populate/populate';
import { insert, update } from '../../dummy/populate/room.json';
import select from '../../../src/database/query/select';
import { equal } from '../../../src/database/common/whereClause';
import Puppeteer from '../../../src/scrapper/scrapper/puppeteer';

describe('Room', () => {
    beforeAll(async () => {
        await PostgreSQL.getPoolInstance().exec(drop);
        await PostgreSQL.getPoolInstance().exec(create);
    });
    describe('Insert', () => {
        it('should insert all', async () => {
            await insertToDatabase(insert as Accommodations, 'BTHO');
            const handlerID = '0183899550';

            // handler
            const handlers = await PostgreSQL.getPoolInstance().select(
                select(['name', 'id', 'handlerType'])
                    .from('handler')
                    .where(equal('id', handlerID))
                    .toQuery()
            );
            expect(handlers.length).toBe(1);

            const [handler] = handlers;

            if (!handler) {
                throw new Error('handler is undefined');
            }

            const { name, id, handlerType } = handler;
            expect(name).toBe('Chew Chu Yao');
            expect(id).toBe(handlerID);
            expect(handlerType).toBe('Owner');

            // email
            const emails = await PostgreSQL.getPoolInstance().select(
                select(['id', 'handler'])
                    .from('email')
                    .where(equal('handler', handlerID))
                    .toQuery()
            );
            expect(emails.length).toBe(1);

            const [email] = emails;

            if (!email) {
                throw new Error('email is undefined');
            }

            const { id: emailID, handler: emailHandler } = email;
            expect(emailID).toBe('chewyao@hotmail.com');
            expect(emailHandler).toBe(handlerID);

            // mobile number
            const mobileNumbers = await PostgreSQL.getPoolInstance().select(
                select(['id', 'handler'])
                    .from('mobile_number')
                    .where(equal('handler', handlerID))
                    .toQuery()
            );
            expect(mobileNumbers.length).toBe(1);

            const [mobileNumber] = mobileNumbers;

            if (!mobileNumber) {
                throw new Error('mobileNumber is undefined');
            }

            const { id: mobileNumberID, handler: mobileNumberHandler } =
                mobileNumber;
            expect(mobileNumberID).toBe('0183899550');
            expect(mobileNumberHandler).toBe(handlerID);

            // accommodation
            const accommodations = await PostgreSQL.getPoolInstance().select(
                select([
                    'id',
                    'handler',
                    'address',
                    'latitude',
                    'longitude',
                    'remark',
                    'month',
                    'year',
                    'region',
                    'facilities',
                    'accommodationType',
                    'available',
                ])
                    .from('accommodation')
                    .where(equal('handler', handlerID))
                    .toQuery()
            );
            expect(accommodations.length).toBe(1);

            const [accommodation] = accommodations;

            if (!accommodation) {
                throw new Error('accommodation is undefined');
            }

            const {
                id: accommodationID,
                handler: accommodationHandler,
                address,
                latitude,
                longitude,
                remark,
                month,
                year,
                region,
                facilities,
                accommodationType,
                available,
            } = accommodation;
            expect(accommodationID).toBe(26729);
            expect(accommodationHandler).toBe(handlerID);
            expect(latitude).toBe(3.046815);
            expect(longitude).toBe(101.786024);
            expect(address).toBe(
                '32A, Jalan Putera 7/1, Bandar Mahkota Cheras, 43200, Kajang, Selangor'
            );
            expect(remark).toBe(
                'Small room attached with toilet can fit 1 person.RM380 for whole room'
            );
            expect(month).toBe('August');
            expect(year).toBe(2020);
            expect(region).toBe('BTHO');
            expect(facilities).toBe(
                'Table/Chair, Cupboard, Fan, Internet, Washing Machine, Water Heater'
            );
            expect(accommodationType).toBe('Room');
            expect(available).toBe(true);

            if (accommodationID === undefined) {
                throw new Error(
                    'accommodationID is undefined, which is impossible'
                );
            }
            // room
            const rooms = await PostgreSQL.getPoolInstance().select(
                select([
                    'id',
                    'accommodation',
                    'roomType',
                    'roomSize',
                    'rental',
                    'available',
                ])
                    .from('room')
                    .where(equal('accommodation', accommodationID))
                    .toQuery()
            );
            expect(rooms.length).toBe(3);

            const [small, middle, master] = rooms;

            if (!small) {
                throw new Error('small is undefined');
            }

            expect(small.id).toBe(1);
            expect(small.accommodation).toBe(accommodationID);
            expect(small.rental).toBe('RM380.00');
            expect(small.roomType).toBe('Room');
            expect(small.roomSize).toBe('Small');
            expect(small.available).toBe(true);

            if (!middle) {
                throw new Error('middle is undefined');
            }

            expect(middle.id).toBe(2);
            expect(middle.accommodation).toBe(accommodationID);
            expect(middle.rental).toBe('RM3,800.00');
            expect(middle.roomType).toBe('Room');
            expect(middle.roomSize).toBe('Middle');
            expect(middle.available).toBe(true);

            if (!master) {
                throw new Error('master is undefined');
            }

            expect(master.id).toBe(3);
            expect(master.accommodation).toBe(accommodationID);
            expect(master.rental).toBe('RM38,000.00');
            expect(master.roomType).toBe('Room');
            expect(master.roomSize).toBe('Master');
            expect(master.available).toBe(true);

            // room_capacity
            const capacity = await PostgreSQL.getPoolInstance().select(
                select(['id', 'room', 'capacity'])
                    .from('room_capacity')
                    .toQuery()
            );
            expect(capacity.length).toBe(5);

            expect(capacity[0]?.id).toBe(1);
            expect(capacity[0]?.room).toBe(1);
            expect(capacity[0]?.capacity).toBe(1);
            expect(capacity[1]?.id).toBe(2);
            expect(capacity[1]?.room).toBe(1);
            expect(capacity[1]?.capacity).toBe(2);

            expect(capacity[2]?.id).toBe(3);
            expect(capacity[2]?.room).toBe(2);
            expect(capacity[2]?.capacity).toBe(1);
            expect(capacity[3]?.id).toBe(4);
            expect(capacity[3]?.room).toBe(2);
            expect(capacity[3]?.capacity).toBe(3);

            expect(capacity[4]?.id).toBe(5);
            expect(capacity[4]?.room).toBe(3);
            expect(capacity[4]?.capacity).toBe(5);
        });
    });
    describe('Update', () => {
        it('should update for same data', async () => {
            await PostgreSQL.getPoolInstance().resetSomeTablesAndColumns();
            await insertToDatabase(update as Accommodations, 'BTHO');
            const handlerID = '0183899550';

            //handler
            const handlers = await PostgreSQL.getPoolInstance().select(
                select(['name', 'id', 'handlerType'])
                    .from('handler')
                    .where(equal('id', handlerID))
                    .toQuery()
            );
            expect(handlers.length).toBe(1);

            const [handler] = handlers;

            if (!handler) {
                throw new Error('handler is undefined');
            }

            const { name, id, handlerType } = handler;
            expect(name).toBe('Tony Stark');
            expect(id).toBe(handlerID);
            expect(handlerType).toBe('Owner');

            // email
            const emails = await PostgreSQL.getPoolInstance().select(
                select(['id', 'handler'])
                    .from('email')
                    .where(equal('handler', handlerID))
                    .toQuery()
            );
            expect(emails.length).toBe(1);

            const [email] = emails;

            if (!email) {
                throw new Error('email is undefined');
            }

            const { id: emailID, handler: emailHandler } = email;
            expect(emailID).toBe('tonystark@google.com');
            expect(emailHandler).toBe(handlerID);

            // mobile number
            const mobileNumbers = await PostgreSQL.getPoolInstance().select(
                select(['id', 'handler'])
                    .from('mobile_number')
                    .where(equal('handler', handlerID))
                    .toQuery()
            );
            expect(mobileNumbers.length).toBe(1);

            const [mobileNumber] = mobileNumbers;

            if (!mobileNumber) {
                throw new Error('mobileNumber is undefined');
            }

            const { id: mobileNumberID, handler: mobileNumberHandler } =
                mobileNumber;
            expect(mobileNumberID).toBe('0183899550');
            expect(mobileNumberHandler).toBe(handlerID);

            // accommodation
            const accommodations = await PostgreSQL.getPoolInstance().select(
                select([
                    'id',
                    'handler',
                    'address',
                    'latitude',
                    'longitude',
                    'remark',
                    'month',
                    'year',
                    'region',
                    'facilities',
                    'accommodationType',
                    'available',
                ])
                    .from('accommodation')
                    .where(equal('handler', handlerID))
                    .toQuery()
            );
            expect(accommodations.length).toBe(1);

            const [accommodation] = accommodations;

            if (!accommodation) {
                throw new Error('accommodation is undefined');
            }

            const {
                id: accommodationID,
                handler: accommodationHandler,
                address,
                latitude,
                longitude,
                remark,
                month,
                year,
                region,
                facilities,
                accommodationType,
                available,
            } = accommodation;
            expect(accommodationID).toBe(26729);
            expect(accommodationHandler).toBe(handlerID);
            expect(latitude).toBe(3.046815);
            expect(longitude).toBe(101.786024);
            expect(address).toBe(
                '32A, Jalan Putera 7/1, Bandar Mahkota Cheras, 43200, Kajang, Selangor'
            );
            expect(remark).toBe('I am Iron Man');
            expect(month).toBe('September');
            expect(year).toBe(2000);
            expect(region).toBe('BTHO');
            expect(facilities).toBe('Mark Suits');
            expect(accommodationType).toBe('Room');
            expect(available).toBe(true);

            if (accommodationID === undefined) {
                throw new Error(
                    'accommodationID is undefined, which is impossible'
                );
            }
            // room
            const rooms = await PostgreSQL.getPoolInstance().select(
                select([
                    'id',
                    'accommodation',
                    'roomType',
                    'roomSize',
                    'rental',
                    'available',
                ])
                    .from('room')
                    .where(equal('accommodation', accommodationID))
                    .toQuery()
            );
            expect(rooms.length).toBe(3);

            const [small, middle, master] = Array.from(rooms).sort(
                (a: any, b: any) => a.id - b.id
            );

            if (!small) {
                throw new Error('small is undefined');
            }

            expect(small.id).toBe(1);
            expect(small.accommodation).toBe(accommodationID);
            expect(small.rental).toBe('RM380.00');
            expect(small.roomType).toBe('Room');
            expect(small.roomSize).toBe('Small');
            expect(small.available).toBe(true);

            if (!middle) {
                throw new Error('middle is undefined');
            }

            expect(middle.id).toBe(2);
            expect(middle.accommodation).toBe(accommodationID);
            expect(middle.rental).toBe('RM385.00');
            expect(middle.roomType).toBe('Room');
            expect(middle.roomSize).toBe('Middle');
            expect(middle.available).toBe(true);

            if (!master) {
                throw new Error('master is undefined');
            }

            expect(master.id).toBe(3);
            expect(master.accommodation).toBe(accommodationID);
            expect(master.rental).toBe('RM900.00');
            expect(master.roomType).toBe('Room');
            expect(master.roomSize).toBe('Master');
            expect(master.available).toBe(true);

            // room_capacity
            const capacity = await PostgreSQL.getPoolInstance().select(
                select(['id', 'room', 'capacity'])
                    .from('room_capacity')
                    .toQuery()
            );
            expect(capacity.length).toBe(3);

            expect(capacity[0]?.id).toBe(1);
            expect(capacity[0]?.room).toBe(1);
            expect(capacity[0]?.capacity).toBe(1);

            expect(capacity[1]?.id).toBe(2);
            expect(capacity[1]?.room).toBe(2);
            expect(capacity[1]?.capacity).toBe(2);

            expect(capacity[2]?.id).toBe(3);
            expect(capacity[2]?.room).toBe(3);
            expect(capacity[2]?.capacity).toBe(4);
        });
    });
    afterAll(async () => {
        await PostgreSQL.getPoolInstance().exec(drop);
        await PostgreSQL.getPoolInstance().close();
        await (await Puppeteer.getInstance()).close();
    });
});
