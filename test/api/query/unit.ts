import reset from '../../script/reset';
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
import {
    generalUnit,
    bookmarkedUnit as bookmarkUnitQuery,
    detailedUnit as detailUnitQuery,
} from '../../../src/api/query/unit';
import { Accommodations, maxItemsPerPage } from 'utari-common';
import utariUser from '../../../src/database/table/utariUser';
import unitRating from '../../../src/database/table/unitRating';
import unitBookmarked from '../../../src/database/table/unitBookmarked';
import { Search } from './room';

const testUnitQuery = () =>
    describe('Query Unit', () => {
        const userId = '66067e71-8fc3-4353-899d-8906df0c6a74';
        beforeAll(async () => {
            const { db } = await reset;
            await db(postgreSQL.instance.exec);
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
                const bthoProps = {
                    region: 'BTHO',
                    unitType: 'House',
                    minRental: undefined,
                    maxRental: undefined,
                    search: undefined as Search,
                    userId,
                    ...(await generalUnit.range(
                        {
                            region: 'BTHO',
                            unitType: 'House',
                        },
                        postgreSQL.instance.pool
                    )),
                };
                const bthoQueriedWithoutRentalQuery = await generalUnit.general(
                    {
                        ...bthoProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                const bthoCount = await generalUnit.count(
                    bthoProps,
                    postgreSQL.instance.pool
                );
                expect(bthoQueriedWithoutRentalQuery).toStrictEqual(btho);
                expect(bthoCount === btho.length && bthoCount === 2).toBe(true);

                const kpProps = {
                    region: 'KP',
                    unitType: 'House',
                    minRental: undefined,
                    maxRental: undefined,
                    search: undefined,
                    userId,
                    ...(await generalUnit.range(
                        {
                            region: 'KP',
                            unitType: 'House',
                        },
                        postgreSQL.instance.pool
                    )),
                } as const;
                const kpQueriedWithoutRentalQuery = await generalUnit.general(
                    {
                        ...kpProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                const kpCount = await generalUnit.count(
                    kpProps,
                    postgreSQL.instance.pool
                );
                expect(kpQueriedWithoutRentalQuery).toStrictEqual(kp);
                expect(kpCount === kp.length && kpCount === 2).toBe(true);

                const slProps = {
                    region: 'SL',
                    unitType: 'House',
                    minRental: undefined,
                    maxRental: undefined,
                    search: undefined,
                    userId,
                    ...(await generalUnit.range(
                        {
                            region: 'SL',
                            unitType: 'House',
                        },
                        postgreSQL.instance.pool
                    )),
                } as const;
                const slQueriedWithoutRentalQuery = await generalUnit.general(
                    {
                        ...slProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                const slCount = await generalUnit.count(
                    slProps,
                    postgreSQL.instance.pool
                );
                expect(slQueriedWithoutRentalQuery).toStrictEqual(sl);
                expect(slCount === sl.length && slCount === 2).toBe(true);
            });
            it('should return units that matches the search query', async () => {
                const rowsProps = {
                    region: 'SL',
                    unitType: 'House',
                    minRental: undefined,
                    maxRental: undefined,
                    search: 'sutera pines condo',
                    userId,
                    ...(await generalUnit.range(
                        {
                            region: 'SL',
                            unitType: 'House',
                        },
                        postgreSQL.instance.pool
                    )),
                } as const;
                const rowsOneCount = await generalUnit.count(
                    rowsProps,
                    postgreSQL.instance.pool
                );
                const rowsOne = await generalUnit.general(
                    {
                        ...rowsProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                expect(rowsOne).toStrictEqual(searchOne);
                expect(
                    rowsOneCount === searchOne.length && rowsOneCount === 2
                ).toBe(true);

                const rowsTwoProps = {
                    region: 'BTHO',
                    unitType: 'House',
                    minRental: undefined,
                    maxRental: undefined,
                    search: 'mrt feeder bus',
                    userId,
                    ...(await generalUnit.range(
                        {
                            region: 'BTHO',
                            unitType: 'House',
                        },
                        postgreSQL.instance.pool
                    )),
                } as const;
                const rowsTwoCount = await generalUnit.count(
                    rowsTwoProps,
                    postgreSQL.instance.pool
                );
                const rowsTwo = await generalUnit.general(
                    {
                        ...rowsTwoProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                expect(rowsTwo).toStrictEqual(searchTwo);
                expect(
                    rowsTwoCount === searchTwo.length && rowsTwoCount === 1
                ).toBe(true);

                const rowsThreeProps = {
                    region: 'KP',
                    unitType: 'House',
                    minRental: undefined,
                    maxRental: undefined,
                    search: 'PARKING BAY',
                    userId,
                    ...(await generalUnit.range(
                        {
                            region: 'KP',
                            unitType: 'House',
                        },
                        postgreSQL.instance.pool
                    )),
                } as const;
                const rowsThree = await generalUnit.general(
                    {
                        ...rowsThreeProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                const rowsThreeCount = await generalUnit.count(
                    rowsThreeProps,
                    postgreSQL.instance.pool
                );
                expect(rowsThree).toStrictEqual(searchThree);
                expect(
                    rowsThreeCount === searchThree.length &&
                        rowsThreeCount === 2
                ).toBe(true);
            });
            it('should return units that matches the bed rooms query', async () => {
                const rowsProps = {
                    region: 'SL',
                    unitType: 'House',
                    minRental: undefined,
                    maxRental: undefined,
                    search: undefined,
                    ...(await generalUnit.range(
                        {
                            region: 'KP',
                            unitType: 'House',
                        },
                        postgreSQL.instance.pool
                    )),
                    bedRooms: [2, 3],
                    userId,
                };
                const rows = await generalUnit.general(
                    {
                        ...rowsProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                const rowsCount = await generalUnit.count(
                    rowsProps,
                    postgreSQL.instance.pool
                );
                expect(rows.length).toBe(1);
                expect(rows).toStrictEqual(bedRooms);
                expect(rowsCount === bedRooms.length && rowsCount === 1).toBe(
                    true
                );
            });
            it('should return units that matches the bath rooms query', async () => {
                const rowsProps = {
                    region: 'KP',
                    unitType: 'House',
                    minRental: undefined,
                    maxRental: undefined,
                    search: undefined,
                    ...(await generalUnit.range(
                        {
                            region: 'KP',
                            unitType: 'House',
                        },
                        postgreSQL.instance.pool
                    )),
                    bathRooms: [5, 6],
                    userId,
                } as const;
                const rows = await generalUnit.general(
                    {
                        ...rowsProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                const rowsCount = await generalUnit.count(
                    rowsProps,
                    postgreSQL.instance.pool
                );
                expect(rows).toStrictEqual(bathRooms);
                expect(rowsCount === bathRooms.length && rowsCount === 1).toBe(
                    true
                );
            });
            it('should return units that matches the bath and bed rooms query', async () => {
                const rowsProps = {
                    region: 'KP',
                    unitType: 'House',
                    minRental: undefined,
                    maxRental: undefined,
                    search: undefined,
                    bathRooms: [2, 5],
                    bedRooms: [3],
                    userId,
                } as const;
                const rows = await generalUnit.general(
                    {
                        ...rowsProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                const rowsCount = await generalUnit.count(
                    rowsProps,
                    postgreSQL.instance.pool
                );
                expect(rows).toStrictEqual(bathAndBedRooms);
                expect(
                    rowsCount === bathAndBedRooms.length && rowsCount === 2
                ).toBe(true);
            });
            it('should return units that matches the rental query', async () => {
                const rowsProps = {
                    region: 'KP',
                    unitType: 'House',
                    minRental: 900,
                    maxRental: 1000,
                    search: undefined,
                    userId,
                    ...(await generalUnit.range(
                        {
                            region: 'KP',
                            unitType: 'House',
                        },
                        postgreSQL.instance.pool
                    )),
                } as const;
                const rows = await generalUnit.general(
                    {
                        ...rowsProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                const rowsCount = await generalUnit.count(
                    rowsProps,
                    postgreSQL.instance.pool
                );
                expect(rows).toStrictEqual(rental);
                expect(rowsCount === rental.length && rowsCount === 1).toBe(
                    true
                );
            });
            it('should return 1 unit that matches the unit type query', async () => {
                const rowsProps = {
                    region: 'BTHO',
                    unitType: 'Condominium',
                    minRental: undefined,
                    maxRental: undefined,
                    search: undefined,
                    userId,
                    maxItemsPerPage,
                    currentPage: 1,
                    ...(await generalUnit.range(
                        {
                            region: 'KP',
                            unitType: 'House',
                        },
                        postgreSQL.instance.pool
                    )),
                } as const;
                const rows = await generalUnit.general(
                    {
                        ...rowsProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                const rowsCount = await generalUnit.count(
                    rowsProps,
                    postgreSQL.instance.pool
                );
                expect(rows).toStrictEqual(unitType);
                expect(rowsCount === unitType.length && rowsCount === 1).toBe(
                    true
                );
            });
            it('should return the updated detailed information of a unit that match the unitId', async () => {
                const timeCreated = new Date();
                const unit = 7;
                const dummyUser = 'dummyUser';

                expect(
                    await utariUser.insert(
                        {
                            id: userId,
                            timeCreated,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    id: userId,
                    type: 'existed',
                });

                expect(
                    await utariUser.insert(
                        {
                            id: dummyUser,
                            timeCreated,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    id: dummyUser,
                    type: 'created',
                });

                expect(
                    await unitBookmarked.insert(
                        {
                            unit,
                            user: userId,
                            timeCreated,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    unit,
                    user: userId,
                });

                expect(
                    await unitRating.insert(
                        {
                            unit,
                            user: userId,
                            timeCreated,
                            rating: 4,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    unit,
                    user: userId,
                });

                expect(
                    await unitRating.insert(
                        {
                            unit,
                            user: userId,
                            timeCreated,
                            rating: 3,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    unit,
                    user: userId,
                });

                expect(
                    await unitBookmarked.insert(
                        {
                            unit,
                            user: dummyUser,
                            timeCreated,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    unit,
                    user: dummyUser,
                });

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
                            search: undefined as Search,
                            bedRooms: [3],
                            bathRooms: [2],
                        } as Parameters<typeof bookmarkUnitQuery.download>[0],
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
            it('should return bookmarked unit that match the bookmarked Id', async () => {
                const user = '41bd91ae-a2bf-4715-9496-2a37e8b9bcce';
                const timeCreatedOne = new Date();
                expect(
                    await utariUser.insert(
                        {
                            id: user,
                            timeCreated: timeCreatedOne,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    id: user,
                    type: 'created',
                });

                expect(
                    await unitRating.insert(
                        {
                            unit: 7,
                            user,
                            timeCreated: timeCreatedOne,
                            rating: 5,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    unit: 7,
                    user,
                });

                expect(
                    await unitBookmarked.insert(
                        {
                            unit: 7,
                            user,
                            timeCreated: timeCreatedOne,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    unit: 7,
                    user,
                });

                const timeCreatedTwo = new Date();
                expect(
                    await unitBookmarked.insert(
                        {
                            unit: 6,
                            user,
                            timeCreated: timeCreatedTwo,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    unit: 6,
                    user,
                });

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
                            search: undefined as Search,
                            bedRooms: [3],
                            bathRooms: [2],
                            maxItemsPerPage: 15,
                            currentPage: 1,
                        } as Parameters<typeof bookmarkUnitQuery.select>[0],
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual(bookmarkedUnit);

                expect(
                    await bookmarkUnitQuery.count(
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
                ).toBe(bookmarkedUnit.length);

                expect(
                    await bookmarkUnitQuery.download(
                        {
                            userId: user,
                            regions: ['SL', 'BTHO'],
                            unitTypes: ['Condominium', 'House'],
                            minRental: undefined,
                            maxRental: undefined,
                            search: undefined as Search,
                            bedRooms: [3],
                            bathRooms: [2],
                        } as Parameters<typeof bookmarkUnitQuery.download>[0],
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
    });

export default testUnitQuery;
