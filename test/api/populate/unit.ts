import schema from '../../script/schema';
import postgreSQL from '../../../src/database/postgres';
import insertToDatabase from '../../../src/api/populate';
import { insert, update } from '../../dummy/api/populate/unit.json';
import resetTablesAndColumns from '../../../src/database/action/resetTablesAndColumns';
import { Accommodations } from 'utari-common';

const testUnitPopulation = () =>
    describe('Populate Unit', () => {
        describe('Inserting a unit and quqerying the inserted unit', () => {
            beforeAll(async () => {
                await postgreSQL.instance.exec((await schema).drop);
                await postgreSQL.instance.exec((await schema).create);
                await insertToDatabase(insert as Accommodations, 'BTHO');
            });
            const handlerID = '054658721';
            const accommodationId = 26767;

            it('should return the same handler', async () => {
                const handlers = (
                    await postgreSQL.instance.exec(
                        `SELECT name, id, handler_type FROM handler WHERE id='${handlerID}'`
                    )
                ).rows;

                expect(handlers.length).toBe(1);

                const [handler] = handlers;

                if (!handler) {
                    throw new Error('handler is undefined');
                }

                const { name, id, handler_type: handlerType } = handler;
                expect(name).toBe('Chea Moon Sing');
                expect(id).toBe(handlerID);
                expect(handlerType).toBe('Owner');
            });

            it('should return the same email', async () => {
                const emails = (
                    await postgreSQL.instance.exec(
                        `SELECT email, handler FROM email WHERE handler='${handlerID}'`
                    )
                ).rows;

                expect(emails.length).toBe(1);

                const [email] = emails;

                if (!email) {
                    throw new Error('email is undefined');
                }

                const { email: mail, handler: emailHandler } = email;
                expect(mail).toBe('moonsing@gmail.com');
                expect(emailHandler).toBe(handlerID);
            });

            it('should return the same mobile number', async () => {
                const mobileNumbers = (
                    await postgreSQL.instance.exec(
                        `SELECT mobile_number, handler FROM mobile_number WHERE handler='${handlerID}'`
                    )
                ).rows;

                expect(mobileNumbers.length).toBe(1);

                const [mobileNumber] = mobileNumbers;

                if (!mobileNumber) {
                    throw new Error('mobileNumber is undefined');
                }

                const { mobile_number: number, handler: mobileNumberHandler } =
                    mobileNumber;
                expect(number).toBe('054658721');
                expect(mobileNumberHandler).toBe(handlerID);
            });

            it('should return the same accommodation', async () => {
                const accommodations = (
                    await postgreSQL.instance.exec(
                        `SELECT id, handler, address, latitude, longitude, remark, month, year, region, facilities, accommodation_type, available FROM accommodation WHERE handler='${handlerID}'`
                    )
                ).rows;

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
                    accommodation_type: accommodationType,
                    available,
                } = accommodation;
                expect(accommodationID).toBe(accommodationId);
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
            });

            it('should return the same unit', async () => {
                const units = (
                    await postgreSQL.instance.exec(
                        `SELECT id, accommodation, bath_rooms, bed_rooms, rental, unit_type, available FROM unit WHERE accommodation=${accommodationId}`
                    )
                ).rows;

                expect(units.length).toBe(1);

                const [unit] = units;

                if (!unit) {
                    throw new Error('unit is undefined');
                }

                const {
                    id: unitID,
                    accommodation: unitAccommodationID,
                    bath_rooms: bathRooms,
                    bed_rooms: bedRooms,
                    rental,
                    unit_type: unitType,
                    available: unitAvailable,
                } = unit;
                expect(unitID).toBe(1);
                expect(unitAccommodationID).toBe(26767);
                expect(bathRooms).toBe(3);
                expect(bedRooms).toBe(4);
                expect(rental).toBe('1500.00');
                expect(unitType).toBe('House');
                expect(unitAvailable).toBe(true);
            });
        });

        describe('Updating the inserted unit and querying the updated unit', () => {
            beforeAll(async () => {
                await resetTablesAndColumns(postgreSQL.instance.pool);
                await insertToDatabase(update as Accommodations, 'BTHO');
            });
            const handlerID = '0123038119';
            const accommodationId = 26767;

            it('should return the same handler', async () => {
                const handlers = (
                    await postgreSQL.instance.exec(
                        `SELECT name, id, handler_type FROM handler WHERE id='${handlerID}'`
                    )
                ).rows;

                expect(handlers.length).toBe(1);

                const [handler] = handlers;

                if (!handler) {
                    throw new Error('handler is undefined');
                }

                const { name, id, handler_type: handlerType } = handler;
                expect(name).toBe('MoonKnight');
                expect(id).toBe(handlerID);
                expect(handlerType).toBe('Tenant');
            });

            it('should return the same email', async () => {
                const emails = (
                    await postgreSQL.instance.exec(
                        `SELECT email, handler FROM email WHERE handler='${handlerID}'`
                    )
                ).rows;

                expect(emails.length).toBe(1);

                const [email] = emails;

                if (!email) {
                    throw new Error('email is undefined');
                }

                const { email: mail, handler: emailHandler } = email;
                expect(mail).toBe('moonKnight@gmail.com');
                expect(emailHandler).toBe(handlerID);
            });

            it('should return the same mobile number', async () => {
                const mobileNumbers = (
                    await postgreSQL.instance.exec(
                        `SELECT mobile_number, handler FROM mobile_number WHERE handler='${handlerID}'`
                    )
                ).rows;

                expect(mobileNumbers.length).toBe(1);

                const [mobileNumber] = mobileNumbers;

                if (!mobileNumber) {
                    throw new Error('mobileNumber is undefined');
                }

                const { mobile_number: number, handler: mobileNumberHandler } =
                    mobileNumber;
                expect(number).toBe('0123038119');
                expect(mobileNumberHandler).toBe(handlerID);
            });

            it('should return the same accommodation', async () => {
                const accommodations = (
                    await postgreSQL.instance.exec(
                        `SELECT id, handler, address, latitude, longitude, remark, month, year, region, facilities, accommodation_type, available FROM accommodation WHERE handler='${handlerID}'`
                    )
                ).rows;

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
                    accommodation_type: accommodationType,
                    available,
                } = accommodation;
                expect(accommodationID).toBe(accommodationId);
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
            });

            // unit
            it('should return the same unit', async () => {
                const units = (
                    await postgreSQL.instance.exec(
                        `SELECT id, accommodation, bath_rooms, bed_rooms, rental, unit_type, available FROM unit WHERE accommodation='${accommodationId}'`
                    )
                ).rows;

                expect(units.length).toBe(1);

                const [unit] = units;

                if (!unit) {
                    throw new Error('unit is undefined');
                }

                const {
                    id: unitID,
                    accommodation: unitAccommodationID,
                    bath_rooms: bathRooms,
                    bed_rooms: bedRooms,
                    rental,
                    unit_type: unitType,
                    available: unitAvailable,
                } = unit;
                expect(unitID).toBe(1);
                expect(unitAccommodationID).toBe(26767);
                expect(bathRooms).toBe(9);
                expect(bedRooms).toBe(4);
                expect(rental).toBe('1500000.00');
                expect(unitType).toBe('House');
                expect(unitAvailable).toBe(true);
            });
        });
    });

export default testUnitPopulation;
