import schema from '../../script/schema';
import postgreSQL from '../../../src/database/postgres';
import insertToDatabase from '../../../src/api/populate';
import { insert, update } from '../../dummy/api/populate/room.json';
import { Accommodations } from 'utari-common';
import resetTablesAndColumns from '../../../src/database/action/resetTablesAndColumns';

const testRoomPopulate = () =>
    describe('Room', () => {
        describe('Insert', () => {
            beforeAll(async () => {
                await postgreSQL.instance.exec((await schema).drop);
                await postgreSQL.instance.exec((await schema).create);
                await insertToDatabase(insert as Accommodations, 'BTHO');
            });
            const handlerID = '054658721';
            const accommodationId = 26729;

            it('should be the same handler', async () => {
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
                expect(name).toBe('Chew Chu Yao');
                expect(id).toBe(handlerID);
                expect(handlerType).toBe('Owner');
            });

            it('should be the same email', async () => {
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
                expect(mail).toBe('chewyao@hotmail.com');
                expect(emailHandler).toBe(handlerID);
            });

            it('should be the same mobile number', async () => {
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

            it('should be the same accommodation', async () => {
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
            });

            it('should be the same room', async () => {
                const rooms = (
                    await postgreSQL.instance.exec(
                        `SELECT id, accommodation, room_type, room_size, rental, available FROM room WHERE accommodation=${accommodationId}`
                    )
                ).rows;

                expect(rooms.length).toBe(3);

                const [small, middle, master] = rooms;

                if (!small) {
                    throw new Error('small is undefined');
                }

                expect(small.id).toBe(1);
                expect(small.accommodation).toBe(accommodationId);
                expect(small.rental).toBe('380.00');
                expect(small.room_type).toBe('Room');
                expect(small.room_size).toBe('Small');
                expect(small.available).toBe(true);

                if (!middle) {
                    throw new Error('middle is undefined');
                }

                expect(middle.id).toBe(2);
                expect(middle.accommodation).toBe(accommodationId);
                expect(middle.rental).toBe('3800.00');
                expect(middle.room_type).toBe('Room');
                expect(middle.room_size).toBe('Middle');
                expect(middle.available).toBe(true);

                if (!master) {
                    throw new Error('master is undefined');
                }

                expect(master.id).toBe(3);
                expect(master.accommodation).toBe(accommodationId);
                expect(master.rental).toBe('38000.00');
                expect(master.room_type).toBe('Room');
                expect(master.room_size).toBe('Master');
                expect(master.available).toBe(true);
            });

            it('should be the same room capacities', async () => {
                const capacities = (
                    await postgreSQL.instance.exec(
                        `SELECT id, room, capacities FROM room_capacity`
                    )
                ).rows;

                console.dir(capacities, { depth: null });

                expect(capacities.length).toBe(5);

                expect(capacities[0]?.id).toBe(1);
                expect(capacities[0]?.room).toBe(1);
                expect(capacities[0]?.capacities).toBe(1);
                expect(capacities[1]?.id).toBe(2);
                expect(capacities[1]?.room).toBe(1);
                expect(capacities[1]?.capacities).toBe(2);

                expect(capacities[2]?.id).toBe(3);
                expect(capacities[2]?.room).toBe(2);
                expect(capacities[2]?.capacities).toBe(1);
                expect(capacities[3]?.id).toBe(4);
                expect(capacities[3]?.room).toBe(2);
                expect(capacities[3]?.capacities).toBe(3);

                expect(capacities[4]?.id).toBe(5);
                expect(capacities[4]?.room).toBe(3);
                expect(capacities[4]?.capacities).toBe(5);
            });
        });

        describe('Update', () => {
            beforeAll(async () => {
                await resetTablesAndColumns(postgreSQL.instance.pool);
                await insertToDatabase(update as Accommodations, 'BTHO');
            });
            const handlerID = '0183899550';
            const accommodationId = 26729;

            it('should be the same handler', async () => {
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
                expect(name).toBe('Tony Stark');
                expect(id).toBe(handlerID);
                expect(handlerType).toBe('Owner');
            });

            it('should be the same email', async () => {
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
                expect(mail).toBe('tonystark@google.com');
                expect(emailHandler).toBe(handlerID);
            });

            it('should be the same mobile nubmer', async () => {
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
                expect(number).toBe('0183899550');
                expect(mobileNumberHandler).toBe(handlerID);
            });

            it('should be the same accommodation', async () => {
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
            });

            it('should be the same room', async () => {
                const rooms = (
                    await postgreSQL.instance.exec(
                        `SELECT id, accommodation, room_type, room_size, rental, available FROM room WHERE accommodation=${accommodationId}`
                    )
                ).rows;

                expect(rooms.length).toBe(3);

                const [small, middle, master] = rooms;

                if (!small) {
                    throw new Error('small is undefined');
                }

                expect(small.id).toBe(1);
                expect(small.accommodation).toBe(accommodationId);
                expect(small.rental).toBe('380.00');
                expect(small.room_type).toBe('Room');
                expect(small.room_size).toBe('Small');
                expect(small.available).toBe(true);

                if (!middle) {
                    throw new Error('middle is undefined');
                }

                expect(middle.id).toBe(2);
                expect(middle.accommodation).toBe(accommodationId);
                expect(middle.rental).toBe('385.00');
                expect(middle.room_type).toBe('Room');
                expect(middle.room_size).toBe('Middle');
                expect(middle.available).toBe(true);

                if (!master) {
                    throw new Error('master is undefined');
                }

                expect(master.id).toBe(3);
                expect(master.accommodation).toBe(accommodationId);
                expect(master.rental).toBe('900.00');
                expect(master.room_type).toBe('Room');
                expect(master.room_size).toBe('Master');
                expect(master.available).toBe(true);
            });

            it('should be the same room capacities', async () => {
                const capacities = (
                    await postgreSQL.instance.exec(
                        `SELECT id, room, capacities FROM room_capacity`
                    )
                ).rows;

                expect(capacities.length).toBe(3);

                expect(capacities[0]?.id).toBe(1);
                expect(capacities[0]?.room).toBe(1);
                expect(capacities[0]?.capacities).toBe(1);

                expect(capacities[1]?.id).toBe(2);
                expect(capacities[1]?.room).toBe(2);
                expect(capacities[1]?.capacities).toBe(2);

                expect(capacities[2]?.id).toBe(3);
                expect(capacities[2]?.room).toBe(3);
                expect(capacities[2]?.capacities).toBe(4);
            });
        });
    });

export default testRoomPopulate;
