import {
    maxItemsPerPage,
    parseAsReadonlyIntArray,
    parseAsRegion,
    parseAsRoomType,
    parseAsSearch,
    parseAsUnitType,
    RoomsQueried,
    UnitsQueried,
} from 'utari-common';
import { generalRoom } from '../../api/query/room';
import { generalUnit } from '../../api/query/unit';
import postgreSQL from '../../database/postgres';
import express from 'express';
import {
    parseAsNumber,
    parseAsReadonlyObject,
    parseAsString,
} from 'parse-dont-validate';
import getCentralGeocode from '../../api/geocode';
import logger from '../../logger';
import { auth } from '../../auth/firebase';

const generalRouter = (app: express.Application) => ({
    queryUnit: () =>
        app.get('/api/units', async (req, res) => {
            if (req.method !== 'GET') {
                throw new Error('Only accept GET request');
            } else {
                const { query } = req;

                const unitType = parseAsUnitType(query.unitType);
                const region = parseAsRegion(query.region);

                if (!unitType || !region) {
                    const result = {
                        units: [],
                        numberOfResultsQueried: 0,
                        rentalRangeFrequencies: [],
                        bedRooms: [],
                        bathRooms: [],
                        page: 1,
                        totalPage: 0,
                        center: getCentralGeocode([], region ?? 'KP'),
                    } as UnitsQueried;
                    logger.log(result);
                    res.status(200).json(result);
                    return;
                }

                const token = parseAsString(query.token).orElseGetUndefined();
                const verifiedId = token
                    ? await auth.verifyIdToken(token)
                    : { uid: '' };

                const { page } = query;

                const unitQuery = parseAsReadonlyObject(query, (query) => ({
                    unitType,
                    region,
                    search: parseAsSearch(query.search),
                    minRental: parseAsNumber(parseFloat(query.minRental))
                        .inRangeOf(1, Number.MAX_VALUE)
                        .orElseGetUndefined(),
                    maxRental: parseAsNumber(parseFloat(query.maxRental))
                        .inRangeOf(1, Number.MAX_VALUE)
                        .orElseGetUndefined(),
                    userId: verifiedId.uid,
                    currentPage: parseAsNumber(
                        parseInt(typeof page === 'string' ? page : '1')
                    ).orElseLazyGet(() => 1),
                    maxItemsPerPage,
                })).orElseThrowDefault('query');

                const { bedRooms, bathRooms } = await generalUnit.range(
                    { region, unitType },
                    postgreSQL.instance.pool
                );

                const queryBedRooms = parseAsReadonlyIntArray(query.bedRooms);
                const queryBathRooms = parseAsReadonlyIntArray(query.bathRooms);

                const finalizedUnitQuery = {
                    bedRooms: queryBedRooms.length ? queryBedRooms : bedRooms,
                    bathRooms: queryBathRooms.length
                        ? queryBathRooms
                        : bathRooms,
                    ...unitQuery,
                };

                const units = await generalUnit.general(
                    finalizedUnitQuery,
                    postgreSQL.instance.pool
                );

                const numberOfResultsQueried = await generalUnit.count(
                    finalizedUnitQuery,
                    postgreSQL.instance.pool
                );

                if (!numberOfResultsQueried) {
                    const result = {
                        units: [],
                        numberOfResultsQueried,
                        rentalRangeFrequencies: [],
                        bedRooms: [],
                        bathRooms: [],
                        page: 1,
                        totalPage: 0,
                        center: getCentralGeocode([], region ?? 'KP'),
                    } as UnitsQueried;
                    logger.log(result);
                    res.status(200).json(result);
                    return;
                }

                const totalPage = Math.ceil(
                    numberOfResultsQueried / maxItemsPerPage
                );

                const empty = !units.length;

                const result = {
                    units,
                    numberOfResultsQueried: empty ? 0 : numberOfResultsQueried,
                    rentalRangeFrequencies: await generalUnit.rentalFrequency(
                        { region, unitType },
                        postgreSQL.instance.pool
                    ),
                    bedRooms,
                    bathRooms,
                    page: unitQuery.currentPage,
                    totalPage: empty ? 0 : totalPage,
                    center: getCentralGeocode(
                        units.map(({ location: { coordinate } }) => coordinate),
                        region
                    ),
                } as UnitsQueried;
                logger.log(result);
                res.status(200).json(result);
            }
        }),
    queryRoom: () =>
        app.get('/api/rooms', async (req, res) => {
            if (req.method !== 'GET') {
                throw new Error('Only accept GET request');
            } else {
                const { query } = req;

                const region = parseAsRegion(query.region);
                const roomType = parseAsRoomType(query.roomType);

                if (!roomType || !region) {
                    const result = {
                        rooms: [],
                        numberOfResultsQueried: 0,
                        rentalRangeFrequencies: [],
                        capacities: [],
                        page: 1,
                        totalPage: 0,
                        center: getCentralGeocode([], region ?? 'KP'),
                    } as RoomsQueried;
                    logger.log(result);
                    res.status(200).json(result);
                    return;
                }

                const token = parseAsString(query.token).orElseGetUndefined();
                const verifiedId = token
                    ? await auth.verifyIdToken(token)
                    : { uid: '' };

                const { page } = query;

                const parsedPage = parseAsNumber(
                    parseInt(typeof page === 'string' ? page : '1')
                ).orElseLazyGet(() => 1);

                const roomQuery = parseAsReadonlyObject(query, (query) => ({
                    roomType,
                    region,
                    search: parseAsSearch(query.search),
                    minRental: parseAsNumber(parseFloat(query.minRental))
                        .inRangeOf(1, Number.MAX_VALUE)
                        .orElseGetUndefined(),
                    maxRental: parseAsNumber(parseFloat(query.maxRental))
                        .inRangeOf(1, Number.MAX_VALUE)
                        .orElseGetUndefined(),
                    userId: verifiedId.uid,
                    currentPage: parseAsNumber(
                        parseInt(typeof page === 'string' ? page : '1')
                    ).orElseLazyGet(() => 1),
                    maxItemsPerPage,
                })).orElseThrowDefault('query');

                const capacities = await generalRoom.range(
                    { roomType, region },
                    postgreSQL.instance.pool
                );

                const queryCapacities = parseAsReadonlyIntArray(
                    query.capacities
                );

                const finalizedRoomQuery = {
                    capacities: queryCapacities.length
                        ? queryCapacities
                        : capacities,
                    ...roomQuery,
                };

                const rooms = await generalRoom.general(
                    finalizedRoomQuery,
                    postgreSQL.instance.pool
                );

                const numberOfResultsQueried = await generalRoom.count(
                    finalizedRoomQuery,
                    postgreSQL.instance.pool
                );

                if (!numberOfResultsQueried) {
                    const result = {
                        rooms: [],
                        numberOfResultsQueried,
                        rentalRangeFrequencies: [],
                        capacities: [],
                        page: 1,
                        totalPage: 0,
                        center: getCentralGeocode([], region ?? 'KP'),
                    } as RoomsQueried;
                    logger.log(result);
                    res.status(200).json(result);
                    return;
                }

                const totalPage = Math.ceil(
                    numberOfResultsQueried / maxItemsPerPage
                );

                const empty = !rooms.length;

                const result = {
                    rooms,
                    numberOfResultsQueried,
                    rentalRangeFrequencies: await generalRoom.rentalFrequency(
                        { region, roomType },
                        postgreSQL.instance.pool
                    ),
                    capacities,
                    page: parsedPage,
                    totalPage: empty ? 0 : totalPage,
                    center: getCentralGeocode(
                        rooms.map(({ location: { coordinate } }) => coordinate),
                        region
                    ),
                } as RoomsQueried;
                logger.log(result);
                res.status(200).json(result);
            }
        }),
});

export default generalRouter;
