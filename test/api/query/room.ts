import schema from '../../script/schema';
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
            await postgreSQL.instance.exec((await schema).drop);
            await postgreSQL.instance.exec((await schema).create);
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
                const bthoQueried = await generalRoom.general(
                    {
                        region: 'BTHO',
                        roomType: 'Room',
                        minRental: undefined,
                        maxRental: undefined,
                        search: undefined,
                        userId,
                        maxItemsPerPage,
                        currentPage: 1,
                        capacities: await generalRoom.range(
                            {
                                region: 'BTHO',
                                roomType: 'Room',
                            },
                            postgreSQL.instance.pool
                        ),
                    },
                    postgreSQL.instance.pool
                );
                expect(bthoQueried.length).toBe(5);
                expect(bthoQueried).toStrictEqual(btho);

                const kpQueried = await generalRoom.general(
                    {
                        region: 'KP',
                        roomType: 'Room',
                        minRental: undefined,
                        maxRental: undefined,
                        search: undefined,
                        userId,
                        maxItemsPerPage,
                        currentPage: 1,
                        capacities: await generalRoom.range(
                            {
                                region: 'KP',
                                roomType: 'Room',
                            },
                            postgreSQL.instance.pool
                        ),
                    },
                    postgreSQL.instance.pool
                );
                expect(kpQueried.length).toBe(6);
                expect(kpQueried).toStrictEqual(kp);

                const slQueried = await generalRoom.general(
                    {
                        region: 'SL',
                        roomType: 'Room',
                        minRental: undefined,
                        maxRental: undefined,
                        search: undefined,
                        userId,
                        maxItemsPerPage,
                        currentPage: 1,
                        capacities: await generalRoom.range(
                            {
                                region: 'SL',
                                roomType: 'Room',
                            },
                            postgreSQL.instance.pool
                        ),
                    },
                    postgreSQL.instance.pool
                );
                expect(slQueried.length).toBe(8);
                expect(slQueried).toStrictEqual(sl);
            });
            it('should return rooms that matches the search query', async () => {
                const rowsOne = await generalRoom.general(
                    {
                        region: 'SL',
                        roomType: 'Room',
                        minRental: undefined,
                        maxRental: undefined,
                        search: 'Cypress',
                        userId,
                        maxItemsPerPage,
                        currentPage: 1,
                        capacities: await generalRoom.range(
                            {
                                region: 'SL',
                                roomType: 'Room',
                            },
                            postgreSQL.instance.pool
                        ),
                    },
                    postgreSQL.instance.pool
                );
                expect(rowsOne.length).toBe(5);
                expect(rowsOne).toStrictEqual(searchOne);

                const rowsTwo = await generalRoom.general(
                    {
                        region: 'BTHO',
                        roomType: 'Room',
                        minRental: undefined,
                        maxRental: undefined,
                        search: 'Utilities',
                        userId,
                        maxItemsPerPage,
                        currentPage: 1,
                        capacities: await generalRoom.range(
                            {
                                region: 'BTHO',
                                roomType: 'Room',
                            },
                            postgreSQL.instance.pool
                        ),
                    },
                    postgreSQL.instance.pool
                );
                expect(rowsTwo.length).toBe(3);
                expect(rowsTwo).toStrictEqual(searchTwo);

                const rowsThree = await generalRoom.general(
                    {
                        region: 'SL',
                        roomType: 'Room',
                        minRental: 500,
                        maxRental: 100000,
                        search: 'bed',
                        userId,
                        maxItemsPerPage,
                        currentPage: 1,
                        capacities: await generalRoom.range(
                            {
                                region: 'SL',
                                roomType: 'Room',
                            },
                            postgreSQL.instance.pool
                        ),
                    },
                    postgreSQL.instance.pool
                );
                expect(rowsThree.length).toBe(2);
                expect(rowsThree).toStrictEqual(searchThree);
            });
            it('should return rooms that matches the capacities query', async () => {
                const rows = await generalRoom.general(
                    {
                        region: 'SL',
                        roomType: 'Room',
                        minRental: undefined,
                        maxRental: undefined,
                        search: undefined,
                        capacities: [2, 3],
                        userId,
                        maxItemsPerPage,
                        currentPage: 1,
                    },
                    postgreSQL.instance.pool
                );
                expect(rows.length).toBe(3);
                expect(rows).toStrictEqual(capacities);
            });
            it('should return rooms that matches the rental query', async () => {
                const rowsWithRentalQuery = await generalRoom.general(
                    {
                        region: 'KP',
                        roomType: 'Room',
                        minRental: 500,
                        maxRental: 100000,
                        search: undefined,
                        userId,
                        maxItemsPerPage,
                        currentPage: 1,
                        capacities: await generalRoom.range(
                            {
                                region: 'KP',
                                roomType: 'Room',
                            },
                            postgreSQL.instance.pool
                        ),
                    },
                    postgreSQL.instance.pool
                );
                expect(rowsWithRentalQuery.length).toBe(5);
                expect(rowsWithRentalQuery).toStrictEqual(rental);
            });
            it('should return 1 room that matches the room type query', async () => {
                const rows = await generalRoom.general(
                    {
                        region: 'BTHO',
                        roomType: 'Roommate',
                        minRental: undefined,
                        maxRental: undefined,
                        search: undefined,
                        userId,
                        maxItemsPerPage,
                        currentPage: 1,
                        capacities: await generalRoom.range(
                            {
                                region: 'BTHO',
                                roomType: 'Roommate',
                            },
                            postgreSQL.instance.pool
                        ),
                    },
                    postgreSQL.instance.pool
                );
                expect(rows.length).toBe(1);
                expect(rows).toStrictEqual(roomType);
            });
            it('should return the updated detailed information of a room that match the roomId', async () => {
                const timeCreated = new Date();
                const dummyUser = 'dummyUser';
                const room = 20;
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
                await roomBookmarked.insert(
                    {
                        room,
                        user: userId,
                        timeCreated,
                    },
                    postgreSQL.instance.pool
                );
                await roomRating.insert(
                    {
                        room,
                        user: userId,
                        timeCreated,
                        rating: 1,
                    },
                    postgreSQL.instance.pool
                );
                await roomRating.insert(
                    {
                        room,
                        user: userId,
                        timeCreated,
                        rating: 5,
                    },
                    postgreSQL.instance.pool
                );
                await roomBookmarked.insert(
                    {
                        room,
                        user: dummyUser,
                        timeCreated,
                    },
                    postgreSQL.instance.pool
                );
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
                await utariUser.insert(
                    {
                        id: user,
                        timeCreated: timeCreatedOne,
                    },
                    postgreSQL.instance.pool
                );
                await roomRating.insert(
                    {
                        room: 20,
                        user,
                        timeCreated: timeCreatedOne,
                        rating: 1,
                    },
                    postgreSQL.instance.pool
                );
                await roomBookmarked.insert(
                    {
                        room: 20,
                        user,
                        timeCreated: timeCreatedOne,
                    },
                    postgreSQL.instance.pool
                );
                const timeCreatedTwo = new Date();
                await roomBookmarked.insert(
                    {
                        room: 19,
                        user,
                        timeCreated: timeCreatedTwo,
                    },
                    postgreSQL.instance.pool
                );
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
