import schema from '../../script/schema';
import postgreSQL from '../../../src/database/postgres';
import upsertToDatabase from '../../../src/api/populate';
import {
    units,
    unitType,
    btho,
    sl,
    kp,
    searchOne,
    searchTwo,
    searchThree,
    bedRooms,
    bathRooms,
    bathAndBedRooms,
    rental,
    detailedUnit,
    bookmarkedUnit,
    downloadBookmarkedOne,
    downloadBookmarkedTwo,
} from '../../dummy/api/query/unit.json';
import geocode from '../../../src/scrapper/geocode';
import {
    generalUnit,
    bookmarkedUnit as bookmarkUnitQuery,
    detailedUnit as detailUnitQuery,
} from '../../../src/api/query/unit';
import { Accommodations } from 'utari-common';
import utariUser from '../../../src/database/table/utariUser';
import unitRating from '../../../src/database/table/unitRating';
import unitBookmarked from '../../../src/database/table/unitBookmarked';

describe('Unit', () => {
    const userId = '66067e71-8fc3-4353-899d-8906df0c6a74';
    beforeAll(async () => {
        await postgreSQL.instance.exec((await schema).drop);
        await postgreSQL.instance.exec((await schema).create);
        await upsertToDatabase(units as Accommodations, 'BTHO');

        // set region to KP
        await postgreSQL.instance.exec(
            `UPDATE accommodation SET region='KP' WHERE id=26491 OR id=26412`
        );

        //set region to SL
        await postgreSQL.instance.exec(
            `UPDATE accommodation SET region='SL' WHERE id=26388 OR id=24658`
        );

        //set unit type to Condominium
        await postgreSQL.instance.exec(
            `UPDATE unit SET unit_type='Condominium' WHERE id=7`
        );

        //add new user
        await utariUser.insert(
            { id: userId, timeCreated: new Date() },
            postgreSQL.instance.pool
        );
    });
    describe('Query', () => {
        it('should return units that matches the general query', async () => {
            const bthoQueriedWithoutRentalQuery =
                await generalUnit.selectWithoutBathRoomsAndBedRooms(
                    {
                        region: 'BTHO',
                        unitType: 'House',
                        minRental: undefined,
                        maxRental: undefined,
                        search: undefined,
                        userId,
                    },
                    postgreSQL.instance.pool
                );
            expect(bthoQueriedWithoutRentalQuery.length).toBe(2);
            expect(bthoQueriedWithoutRentalQuery).toStrictEqual(btho);

            const kpQueriedWithoutRentalQuery =
                await generalUnit.selectWithoutBathRoomsAndBedRooms(
                    {
                        region: 'KP',
                        unitType: 'House',
                        minRental: undefined,
                        maxRental: undefined,
                        search: undefined,
                        userId,
                    },
                    postgreSQL.instance.pool
                );
            expect(kpQueriedWithoutRentalQuery.length).toBe(2);
            expect(kpQueriedWithoutRentalQuery).toStrictEqual(kp);

            const slQueriedWithoutRentalQuery =
                await generalUnit.selectWithoutBathRoomsAndBedRooms(
                    {
                        region: 'SL',
                        unitType: 'House',
                        minRental: undefined,
                        maxRental: undefined,
                        search: undefined,
                        userId,
                    },
                    postgreSQL.instance.pool
                );
            expect(slQueriedWithoutRentalQuery.length).toBe(2);
            expect(slQueriedWithoutRentalQuery).toStrictEqual(sl);
        });
        it('should return units that matches the search query', async () => {
            const rowsOne = await generalUnit.selectWithoutBathRoomsAndBedRooms(
                {
                    region: 'SL',
                    unitType: 'House',
                    minRental: undefined,
                    maxRental: undefined,
                    search: 'sutera pines condo',
                    userId,
                },
                postgreSQL.instance.pool
            );
            expect(rowsOne.length).toBe(2);
            expect(rowsOne).toStrictEqual(searchOne);

            const rowsTwo = await generalUnit.selectWithoutBathRoomsAndBedRooms(
                {
                    region: 'BTHO',
                    unitType: 'House',
                    minRental: undefined,
                    maxRental: undefined,
                    search: 'mrt feeder bus',
                    userId,
                },
                postgreSQL.instance.pool
            );
            expect(rowsTwo.length).toBe(1);
            expect(rowsTwo).toStrictEqual(searchTwo);

            const rowsThree =
                await generalUnit.selectWithoutBathRoomsAndBedRooms(
                    {
                        region: 'KP',
                        unitType: 'House',
                        minRental: undefined,
                        maxRental: undefined,
                        search: 'PARKING BAY',
                        userId,
                    },
                    postgreSQL.instance.pool
                );
            expect(rowsThree.length).toBe(2);
            expect(rowsThree).toStrictEqual(searchThree);
        });
        it('should return units that matches the bed rooms query', async () => {
            const rows =
                await generalUnit.selectWithoutBathRoomsAndWithBedRooms(
                    {
                        region: 'SL',
                        unitType: 'House',
                        minRental: undefined,
                        maxRental: undefined,
                        search: undefined,
                        bedRooms: [2, 3],
                        userId,
                    },
                    postgreSQL.instance.pool
                );
            expect(rows.length).toBe(1);
            expect(rows).toStrictEqual(bedRooms);
        });
        it('should return units that matches the bath rooms query', async () => {
            const rows =
                await generalUnit.selectWithBathRoomsAndWithoutBedRooms(
                    {
                        region: 'KP',
                        unitType: 'House',
                        minRental: undefined,
                        maxRental: undefined,
                        search: undefined,
                        bathRooms: [5, 6],
                        userId,
                    },
                    postgreSQL.instance.pool
                );
            expect(rows.length).toBe(1);
            expect(rows).toStrictEqual(bathRooms);
        });
        it('should return units that matches the bath and bed rooms query', async () => {
            const rows = await generalUnit.selectWithBathRoomsAndBedRooms(
                {
                    region: 'KP',
                    unitType: 'House',
                    minRental: undefined,
                    maxRental: undefined,
                    search: undefined,
                    bathRooms: [2, 5],
                    bedRooms: [3],
                    userId,
                },
                postgreSQL.instance.pool
            );
            expect(rows.length).toBe(2);
            expect(rows).toStrictEqual(bathAndBedRooms);
        });
        it('should return units that matches the rental query', async () => {
            const rows = await generalUnit.selectWithoutBathRoomsAndBedRooms(
                {
                    region: 'KP',
                    unitType: 'House',
                    minRental: 900,
                    maxRental: 1000,
                    search: undefined,
                    userId,
                },
                postgreSQL.instance.pool
            );
            expect(rows.length).toBe(1);
            expect(rows).toStrictEqual(rental);
        });
        it('should return 1 unit that matches the unit type query', async () => {
            const rows = await generalUnit.selectWithoutBathRoomsAndBedRooms(
                {
                    region: 'BTHO',
                    unitType: 'Condominium',
                    minRental: undefined,
                    maxRental: undefined,
                    search: undefined,
                    userId,
                },
                postgreSQL.instance.pool
            );
            expect(rows.length).toBe(1);
            expect(rows).toStrictEqual(unitType);
        });
        it('should return detailed unit that match the unitId', async () => {
            const timeCreated = new Date();
            const unit = 7;
            const dummyUser = 'dummyUser';
            await utariUser.insert(
                {
                    id: userId,
                    timeCreated,
                },
                postgreSQL.instance.pool
            );
            await utariUser.insert(
                {
                    id: dummyUser,
                    timeCreated,
                },
                postgreSQL.instance.pool
            );
            await unitBookmarked.insert(
                {
                    unit,
                    user: userId,
                    timeCreated,
                },
                postgreSQL.instance.pool
            );
            await unitRating.insert(
                {
                    unit,
                    user: userId,
                    timeCreated,
                    rating: 4,
                },
                postgreSQL.instance.pool
            );
            await unitRating.insert(
                {
                    unit,
                    user: userId,
                    timeCreated,
                    rating: 3,
                },
                postgreSQL.instance.pool
            );
            await unitBookmarked.insert(
                {
                    unit,
                    user: dummyUser,
                    timeCreated,
                },
                postgreSQL.instance.pool
            );
            // user did bookmarked this room
            expect(
                await detailUnitQuery.selectWithUser(
                    {
                        id: unit,
                        userId,
                    },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual({
                ...detailedUnit,
                bookmarked: true,
                rating: 3,
            });
            expect(
                await detailUnitQuery.selectWithUser(
                    {
                        id: unit,
                        userId: dummyUser,
                    },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual({
                ...detailedUnit,
                bookmarked: true,
                rating: undefined,
            });
            // fake user Id to simulate fake user that did not bookmark this room
            expect(
                await detailUnitQuery.selectWithUser(
                    {
                        id: 7,
                        userId: '123',
                    },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual({
                ...detailedUnit,
                rating: undefined,
            });
            // user not logged in
            expect(
                await detailUnitQuery.select(
                    {
                        id: 7,
                    },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual({
                ...detailedUnit,
                rating: undefined,
            });
            expect(
                await bookmarkUnitQuery.download(
                    {
                        userId,
                        regions: ['SL', 'BTHO'],
                        unitTypes: ['Condominium', 'House'],
                        minRental: undefined,
                        maxRental: undefined,
                        search: undefined,
                        bedRooms: [3],
                        bathRooms: [2],
                    },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual(
                downloadBookmarkedTwo.map((unit: any) => ({
                    ...unit,
                    timeCreated,
                }))
            );
        });
        it('should return min and max rental, bath rooms and bed rooms', async () => {
            expect(
                await generalUnit.range(
                    {
                        unitType: 'House',
                        region: 'SL',
                    },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual({
                bathRooms: [2],
                bedRooms: [3, 4],
            });
            expect(
                await generalUnit.range(
                    {
                        unitType: 'House',
                        region: 'KP',
                    },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual({
                bathRooms: [2, 5],
                bedRooms: [3],
            });
            expect(
                await generalUnit.range(
                    {
                        unitType: 'House',
                        region: 'BTHO',
                    },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual({
                bathRooms: [2],
                bedRooms: [3],
            });
        });
        it('should return rental frequencies', async () => {
            expect(
                await generalUnit.rentalFrequency(
                    {
                        unitType: 'House',
                        region: 'SL',
                    },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual([
                [1100, 1],
                [1650, 1],
            ]);
            expect(
                await generalUnit.rentalFrequency(
                    {
                        unitType: 'House',
                        region: 'KP',
                    },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual([
                [900, 1],
                [1400, 1],
            ]);
            expect(
                await generalUnit.rentalFrequency(
                    {
                        unitType: 'House',
                        region: 'BTHO',
                    },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual([
                [1000, 1],
                [1400, 1],
            ]);
        });
        it('should return bookmarked room that match the bookmarked Id', async () => {
            const user = '41bd91ae-a2bf-4715-9496-2a37e8b9bcce';
            const timeCreatedOne = new Date();
            await utariUser.insert(
                {
                    id: user,
                    timeCreated: timeCreatedOne,
                },
                postgreSQL.instance.pool
            );
            await unitRating.insert(
                {
                    unit: 7,
                    user,
                    timeCreated: timeCreatedOne,
                    rating: 5,
                },
                postgreSQL.instance.pool
            );
            await unitBookmarked.insert(
                {
                    unit: 7,
                    user,
                    timeCreated: timeCreatedOne,
                },
                postgreSQL.instance.pool
            );
            const timeCreatedTwo = new Date();
            await unitBookmarked.insert(
                {
                    unit: 6,
                    user,
                    timeCreated: timeCreatedTwo,
                },
                postgreSQL.instance.pool
            );
            expect(
                await bookmarkUnitQuery.selectRentalFrequency(
                    {
                        userId: user,
                    },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual([[1100, 2]]);
            expect(
                await bookmarkUnitQuery.range(
                    {
                        userId: user,
                    },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual({
                bedRooms: [3],
                bathRooms: [2],
            });
            expect(
                await bookmarkUnitQuery.select(
                    {
                        userId: user,
                        regions: ['SL', 'BTHO'],
                        unitTypes: ['Condominium', 'House'],
                        minRental: undefined,
                        maxRental: undefined,
                        search: undefined,
                        bedRooms: [3],
                        bathRooms: [2],
                        maxItemsPerPage: 15,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual(bookmarkedUnit);
            expect(
                await bookmarkUnitQuery.download(
                    {
                        userId: user,
                        regions: ['SL', 'BTHO'],
                        unitTypes: ['Condominium', 'House'],
                        minRental: undefined,
                        maxRental: undefined,
                        search: undefined,
                        bedRooms: [3],
                        bathRooms: [2],
                    },
                    postgreSQL.instance.pool
                )
            ).toStrictEqual(
                downloadBookmarkedOne.map((unit: any) => ({
                    ...unit,
                    rating: unit.rating,
                    timeCreated:
                        unit.id === 7 ? timeCreatedOne : timeCreatedTwo,
                }))
            );
        });
    });
    afterAll(async () => {
        await postgreSQL.instance.close();
        await (await geocode).close();
    });
});
