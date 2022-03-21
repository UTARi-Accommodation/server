import schema from '../../script/schema';
import postgreSQL from '../../../src/database/postgres';
import insertToDatabase from '../../../src/api/populate';
import { room, mutated } from '../../dummy/api/mutation/room.json';
import { generalRoom } from '../../../src/api/query/room';
import { Accommodations } from 'utari-common';
import utariUser from '../../../src/database/table/utariUser';
import visitor from '../../../src/database/table/visitor';
import roomVisit from '../../../src/database/table/roomVisit';
import roomRating from '../../../src/database/table/roomRating';
import roomBookmarked from '../../../src/database/table/roomBookmarked';

const testRoomMutation = () =>
    describe('Room', () => {
        const userOne = '41bd91ae-a2bf-4715-9496-2a37e8b9bcce';
        const userTwo = '31bd91ae-a2bf-4715-9496-2a37e8b9bcce';
        const timeCreated = new Date();
        beforeAll(async () => {
            await postgreSQL.instance.exec((await schema).drop);
            await postgreSQL.instance.exec((await schema).create);
            await insertToDatabase(room as Accommodations, 'KP');
            await utariUser.insert(
                { id: userOne, timeCreated },
                postgreSQL.instance.pool
            );
            await utariUser.insert(
                { id: userTwo, timeCreated },
                postgreSQL.instance.pool
            );
        });
        describe('Mutation', () => {
            const roomOne = 1;
            const roomTwo = 2;
            describe('room visit count', () => {
                it('should update room visit count', async () => {
                    const visitorOne = '41bd91ae-a2bf-4715-9496-2a37e8b9bcce';
                    const visitorTwo = '31bd91ae-a2bf-4715-9496-2a37e8b9bcce';
                    const timeCreated = new Date();
                    await visitor.insert(
                        { id: visitorOne, timeCreated },
                        postgreSQL.instance.pool
                    );
                    await visitor.insert(
                        { id: visitorTwo, timeCreated },
                        postgreSQL.instance.pool
                    );
                    // insert new visit for roomOne from userOne
                    expect(
                        await roomVisit.insert(
                            {
                                room: roomOne,
                                visitor: visitorOne,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        id: 1,
                        room: roomOne,
                        visitor: visitorOne,
                    });
                    // insert another visit for roomOne from userOne
                    expect(
                        await roomVisit.insert(
                            {
                                room: roomOne,
                                visitor: visitorOne,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        id: 2,
                        room: roomOne,
                        visitor: visitorOne,
                    });
                    // insert new visit for roomTwo from userOne
                    expect(
                        await roomVisit.insert(
                            {
                                room: roomTwo,
                                visitor: visitorOne,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        id: 3,
                        room: roomTwo,
                        visitor: visitorOne,
                    });
                    // insert new visit for roomOne from userTwo
                    expect(
                        await roomVisit.insert(
                            {
                                room: roomOne,
                                visitor: visitorTwo,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        id: 4,
                        room: roomOne,
                        visitor: visitorTwo,
                    });
                });
            });
            describe('room rating', () => {
                it('should update room rating', async () => {
                    // insert new rating for roomOne from userOne
                    expect(
                        await roomRating.insert(
                            {
                                room: roomOne,
                                user: userOne,
                                rating: 1,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        room: roomOne,
                        user: userOne,
                    });
                    // insert another rating for roomOne from userOne
                    expect(
                        await roomRating.insert(
                            {
                                room: roomOne,
                                user: userOne,
                                rating: 4,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        room: roomOne,
                        user: userOne,
                    });
                    // insert new rating for roomTwo from userOne
                    expect(
                        await roomRating.insert(
                            {
                                room: roomTwo,
                                user: userOne,
                                rating: 5,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        room: roomTwo,
                        user: userOne,
                    });
                    // insert new visit for roomOne from userTwo
                    expect(
                        await roomRating.insert(
                            {
                                room: roomOne,
                                user: userTwo,
                                timeCreated,
                                rating: 3,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        room: roomOne,
                        user: userTwo,
                    });
                });
            });
            describe('query room', () => {
                it('should query rooms with newly added rating and view count', async () => {
                    const userId = '66067e71-8fc3-4353-899d-8906df0c6a74';
                    await utariUser.insert(
                        { id: userId, timeCreated: new Date() },
                        postgreSQL.instance.pool
                    );
                    const rows = await generalRoom.selectWithoutCapacities(
                        {
                            region: 'KP',
                            roomType: 'Roommate',
                            search: undefined,
                            minRental: undefined,
                            maxRental: undefined,
                            userId,
                        },
                        postgreSQL.instance.pool
                    );
                    expect(rows.length).toBe(3);
                    expect(rows).toStrictEqual(mutated);
                });
            });
            describe('room bookmark', () => {
                it('should create, delete and create room bookmarked', async () => {
                    // create new bookmark for roomOne from userOne
                    expect(
                        await roomBookmarked.insert(
                            {
                                room: roomOne,
                                user: userOne,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        user: userOne,
                        room: roomOne,
                    });
                    // delete bookmarked room from userOne
                    expect(
                        await roomBookmarked.delete(
                            {
                                room: roomOne,
                                user: userOne,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        user: userOne,
                        room: roomOne,
                    });
                    // create new bookmark again for roomOne from userOne
                    expect(
                        await roomBookmarked.insert(
                            {
                                room: roomOne,
                                user: userOne,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        user: userOne,
                        room: roomOne,
                    });
                });
            });
        });
    });

export default testRoomMutation;
