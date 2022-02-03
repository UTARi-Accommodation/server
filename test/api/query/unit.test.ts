import { create, drop } from '../../script/schema';
import PostgreSQL from '../../../src/database/postgres';
import { Accommodations } from '../../../src/scrapper/scrapper/fetchParser';
import insertToDatabase from '../../../src/scrapper/populate/populate';
import {
    units,
    unitType,
    btho,
    sl,
    kp,
    address,
    bedRooms,
    bathRooms,
    rental,
    remark,
    facilities,
} from '../../dummy/api/query/unit.json';
import Puppeteer from '../../../src/scrapper/scrapper/puppeteer';
import { queryUnit } from '../../../src/api/query/unit';
import update from '../../../src/database/mutation/update';
import { equal } from '../../../src/database/common/whereClause';
import createFingerPrint from '../../../src/api/mutation/fingerPrint';
import { createUnitRating } from '../../../src/api/mutation/rating';
import { createUnitVisitCount } from '../../../src/api/mutation/visitCount';

describe('Unit', () => {
    beforeAll(async () => {
        await PostgreSQL.getPoolInstance().exec(drop);
        await PostgreSQL.getPoolInstance().exec(create);
        await insertToDatabase(units as Accommodations, 'BTHO');

        // set region to KP
        PostgreSQL.getPoolInstance().update(
            update('accommodation')
                .set({
                    region: 'KP',
                })
                .where(equal('id', 26491))
                .or(equal('id', 26412))
                .toQuery()
        );

        // set region to SL
        PostgreSQL.getPoolInstance().update(
            update('accommodation')
                .set({
                    region: 'SL',
                })
                .where(equal('id', 26388))
                .or(equal('id', 24658))
                .toQuery()
        );

        //set unit type to ApartmentCondominium
        PostgreSQL.getPoolInstance().update(
            update('unit')
                .set({
                    unitType: 'ApartmentCondominium',
                })
                .where(equal('id', 7))
                .toQuery()
        );
    });
    describe('Query', () => {
        it('should return units that matches the general query', async () => {
            const bthoQueried = await queryUnit({
                region: 'BTHO',
                unitType: 'House',
                minRental: undefined,
                maxRental: undefined,
                minBedRoom: undefined,
                maxBedRoom: undefined,
                minBathRoom: undefined,
                maxBathRoom: undefined,
                address: undefined,
                remark: undefined,
                facilities: undefined,
            });
            expect(bthoQueried.length).toBe(2);
            expect(bthoQueried).toStrictEqual(btho);

            const kpQueried = await queryUnit({
                region: 'KP',
                unitType: 'House',
                minRental: undefined,
                maxRental: undefined,
                minBedRoom: undefined,
                maxBedRoom: undefined,
                minBathRoom: undefined,
                maxBathRoom: undefined,
                address: undefined,
                remark: undefined,
                facilities: undefined,
            });
            expect(kpQueried.length).toBe(2);
            expect(kpQueried).toStrictEqual(kp);

            const slQueried = await queryUnit({
                region: 'SL',
                unitType: 'House',
                minRental: undefined,
                maxRental: undefined,
                minBedRoom: undefined,
                maxBedRoom: undefined,
                minBathRoom: undefined,
                maxBathRoom: undefined,
                address: undefined,
                remark: undefined,
                facilities: undefined,
            });
            expect(slQueried.length).toBe(2);
            expect(slQueried).toStrictEqual(sl);
        });
        it('should return units that matches the address query', async () => {
            const rows = await queryUnit({
                region: 'SL',
                unitType: 'House',
                minRental: undefined,
                maxRental: undefined,
                minBedRoom: undefined,
                maxBedRoom: undefined,
                minBathRoom: undefined,
                maxBathRoom: undefined,
                address: 'sutera pines condo',
                remark: undefined,
                facilities: undefined,
            });
            expect(rows.length).toBe(1);
            expect(rows).toStrictEqual(address);
        });
        it('should return units that matches the bed units query', async () => {
            const rows = await queryUnit({
                region: 'SL',
                unitType: 'House',
                minRental: undefined,
                maxRental: undefined,
                minBedRoom: 2,
                maxBedRoom: 3,
                minBathRoom: undefined,
                maxBathRoom: undefined,
                address: undefined,
                remark: undefined,
                facilities: undefined,
            });
            expect(rows.length).toBe(1);
            expect(rows).toStrictEqual(bedRooms);
        });
        it('should return units that matches the bath units query', async () => {
            const rows = await queryUnit({
                region: 'KP',
                unitType: 'House',
                minRental: undefined,
                maxRental: undefined,
                minBedRoom: undefined,
                maxBedRoom: undefined,
                minBathRoom: 5,
                maxBathRoom: 6,
                address: undefined,
                remark: undefined,
                facilities: undefined,
            });
            expect(rows.length).toBe(1);
            expect(rows).toStrictEqual(bathRooms);
        });
        it('should return units that matches the rental query', async () => {
            const rows = await queryUnit({
                region: 'KP',
                unitType: 'House',
                minRental: 900,
                maxRental: 1000,
                minBedRoom: undefined,
                maxBedRoom: undefined,
                minBathRoom: undefined,
                maxBathRoom: undefined,
                address: undefined,
                remark: undefined,
                facilities: undefined,
            });
            expect(rows.length).toBe(1);
            expect(rows).toStrictEqual(rental);
        });
        it('should return units that matches the remark query', async () => {
            const rows = await queryUnit({
                region: 'BTHO',
                unitType: 'House',
                minRental: 900,
                maxRental: 1000,
                minBedRoom: undefined,
                maxBedRoom: undefined,
                minBathRoom: undefined,
                maxBathRoom: undefined,
                address: undefined,
                remark: 'mrt feeder bus',
                facilities: undefined,
            });
            expect(rows.length).toBe(1);
            expect(rows).toStrictEqual(remark);
        });
        it('should return units that matches the facilifies query', async () => {
            const rows = await queryUnit({
                region: 'KP',
                unitType: 'House',
                minRental: 900,
                maxRental: 1000,
                minBedRoom: undefined,
                maxBedRoom: undefined,
                minBathRoom: undefined,
                maxBathRoom: undefined,
                address: undefined,
                remark: undefined,
                facilities: 'PARKING BAY',
            });
            expect(rows.length).toBe(1);
            expect(rows).toStrictEqual(facilities);
        });
        it('should return 1 unit that matches the unit type query', async () => {
            const fingerPrintOne = '41bd91ae-a2bf-4715-9496-2a37e8b9bcce';
            const fingerPrintTwo = '31bd91ae-a2bf-4715-9496-2a37e8b9bcce';
            const timeCreated = new Date();
            const unit = 7;

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
            await createUnitRating({
                unit,
                fingerPrint: fingerPrintOne,
                rating: 4,
                timeCreated,
            });
            await createUnitRating({
                unit,
                fingerPrint: fingerPrintTwo,
                rating: 3,
                timeCreated,
            });

            // insert visit
            await createUnitVisitCount({
                unit,
                fingerPrint: fingerPrintOne,
                timeCreated,
            });
            await createUnitVisitCount({
                unit,
                fingerPrint: fingerPrintTwo,
                timeCreated,
            });

            const rows = await queryUnit({
                region: 'BTHO',
                unitType: 'ApartmentCondominium',
                minRental: undefined,
                maxRental: undefined,
                minBedRoom: undefined,
                maxBedRoom: undefined,
                minBathRoom: undefined,
                maxBathRoom: undefined,
                address: undefined,
                remark: undefined,
                facilities: undefined,
            });
            expect(rows.length).toBe(1);
            expect(rows).toStrictEqual(unitType);
        });
    });
    afterAll(async () => {
        await PostgreSQL.getPoolInstance().exec(drop);
        await PostgreSQL.getPoolInstance().close();
        await (await Puppeteer.getInstance()).close();
    });
});
