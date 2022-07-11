import reset from '../../script/reset';
import postgreSQL from '../../../src/database/postgres';
import upsertToDatabase from '../../../src/api/populate';
import {
    rooms,
    btho,
    sl,
    kp,
    searchOne,
    searchTwo,
    searchThree,
    rental,
    capacities,
    roomType,
    detailedRoom,
    bookmarkedRoom,
    downloadBookmarkedOne,
    downloadBookmarkedTwo,
} from '../../dummy/api/query/room.json';
import {
    generalRoom,
    bookmarkedRoom as bookmarkRoomQuery,
    detailedRoom as detailRoomQuery,
} from '../../../src/api/query/room';
import { Accommodations, maxItemsPerPage } from 'utari-common';
import utariUser from '../../../src/database/table/utariUser';
import roomRating from '../../../src/database/table/roomRating';
import roomBookmarked from '../../../src/database/table/roomBookmarked';

const testRoomQuery = () =>
    describe('Query Room', () => {
        const userId = '66067e71-8fc3-4353-899d-8906df0c6a74';
        beforeAll(async () => {
            const { db } = await reset;
            await db(postgreSQL.instance.exec);
            await upsertToDatabase(rooms as Accommodations, 'BTHO');
            // set region to KP
            await postgreSQL.instance.exec(
                `UPDATE accommodation SET region='KP' WHERE id=26387 OR id=26375 OR id=30000`
            );

            //set region to SL
            await postgreSQL.instance.exec(
                `UPDATE accommodation SET region='SL' WHERE id=27082 OR id=27078 OR id=27065 OR id=27064 OR id=26354`
            );

            //add new user
            await utariUser.insert(
                { id: userId, timeCreated: new Date() },
                postgreSQL.instance.pool
            );
        });
        describe('Query', () => {
            it('should return rooms that matches the general query', async () => {
                const bthoProps = {
                    region: 'BTHO',
                    roomType: 'Room',
                    minRental: undefined,
                    maxRental: undefined,
                    search: undefined,
                    userId,
                    capacities: await generalRoom.range(
                        {
                            region: 'BTHO',
                            roomType: 'Room',
                        },
                        postgreSQL.instance.pool
                    ),
                } as const;
                const bthoQueried = await generalRoom.general(
                    {
                        ...bthoProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                const bthoCount = await generalRoom.count(
                    bthoProps,
                    postgreSQL.instance.pool
                );
                expect(bthoQueried).toStrictEqual(btho);
                expect(bthoCount === btho.length && bthoCount === 5).toBe(true);

                const kamparProps = {
                    region: 'KP',
                    roomType: 'Room',
                    minRental: undefined,
                    maxRental: undefined,
                    search: undefined,
                    userId,
                    capacities: await generalRoom.range(
                        {
                            region: 'KP',
                            roomType: 'Room',
                        },
                        postgreSQL.instance.pool
                    ),
                } as const;
                const kpQueried = await generalRoom.general(
                    {
                        ...kamparProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                const kpCount = await generalRoom.count(
                    kamparProps,
                    postgreSQL.instance.pool
                );
                expect(kpQueried).toStrictEqual(kp);
                expect(kpCount === kp.length && kpCount === 6).toBe(true);

                const slProps = {
                    region: 'SL',
                    roomType: 'Room',
                    minRental: undefined,
                    maxRental: undefined,
                    search: undefined,
                    userId,
                    capacities: await generalRoom.range(
                        {
                            region: 'SL',
                            roomType: 'Room',
                        },
                        postgreSQL.instance.pool
                    ),
                } as const;
                const slQueried = await generalRoom.general(
                    {
                        ...slProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                const slCount = await generalRoom.count(
                    slProps,
                    postgreSQL.instance.pool
                );
                expect(slQueried).toStrictEqual(sl);
                expect(slCount === sl.length && slCount === 8).toBe(true);
            });
            it('should return rooms that matches the search query', async () => {
                const rowsOneProps = {
                    region: 'SL',
                    roomType: 'Room',
                    minRental: undefined,
                    maxRental: undefined,
                    search: 'Cypress',
                    userId,
                    capacities: await generalRoom.range(
                        {
                            region: 'SL',
                            roomType: 'Room',
                        },
                        postgreSQL.instance.pool
                    ),
                } as const;
                const rowsOne = await generalRoom.general(
                    {
                        ...rowsOneProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                const rowsOneCount = await generalRoom.count(
                    rowsOneProps,
                    postgreSQL.instance.pool
                );
                expect(rowsOne).toStrictEqual(searchOne);
                expect(
                    rowsOneCount === searchOne.length && rowsOneCount === 5
                ).toBe(true);

                const rowsTwoProps = {
                    region: 'BTHO',
                    roomType: 'Room',
                    minRental: undefined,
                    maxRental: undefined,
                    search: 'Utilities',
                    userId,
                    capacities: await generalRoom.range(
                        {
                            region: 'BTHO',
                            roomType: 'Room',
                        },
                        postgreSQL.instance.pool
                    ),
                } as const;
                const rowsTwoCount = await generalRoom.count(
                    rowsTwoProps,
                    postgreSQL.instance.pool
                );
                const rowsTwo = await generalRoom.general(
                    {
                        ...rowsTwoProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                expect(rowsTwo).toStrictEqual(searchTwo);
                expect(
                    rowsTwoCount === searchTwo.length && rowsTwoCount === 3
                ).toBe(true);

                const rowsThreeProps = {
                    region: 'SL',
                    roomType: 'Room',
                    minRental: 500,
                    maxRental: 100000,
                    search: 'bed',
                    userId,
                    capacities: await generalRoom.range(
                        {
                            region: 'SL',
                            roomType: 'Room',
                        },
                        postgreSQL.instance.pool
                    ),
                } as const;
                const rowsThreeCount = await generalRoom.count(
                    rowsThreeProps,
                    postgreSQL.instance.pool
                );
                const rowsThree = await generalRoom.general(
                    {
                        ...rowsThreeProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                expect(rowsThree).toStrictEqual(searchThree);
                expect(
                    rowsThreeCount === searchThree.length &&
                        rowsThreeCount === 2
                ).toBe(true);
            });
            it('should return rooms that matches the capacities query', async () => {
                const rowsProps = {
                    region: 'SL',
                    roomType: 'Room',
                    minRental: undefined,
                    maxRental: undefined,
                    search: undefined,
                    capacities: [2, 3],
                    userId,
                } as const;
                const rowsCount = await generalRoom.count(
                    rowsProps,
                    postgreSQL.instance.pool
                );
                const rows = await generalRoom.general(
                    {
                        ...rowsProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                expect(rows).toStrictEqual(capacities);
                expect(rowsCount === capacities.length && rowsCount === 3).toBe(
                    true
                );
            });
            it('should return rooms that matches the rental query', async () => {
                const rowsProps = {
                    region: 'KP',
                    roomType: 'Room',
                    minRental: 500,
                    maxRental: 100000,
                    search: undefined,
                    userId,
                    capacities: await generalRoom.range(
                        {
                            region: 'KP',
                            roomType: 'Room',
                        },
                        postgreSQL.instance.pool
                    ),
                } as const;
                const rowsCount = await generalRoom.count(
                    rowsProps,
                    postgreSQL.instance.pool
                );
                const rowsWithRentalQuery = await generalRoom.general(
                    {
                        ...rowsProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                expect(rowsWithRentalQuery).toStrictEqual(rental);
                expect(rowsCount === rental.length && rowsCount === 5).toBe(
                    true
                );
            });
            it('should return 1 room that matches the room type query', async () => {
                const rowsProps = {
                    region: 'BTHO',
                    roomType: 'Roommate',
                    minRental: undefined,
                    maxRental: undefined,
                    search: undefined,
                    userId,
                    capacities: await generalRoom.range(
                        {
                            region: 'BTHO',
                            roomType: 'Roommate',
                        },
                        postgreSQL.instance.pool
                    ),
                } as const;
                const rowsCount = await generalRoom.count(
                    rowsProps,
                    postgreSQL.instance.pool
                );
                const rows = await generalRoom.general(
                    {
                        ...rowsProps,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                expect(rows).toStrictEqual(roomType);
                expect(rowsCount === roomType.length && rowsCount === 1).toBe(
                    true
                );
            });
            it('should return the updated detailed information of a room that match the roomId', async () => {
                const timeCreated = new Date();
                const dummyUser = 'dummyUser';
                const room = 20;

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
                    await roomBookmarked.insert(
                        {
                            room,
                            user: userId,
                            timeCreated,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    room,
                    user: userId,
                });

                expect(
                    await roomRating.insert(
                        {
                            room,
                            user: userId,
                            timeCreated,
                            rating: 1,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    user: userId,
                    room,
                });

                expect(
                    await roomRating.insert(
                        {
                            room,
                            user: userId,
                            timeCreated,
                            rating: 5,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    user: userId,
                    room,
                });

                expect(
                    await roomBookmarked.insert(
                        {
                            room,
                            user: dummyUser,
                            timeCreated,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    room,
                    user: dummyUser,
                });

                // user did bookmarked this room
                expect(
                    await detailRoomQuery.selectWithUser(
                        {
                            id: room,
                            userId,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    ...detailedRoom,
                    bookmarked: true,
                    rating: 5,
                });

                expect(
                    await detailRoomQuery.selectWithUser(
                        {
                            id: room,
                            userId: dummyUser,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    ...detailedRoom,
                    bookmarked: true,
                    rating: undefined,
                });

                // fake user Id to simulate fake user that did not bookmark this room
                expect(
                    await detailRoomQuery.selectWithUser(
                        {
                            id: 20,
                            userId: '123',
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    ...detailedRoom,
                    rating: undefined,
                });

                // user not logged in
                expect(
                    await detailRoomQuery.select(
                        {
                            id: 20,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    ...detailedRoom,
                    rating: undefined,
                });

                expect(
                    await bookmarkRoomQuery.download(
                        {
                            userId,
                            minRental: undefined,
                            maxRental: undefined,
                            search: undefined,
                            capacities: [3],
                            roomTypes: ['Room', 'Roommate'],
                            regions: ['SL', 'BTHO'],
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual(
                    downloadBookmarkedTwo.map((room: any) => ({
                        ...room,
                        timeCreated,
                    }))
                );
            });
            it('should return the distinct range of capacities', async () => {
                expect(
                    await generalRoom.range(
                        { roomType: 'Room', region: 'SL' },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual([1, 2, 3, 4]);

                expect(
                    await generalRoom.range(
                        { roomType: 'Room', region: 'KP' },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual([1, 2]);

                expect(
                    await generalRoom.range(
                        { roomType: 'Room', region: 'BTHO' },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual([1]);
            });
            it('should return rental frequencies', async () => {
                expect(
                    await generalRoom.rentalFrequency(
                        {
                            roomType: 'Room',
                            region: 'SL',
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual([
                    [350, 3],
                    [400, 2],
                    [450, 1],
                    [550, 1],
                    [1000, 1],
                ]);

                expect(
                    await generalRoom.rentalFrequency(
                        {
                            roomType: 'Room',
                            region: 'KP',
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual([
                    [300, 1],
                    [500, 2],
                    [550, 2],
                    [600, 1],
                ]);

                expect(
                    await generalRoom.rentalFrequency(
                        {
                            roomType: 'Room',
                            region: 'BTHO',
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual([
                    [380, 1],
                    [400, 1],
                    [475, 1],
                    [500, 2],
                ]);
            });
            it('should return bookmarked room that match the bookmarked Id', async () => {
                const user = '41bd91ae-a2bf-4715-9496-2a37e8b9bcce';
                const timeCreatedOne = new Date();
                const room = 20;

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
                    await roomRating.insert(
                        {
                            room,
                            user,
                            timeCreated: timeCreatedOne,
                            rating: 1,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    user,
                    room,
                });

                expect(
                    await roomBookmarked.insert(
                        {
                            room,
                            user,
                            timeCreated: timeCreatedOne,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    user,
                    room,
                });

                const timeCreatedTwo = new Date();
                expect(
                    await roomBookmarked.insert(
                        {
                            room: 19,
                            user,
                            timeCreated: timeCreatedTwo,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual({
                    user,
                    room: 19,
                });

                expect(
                    await bookmarkRoomQuery.selectRentalFrequency(
                        {
                            userId: user,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual([[350, 2]]);

                expect(
                    await bookmarkRoomQuery.selectCapacitiesRange(
                        {
                            userId: user,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual([3]);

                expect(
                    await bookmarkRoomQuery.select(
                        {
                            userId: user,
                            minRental: undefined,
                            maxRental: undefined,
                            search: undefined,
                            capacities: [3],
                            roomTypes: ['Room', 'Roommate'],
                            regions: ['SL', 'BTHO'],
                            maxItemsPerPage: 15,
                            currentPage: 1,
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual(bookmarkedRoom);

                expect(
                    await bookmarkRoomQuery.count(
                        {
                            userId: user,
                            minRental: undefined,
                            maxRental: undefined,
                            search: undefined,
                            capacities: [3],
                            roomTypes: ['Room', 'Roommate'],
                            regions: ['SL', 'BTHO'],
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual(bookmarkedRoom.length);

                expect(
                    await bookmarkRoomQuery.download(
                        {
                            userId: user,
                            minRental: undefined,
                            maxRental: undefined,
                            search: undefined,
                            capacities: [3],
                            roomTypes: ['Room', 'Roommate'],
                            regions: ['SL', 'BTHO'],
                        },
                        postgreSQL.instance.pool
                    )
                ).toStrictEqual(
                    downloadBookmarkedOne.map((room: any) => ({
                        ...room,
                        rating: room.rating,
                        timeCreated:
                            room.id === 20 ? timeCreatedOne : timeCreatedTwo,
                    }))
                );
            });
        });
    });

export default testRoomQuery;
