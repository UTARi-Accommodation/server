import schema from '../../script/schema';
import postgreSQL from '../../../src/database/postgres';
import insertToDatabase from '../../../src/api/populate';
import { unit, mutated } from '../../dummy/api/mutation/unit.json';
import { generalUnit } from '../../../src/api/query/unit';
import utariUser from '../../../src/database/table/utariUser';
import visitor from '../../../src/database/table/visitor';
import unitVisit from '../../../src/database/table/unitVisit';
import unitRating from '../../../src/database/table/unitRating';
import unitBookmarked from '../../../src/database/table/unitBookmarked';
import { maxItemsPerPage } from 'utari-common';

const testUnitMutation = () =>
    describe('Mutate Unit', () => {
        const userOne = '41bd91ae-a2bf-4715-9496-2a37e8b9bcce';
        const userTwo = '31bd91ae-a2bf-4715-9496-2a37e8b9bcce';
        const timeCreated = new Date();
        beforeAll(async () => {
            await postgreSQL.instance.exec((await schema).drop);
            await postgreSQL.instance.exec((await schema).create);
            await insertToDatabase(unit, 'KP');
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
            const unitOne = 1;
            const unitTwo = 2;
            describe('the score and visit count of units', () => {
                it('should be updated after it is visited', async () => {
                    const visitorOne = '41bd91ae-a2bf-4715-9496-2a37e8b9bcce';
                    const visitorTwo = '31bd91ae-a2bf-4715-9496-2a37e8b9bcce';
                    await visitor.insert(
                        { id: visitorOne, timeCreated },
                        postgreSQL.instance.pool
                    );
                    await visitor.insert(
                        { id: visitorTwo, timeCreated },
                        postgreSQL.instance.pool
                    );
                    // insert new visit for unitOne from userOne
                    expect(
                        await unitVisit.insert(
                            {
                                unit: unitOne,
                                visitor: visitorOne,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        id: 1,
                        unit: unitOne,
                        visitor: visitorOne,
                    });
                    // insert another visit for unitOne from userOne
                    expect(
                        await unitVisit.insert(
                            {
                                unit: unitOne,
                                visitor: visitorOne,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        id: 2,
                        unit: unitOne,
                        visitor: visitorOne,
                    });
                    // insert new visit for unitTwo from userOne
                    expect(
                        await unitVisit.insert(
                            {
                                unit: unitTwo,
                                visitor: visitorOne,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        id: 3,
                        unit: unitTwo,
                        visitor: visitorOne,
                    });
                    // insert new visit for unitOne from userTwo
                    expect(
                        await unitVisit.insert(
                            {
                                unit: unitOne,
                                visitor: visitorTwo,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        id: 4,
                        unit: unitOne,
                        visitor: visitorTwo,
                    });
                });
            });
            describe('the score and rating of rooms', () => {
                it('should be updated after user give rating', async () => {
                    // insert new rating for unitOne from userOne
                    expect(
                        await unitRating.insert(
                            {
                                unit: unitOne,
                                user: userOne,
                                rating: 2,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        unit: unitOne,
                        user: userOne,
                    });
                    // insert another rating for unitOne from userOne
                    expect(
                        await unitRating.insert(
                            {
                                unit: unitOne,
                                user: userOne,
                                rating: 4,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        unit: unitOne,
                        user: userOne,
                    });
                    // insert new rating for unitTwo from userOne
                    expect(
                        await unitRating.insert(
                            {
                                unit: unitTwo,
                                user: userOne,
                                rating: 5,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        unit: unitTwo,
                        user: userOne,
                    });
                    // insert new visit for unitOne from userTwo
                    expect(
                        await unitRating.insert(
                            {
                                unit: unitOne,
                                user: userTwo,
                                timeCreated,
                                rating: 3,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        unit: unitOne,
                        user: userTwo,
                    });
                    // delete all rating of unitOne from userOne
                    expect(
                        await unitRating.delete(
                            {
                                unit: unitOne,
                                user: userOne,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual([
                        {
                            unit: unitOne,
                            user: userOne,
                        },
                        {
                            unit: unitOne,
                            user: userOne,
                        },
                    ]);
                });
            });
            describe('querying unit', () => {
                it('should return units with newly updated rating, visit count and score', async () => {
                    const userId = '66067e71-8fc3-4353-899d-8906df0c6a74';
                    await utariUser.insert(
                        { id: userId, timeCreated: new Date() },
                        postgreSQL.instance.pool
                    );
                    const { bathRooms, bedRooms } = await generalUnit.range(
                        {
                            region: 'KP',
                            unitType: 'House',
                        },
                        postgreSQL.instance.pool
                    );
                    const rows = await generalUnit.general(
                        {
                            region: 'KP',
                            unitType: 'House',
                            search: undefined,
                            minRental: undefined,
                            maxRental: undefined,
                            userId,
                            bathRooms,
                            bedRooms,
                            maxItemsPerPage,
                            currentPage: 1,
                        },
                        postgreSQL.instance.pool
                    );
                    expect(rows.length).toBe(2);
                    expect(rows).toStrictEqual(mutated);
                });
            });
            describe('unit bookmark', () => {
                it('should be able to create, delete and create bookmarks for unit again without affecting the scores of bookmarked unit', async () => {
                    // create new bookmark for unitOne from userOne
                    expect(
                        await unitBookmarked.insert(
                            {
                                unit: unitOne,
                                user: userOne,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        user: userOne,
                        unit: unitOne,
                    });
                    // delete bookmarked unit from userOne
                    expect(
                        await unitBookmarked.delete(
                            {
                                unit: unitOne,
                                user: userOne,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        user: userOne,
                        unit: unitOne,
                    });
                    // create new bookmark again for unitOne from userOne
                    expect(
                        await unitBookmarked.insert(
                            {
                                unit: unitOne,
                                user: userOne,
                                timeCreated,
                            },
                            postgreSQL.instance.pool
                        )
                    ).toStrictEqual({
                        user: userOne,
                        unit: unitOne,
                    });
                });
            });
        });
    });

export default testUnitMutation;
