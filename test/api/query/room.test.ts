import { create, drop } from '../../script/schema';
import PostgreSQL from '../../../src/database/postgres';
import { Accommodations } from '../../../src/scrapper/scrapper/fetchParser';
import insertToDatabase from '../../../src/scrapper/populate/populate';
import {
    rooms,
    btho,
    sl,
    kp,
    remark,
    address,
    rental,
    capacity,
    roomType,
    facilities,
} from '../../dummy/api/query/room.json';
import Puppeteer from '../../../src/scrapper/scrapper/puppeteer';
import { queryRoom } from '../../../src/api/query/room';
import update from '../../../src/database/mutation/update';
import { equal } from '../../../src/database/common/whereClause';
import { createRoomRating } from '../../../src/api/mutation/rating';
import createFingerPrint from '../../../src/api/mutation/fingerPrint';
import { createRoomVisitCount } from '../../../src/api/mutation/visitCount';

describe('Room', () => {
    beforeAll(async () => {
        await PostgreSQL.getPoolInstance().exec(drop);
        await PostgreSQL.getPoolInstance().exec(create);
        await insertToDatabase(rooms as Accommodations, 'BTHO');

        // set region to KP
        PostgreSQL.getPoolInstance().update(
            update('accommodation')
                .set({
                    region: 'KP',
                })
                .where(equal('id', 26387))
                .or(equal('id', 26375))
                .or(equal('id', 30000))
                .toQuery()
        );

        //set region to SL
        PostgreSQL.getPoolInstance().update(
            update('accommodation')
                .set({
                    region: 'SL',
                })
                .where(equal('id', 27082))
                .or(equal('id', 27078))
                .or(equal('id', 27065))
                .or(equal('id', 27064))
                .or(equal('id', 26354))
                .toQuery()
        );
    });
    describe('Query', () => {
        it('should return rooms that matches the general query', async () => {
            const bthoQueried = await queryRoom({
                region: 'BTHO',
                roomType: 'Room',
                minRental: undefined,
                maxRental: undefined,
                minCapacity: undefined,
                maxCapacity: undefined,
                address: undefined,
                remark: undefined,
                facilities: undefined,
            });
            expect(bthoQueried.length).toBe(5);
            expect(bthoQueried).toStrictEqual(btho);

            const kpQueried = await queryRoom({
                region: 'KP',
                roomType: 'Room',
                minRental: undefined,
                maxRental: undefined,
                minCapacity: undefined,
                maxCapacity: undefined,
                address: undefined,
                remark: undefined,
                facilities: undefined,
            });
            expect(kpQueried.length).toBe(6);
            expect(kpQueried).toStrictEqual(kp);

            const slQueried = await queryRoom({
                region: 'SL',
                roomType: 'Room',
                minRental: undefined,
                maxRental: undefined,
                minCapacity: undefined,
                maxCapacity: undefined,
                address: undefined,
                remark: undefined,
                facilities: undefined,
            });
            expect(slQueried.length).toBe(8);
            expect(slQueried).toStrictEqual(sl);
        });
        it('should return rooms that matches the address query', async () => {
            const rows = await queryRoom({
                region: 'SL',
                roomType: 'Room',
                minRental: undefined,
                maxRental: undefined,
                minCapacity: undefined,
                maxCapacity: undefined,
                address: 'Cypress',
                remark: undefined,
                facilities: undefined,
            });
            expect(rows.length).toBe(5);
            expect(rows).toStrictEqual(address);
        });
        it('should return rooms that matches the capacity query', async () => {
            const rows = await queryRoom({
                region: 'SL',
                roomType: 'Room',
                minRental: undefined,
                maxRental: undefined,
                minCapacity: 2,
                maxCapacity: 3,
                address: undefined,
                remark: undefined,
                facilities: undefined,
            });
            expect(rows.length).toBe(3);
            expect(rows).toStrictEqual(capacity);
        });
        it('should return rooms that matches the rental query', async () => {
            const rows = await queryRoom({
                region: 'KP',
                roomType: 'Room',
                minRental: 500,
                maxRental: Number.MAX_SAFE_INTEGER,
                minCapacity: undefined,
                maxCapacity: undefined,
                address: undefined,
                remark: undefined,
                facilities: undefined,
            });
            expect(rows.length).toBe(5);
            expect(rows).toStrictEqual(rental);
        });
        it('should return rooms that matches the remark query', async () => {
            const rows = await queryRoom({
                region: 'BTHO',
                roomType: 'Room',
                minRental: undefined,
                maxRental: undefined,
                minCapacity: undefined,
                maxCapacity: undefined,
                address: undefined,
                remark: 'Utilities',
                facilities: undefined,
            });
            expect(rows.length).toBe(2);
            expect(rows).toStrictEqual(remark);
        });
        it('should return rooms that matches the facilifies query', async () => {
            const rows = await queryRoom({
                region: 'SL',
                roomType: 'Room',
                minRental: undefined,
                maxRental: undefined,
                minCapacity: undefined,
                maxCapacity: undefined,
                address: undefined,
                remark: undefined,
                facilities: 'bed',
            });
            expect(rows.length).toBe(6);
            expect(rows).toStrictEqual(facilities);
        });
        it('should return 1 room that matches the room type query', async () => {
            const fingerPrintOne = '41bd91ae-a2bf-4715-9496-2a37e8b9bcce';
            const fingerPrintTwo = '31bd91ae-a2bf-4715-9496-2a37e8b9bcce';
            const timeCreated = new Date();
            const room = 20;

            // insert finger print
            await createFingerPrint({
                id: fingerPrintOne,
                timeCreated,
            });
            await createFingerPrint({
                id: fingerPrintTwo,
                timeCreated,
            });

            // insert rating
            await createRoomRating({
                room,
                fingerPrint: fingerPrintOne,
                rating: 4,
                timeCreated,
            });
            await createRoomRating({
                room,
                fingerPrint: fingerPrintTwo,
                rating: 3,
                timeCreated,
            });

            // insert visit
            await createRoomVisitCount({
                room,
                fingerPrint: fingerPrintOne,
                timeCreated,
            });
            await createRoomVisitCount({
                room,
                fingerPrint: fingerPrintTwo,
                timeCreated,
            });

            const rows = await queryRoom({
                region: 'BTHO',
                roomType: 'Roommate',
                minRental: undefined,
                maxRental: undefined,
                minCapacity: undefined,
                maxCapacity: undefined,
                address: undefined,
                remark: undefined,
                facilities: undefined,
            });
            expect(rows.length).toBe(1);
            expect(rows).toStrictEqual(roomType);
        });
    });
    afterAll(async () => {
        await PostgreSQL.getPoolInstance().exec(drop);
        await PostgreSQL.getPoolInstance().close();
        await (await Puppeteer.getInstance()).close();
    });
});
