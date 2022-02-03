import { create, drop } from '../../script/schema';
import PostgreSQL from '../../../src/database/postgres';
import { Accommodations } from '../../../src/scrapper/scrapper/fetchParser';
import insertToDatabase from '../../../src/scrapper/populate/populate';
import { insert, update } from '../../dummy/populate/unit.json';
import select from '../../../src/database/query/select';
import { equal } from '../../../src/database/common/whereClause';
import Puppeteer from '../../../src/scrapper/scrapper/puppeteer';

describe('Unit', () => {
    beforeAll(async () => {
        await PostgreSQL.getPoolInstance().exec(drop);
        await PostgreSQL.getPoolInstance().exec(create);
    });
    describe('Insert', () => {
        it('should insert all', async () => {
            await insertToDatabase(insert as Accommodations, 'BTHO');
            const handlerID = '0123038119';

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
            expect(name).toBe('Chea Moon Sing');
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
            expect(emailID).toBe('moonsing@gmail.com');
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
            expect(mobileNumberID).toBe('0123038119');
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
            expect(accommodationID).toBe(26767);
            expect(accommodationHandler).toBe(handlerID);
            expect(latitude).toBe(3.065828);
            expect(longitude).toBe(101.795256);
            expect(address).toBe(
                '9, Jalan Bentara 8/5, Sek 5, Bandar Makhota Cheras 43200, Cheras, Selangor'
            );
            expect(remark).toBe(
                'Partial furnished double storey house, 3+1 rooms, 3 bathrooms with water heater, 2 air-conds, kitchen cabinet with stove, wardrobe in master bedroom and stainless steel grilles. View to appreciate'
            );
            expect(month).toBe('May');
            expect(year).toBe(2020);
            expect(region).toBe('BTHO');
            expect(facilities).toBe(
                'Cupboard, Fan, Air-Conditioner, Water Heater'
            );
            expect(accommodationType).toBe('Unit');
            expect(available).toBe(true);

            if (accommodationID === undefined) {
                throw new Error(
                    'accommodationID is undefined, which is impossible'
                );
            }

            // unit
            const units = await PostgreSQL.getPoolInstance().select(
                select([
                    'id',
                    'accommodation',
                    'bathRooms',
                    'bedRooms',
                    'rental',
                    'unitType',
                    'available',
                ])
                    .from('unit')
                    .where(equal('accommodation', accommodationID))
                    .toQuery()
            );
            expect(units.length).toBe(1);

            const [unit] = units;

            if (!unit) {
                throw new Error('unit is undefined');
            }

            const {
                id: unitID,
                accommodation: unitAccommodationID,
                bathRooms,
                bedRooms,
                rental,
                unitType,
                available: unitAvailable,
            } = unit;
            expect(unitID).toBe(1);
            expect(unitAccommodationID).toBe(26767);
            expect(bathRooms).toBe(3);
            expect(bedRooms).toBe(4);
            expect(rental).toBe('RM1,500.00');
            expect(unitType).toBe('House');
            expect(unitAvailable).toBe(true);
        });
    });
    describe('Update', () => {
        it('should update for same data', async () => {
            await PostgreSQL.getPoolInstance().resetSomeTablesAndColumns();
            await insertToDatabase(update as Accommodations, 'BTHO');
            const handlerID = '0123038119';

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
            expect(name).toBe('MoonKnight');
            expect(id).toBe(handlerID);
            expect(handlerType).toBe('Tenant');

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
            expect(emailID).toBe('moonKnight@gmail.com');
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
            expect(mobileNumberID).toBe('0123038119');
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
            expect(accommodationID).toBe(26767);
            expect(latitude).toBe(3.065828);
            expect(longitude).toBe(101.795256);
            expect(address).toBe(
                '9, Jalan Bentara 8/5, Sek 5, Bandar Makhota Cheras 43200, Cheras, Selangor'
            );
            expect(accommodationHandler).toBe(handlerID);
            expect(remark).toBe('Who needs remark??');
            expect(month).toBe('June');
            expect(year).toBe(9999);
            expect(region).toBe('BTHO');
            expect(facilities).toBe('Contact me to find out');
            expect(accommodationType).toBe('Unit');
            expect(available).toBe(true);

            if (accommodationID === undefined) {
                throw new Error(
                    'accommodationID is undefined, which is impossible'
                );
            }

            // unit
            const units = await PostgreSQL.getPoolInstance().select(
                select([
                    'id',
                    'accommodation',
                    'bathRooms',
                    'bedRooms',
                    'rental',
                    'unitType',
                    'available',
                ])
                    .from('unit')
                    .where(equal('accommodation', accommodationID))
                    .toQuery()
            );
            expect(units.length).toBe(1);

            const [unit] = units;

            if (!unit) {
                throw new Error('unit is undefined');
            }

            const {
                id: unitID,
                accommodation: unitAccommodationID,
                bathRooms,
                bedRooms,
                rental,
                unitType,
                available: unitAvailable,
            } = unit;
            expect(unitID).toBe(1);
            expect(unitAccommodationID).toBe(26767);
            expect(bathRooms).toBe(9);
            expect(bedRooms).toBe(4);
            expect(rental).toBe('RM1,500,000.00');
            expect(unitType).toBe('House');
            expect(unitAvailable).toBe(true);
        });
    });
    afterAll(async () => {
        await PostgreSQL.getPoolInstance().exec(drop);
        await PostgreSQL.getPoolInstance().close();
        await (await Puppeteer.getInstance()).close();
    });
});
