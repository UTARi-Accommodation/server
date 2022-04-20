import {
    AccommodationType,
    maxItemsPerPage,
    parseAsReadonlyIntArray,
    parseAsReadonlyRegionArray,
    parseAsReadonlyRoomTypeArray,
    parseAsReadonlyUnitTypeArray,
    parseAsSearch,
    RoomsQueried,
    UnitsQueried,
} from 'utari-common';
import { bookmarkedRoom } from '../../api/query/room';
import { bookmarkedUnit } from '../../api/query/unit';
import postgreSQL from '../../database/postgres';
import express from 'express';
import {
    parseAsCustomType,
    parseAsNumber,
    parseAsReadonlyObject,
    parseAsString,
} from 'parse-dont-validate';
import getCentralGeocode from '../../api/geocode';
import roomBookmarked from '../../database/table/roomBookmarked';
import unitBookmarked from '../../database/table/unitBookmarked';
import logger from '../../logger';
import { auth } from '../../auth/firebase';

const parseAsBookmarkMutationField = (obj: unknown) =>
    parseAsReadonlyObject(obj, (obj) => ({
        userId: obj.userId,
        id: parseAsNumber(parseFloat(obj.id))
            .inRangeOf(1, Number.MAX_VALUE)
            .orElseGetUndefined(),
        type: parseAsCustomType<AccommodationType>(
            obj.type,
            (type) => type === 'Unit' || type === 'Room'
        ).orElseGetUndefined(),
    })).orElseGetUndefined();

const bookmarkedRouter = (app: express.Application) => ({
    queryUnit: () =>
        app.get('/api/bookmarked-units', async (req, res) => {
            if (req.method !== 'GET') {
                throw new Error('Only accept GET request');
            } else {
                const { query } = req;

                const token = parseAsString(query.token).orElseGetUndefined();

                if (!token) {
                    const result = {
                        message: `token is ${token} and is not a valid token`,
                    };
                    logger.log(result);
                    res.status(400).json(result);
                    return;
                }

                const verifiedId = await auth.verifyIdToken(token);

                const unitQuery = parseAsReadonlyObject(query, (query) => ({
                    userId: verifiedId.uid,
                    unitTypes: parseAsReadonlyUnitTypeArray(query.unitTypes),
                    regions: parseAsReadonlyRegionArray(query.regions),
                    search: parseAsSearch(query.search),
                    minRental: parseAsNumber(parseFloat(query.minRental))
                        .inRangeOf(1, Number.MAX_VALUE)
                        .orElseGetUndefined(),
                    maxRental: parseAsNumber(parseFloat(query.maxRental))
                        .inRangeOf(1, Number.MAX_VALUE)
                        .orElseGetUndefined(),
                    bedRooms: parseAsReadonlyIntArray(query.bedRooms),
                    bathRooms: parseAsReadonlyIntArray(query.bathRooms),
                })).orElseThrowDefault('query');

                const { bedRooms, bathRooms } = await bookmarkedUnit.range(
                    {
                        userId: verifiedId.uid,
                    },
                    postgreSQL.instance.pool
                );

                // if there's no bedRoom, there's no bathRoom as well
                if (!bedRooms.length) {
                    const result = {
                        units: [],
                        numberOfResultsQueried: 0,
                        rentalRangeFrequencies: [],
                        bedRooms,
                        bathRooms,
                        page: 1,
                        totalPage: 0,
                        center: getCentralGeocode([], 'KP'),
                    } as UnitsQueried;
                    logger.log(result);
                    res.status(200).json(result);
                    return;
                }

                const finalizedUnitQuery = {
                    ...unitQuery,
                    bedRooms: !unitQuery.bedRooms.length
                        ? bedRooms
                        : unitQuery.bedRooms,
                    bathRooms: !unitQuery.bathRooms.length
                        ? bathRooms
                        : unitQuery.bathRooms,
                    regions: !unitQuery.regions.length
                        ? (['BTHO', 'KP', 'SL'] as const)
                        : unitQuery.regions,
                    unitTypes: !unitQuery.unitTypes.length
                        ? (['House', 'Condominium'] as const)
                        : unitQuery.unitTypes,
                };

                const { type } = query;

                if (
                    typeof type === 'string' &&
                    type.toLowerCase() === 'download'
                ) {
                    const result = {
                        units: await bookmarkedUnit.download(
                            finalizedUnitQuery,
                            postgreSQL.instance.pool
                        ),
                    };
                    logger.log(result);
                    res.status(200).json(result);
                    return;
                }

                const { page } = query;

                const currentPage = parseAsNumber(
                    parseInt(typeof page === 'string' ? page : '1')
                ).orElseLazyGet(() => 1);

                const units = await bookmarkedUnit.select(
                    {
                        ...finalizedUnitQuery,
                        currentPage,
                        maxItemsPerPage,
                    },
                    postgreSQL.instance.pool
                );

                const numberOfResultsQueried = await bookmarkedUnit.count(
                    finalizedUnitQuery,
                    postgreSQL.instance.pool
                );

                const result = {
                    units,
                    numberOfResultsQueried,
                    rentalRangeFrequencies:
                        await bookmarkedUnit.selectRentalFrequency(
                            {
                                userId: verifiedId.uid,
                            },
                            postgreSQL.instance.pool
                        ),
                    bedRooms,
                    bathRooms,
                    page: currentPage,
                    totalPage: Math.ceil(
                        numberOfResultsQueried / maxItemsPerPage
                    ),
                    center: getCentralGeocode(
                        units.map(({ location: { coordinate } }) => coordinate),
                        'KP'
                    ),
                } as UnitsQueried;
                logger.log(result);
                res.status(200).json(result);
            }
        }),
    queryRoom: () =>
        app.get('/api/bookmarked-rooms', async (req, res) => {
            if (req.method !== 'GET') {
                throw new Error('Only accept GET request');
            } else {
                const { query } = req;

                const token = parseAsString(query.token).orElseGetUndefined();

                if (!token) {
                    const result = {
                        message: `token is ${token} and is not a valid token`,
                    };
                    logger.log(result);
                    res.status(400).json(result);
                    return;
                }

                const verifiedId = await auth.verifyIdToken(token);

                const roomQuery = parseAsReadonlyObject(query, (query) => ({
                    userId: verifiedId.uid,
                    roomTypes: parseAsReadonlyRoomTypeArray(query.roomTypes),
                    regions: parseAsReadonlyRegionArray(query.regions),
                    search: parseAsString(query.search).orElseGetUndefined(),
                    minRental: parseAsNumber(parseFloat(query.minRental))
                        .inRangeOf(1, Number.MAX_VALUE)
                        .orElseGetUndefined(),
                    maxRental: parseAsNumber(parseFloat(query.maxRental))
                        .inRangeOf(1, Number.MAX_VALUE)
                        .orElseGetUndefined(),
                    capacities: parseAsReadonlyIntArray(query.capacities),
                })).orElseThrowDefault('query');

                const capacities = await bookmarkedRoom.selectCapacitiesRange(
                    {
                        userId: verifiedId.uid,
                    },
                    postgreSQL.instance.pool
                );

                if (!capacities.length) {
                    const result = {
                        rooms: [],
                        numberOfResultsQueried: 0,
                        rentalRangeFrequencies: [],
                        capacities,
                        page: 1,
                        totalPage: 0,
                        center: getCentralGeocode([], 'KP'),
                    } as RoomsQueried;
                    logger.log(result);
                    res.status(200).json(result);
                    return;
                }

                const finalizedRoomQuery = {
                    ...roomQuery,
                    capacities: !roomQuery.capacities.length
                        ? capacities
                        : roomQuery.capacities,
                    regions: !roomQuery.regions.length
                        ? (['BTHO', 'KP', 'SL'] as const)
                        : roomQuery.regions,
                    roomTypes: !roomQuery.roomTypes.length
                        ? (['Room', 'Roommate'] as const)
                        : roomQuery.roomTypes,
                };

                const { type } = query;

                if (
                    typeof type === 'string' &&
                    type.toLowerCase() === 'download'
                ) {
                    const result = {
                        rooms: await bookmarkedRoom.download(
                            finalizedRoomQuery,
                            postgreSQL.instance.pool
                        ),
                    };
                    logger.log(result);
                    res.status(200).json(result);
                    return;
                }

                const { page } = query;

                const currentPage = parseAsNumber(
                    parseInt(typeof page === 'string' ? page : '1')
                ).orElseLazyGet(() => 1);

                const rooms = await bookmarkedRoom.select(
                    {
                        ...finalizedRoomQuery,
                        currentPage,
                        maxItemsPerPage,
                    },
                    postgreSQL.instance.pool
                );

                const numberOfResultsQueried = await bookmarkedRoom.count(
                    finalizedRoomQuery,
                    postgreSQL.instance.pool
                );

                const result = {
                    rooms,
                    numberOfResultsQueried,
                    rentalRangeFrequencies:
                        await bookmarkedRoom.selectRentalFrequency(
                            { userId: verifiedId.uid },
                            postgreSQL.instance.pool
                        ),
                    capacities,
                    page: currentPage,
                    totalPage: Math.ceil(
                        numberOfResultsQueried / maxItemsPerPage
                    ),
                    center: getCentralGeocode(
                        rooms.map(({ location: { coordinate } }) => coordinate),
                        'KP'
                    ),
                } as RoomsQueried;
                logger.log(result);
                res.status(200).json(result);
            }
        }),
    add: () =>
        app.post('/api/bookmarked', async (req, res) => {
            if (req.method !== 'POST') {
                throw new Error('Only accept POST request');
            } else {
                const { body } = req;
                const token = parseAsString(body.token).orElseGetUndefined();

                if (!token) {
                    const result = {
                        message: `token is ${token} and is not a valid token`,
                    };
                    logger.log(result);
                    res.status(400).json(result);
                    return;
                }

                const verifiedId = await auth.verifyIdToken(token);

                const post = parseAsBookmarkMutationField({
                    userId: verifiedId.uid,
                    ...body,
                });

                if (!post) {
                    return;
                }
                const { userId, id, type } = post;

                if (!id) {
                    const result = {
                        message: 'id is undefined',
                        bookmarked: false,
                    };
                    logger.log(result);
                    res.status(400).json(result);
                } else {
                    switch (type) {
                        case undefined:
                            {
                                const result = {
                                    message: 'type is undefined',
                                    bookmarked: false,
                                };
                                logger.log(result);
                                res.status(400).json(result);
                            }
                            break;
                        case 'Room': {
                            const bookmarked = await roomBookmarked.insert(
                                {
                                    user: userId,
                                    room: id,
                                    timeCreated: new Date(),
                                },
                                postgreSQL.instance.pool
                            );
                            const result = {
                                bookmarked: Boolean(bookmarked),
                                message: type,
                            };
                            logger.log(result);
                            res.status(200).json(result);
                            break;
                        }
                        case 'Unit': {
                            const bookmarked = await unitBookmarked.insert(
                                {
                                    user: userId,
                                    unit: id,
                                    timeCreated: new Date(),
                                },
                                postgreSQL.instance.pool
                            );
                            const result = {
                                bookmarked: Boolean(bookmarked),
                                message: type,
                            };
                            logger.log(result);
                            res.status(200).json(result);
                            break;
                        }
                    }
                }
            }
        }),
    delete: () =>
        app.delete('/api/bookmarked', async (req, res) => {
            if (req.method !== 'DELETE') {
                throw new Error('Only accept DELETE request');
            } else {
                const { query } = req;
                const token = parseAsString(query.token).orElseGetUndefined();

                if (!token) {
                    const result = {
                        message: `token is ${token} and is not a valid token`,
                    };
                    logger.log(result);
                    res.status(400).json(result);
                    return;
                }

                const verifiedId = await auth.verifyIdToken(token);

                const queryParam = parseAsBookmarkMutationField({
                    ...query,
                    userId: verifiedId.uid,
                });

                if (!queryParam) {
                    return;
                }

                const { userId, id, type } = queryParam;

                if (!id) {
                    const result = {
                        message: 'id is undefined',
                        bookmarked: false,
                    };
                    logger.log(result);
                    res.status(400).json(result);
                } else {
                    switch (type) {
                        case undefined:
                            {
                                const result = {
                                    message: 'type is undefined',
                                    bookmarked: false,
                                };
                                logger.log(result);
                                res.status(400).json(result);
                            }
                            break;
                        case 'Room': {
                            const bookmarked = await roomBookmarked.delete(
                                {
                                    user: userId,
                                    room: id,
                                },
                                postgreSQL.instance.pool
                            );
                            const result = {
                                bookmarked: false,
                                message: type,
                            };
                            logger.log({
                                result,
                                bookmarked,
                            });
                            res.status(200).json(result);
                            break;
                        }
                        case 'Unit': {
                            const bookmarked = await unitBookmarked.delete(
                                {
                                    user: userId,
                                    unit: id,
                                },
                                postgreSQL.instance.pool
                            );
                            const result = {
                                bookmarked: false,
                                message: type,
                            };
                            logger.log({
                                result,
                                bookmarked,
                            });
                            res.status(200).json(result);
                            break;
                        }
                    }
                }
            }
        }),
});

export default bookmarkedRouter;
