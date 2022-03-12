import {
    maxItemsPerPage,
    MultiSelectNumber,
    parseAsReadonlyIntArray,
    parseAsRegion,
    parseAsRoomType,
    parseAsSearch,
    parseAsUnitType,
    QueryRoomWithoutCapacities,
    QueryUnitWithoutBathRoomsAndBedRooms,
    RoomsQueried,
    SortedRoom,
    SortedUnit,
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
import getCentralGeocode from '../../api/geocode/index';
import logger from '../../logger/index';
import { auth } from '../../auth/firebase';

type ConvertTokenToId<T> = Omit<T, 'token'> &
    Readonly<{
        userId: string;
    }>;

const slice = (
    queried: SortedRoom | SortedUnit,
    {
        page,
        totalPage,
    }: Readonly<{
        page: number;
        totalPage: number;
    }>
) =>
    page > totalPage
        ? []
        : queried.length < maxItemsPerPage
        ? queried
        : queried.slice(
              (page - 1) * maxItemsPerPage,
              !page ? maxItemsPerPage : maxItemsPerPage * page
          );

const queryUnits = async ({
    bedRooms,
    bathRooms,
    unitQuery,
}: Readonly<{
    bedRooms: MultiSelectNumber;
    bathRooms: MultiSelectNumber;
    unitQuery: ConvertTokenToId<QueryUnitWithoutBathRoomsAndBedRooms>;
}>) => {
    const hasBedRooms = Boolean(bedRooms.length);
    const hasBathRooms = Boolean(bathRooms.length);
    if (hasBedRooms && hasBathRooms) {
        return generalUnit.sortQueryMadm(
            await generalUnit.selectWithBathRoomsAndBedRooms(
                {
                    ...unitQuery,
                    bedRooms,
                    bathRooms,
                },
                postgreSQL.instance.pool
            )
        );
    }
    if (hasBathRooms) {
        return generalUnit.sortQueryMadm(
            await generalUnit.selectWithBathRoomsAndWithoutBedRooms(
                {
                    ...unitQuery,
                    bathRooms,
                },
                postgreSQL.instance.pool
            )
        );
    }
    if (hasBedRooms) {
        return generalUnit.sortQueryMadm(
            await generalUnit.selectWithoutBathRoomsAndWithBedRooms(
                {
                    ...unitQuery,
                    bedRooms,
                },
                postgreSQL.instance.pool
            )
        );
    }
    return generalUnit.sortQueryMadm(
        await generalUnit.selectWithoutBathRoomsAndBedRooms(
            unitQuery,
            postgreSQL.instance.pool
        )
    );
};

const queryRooms = async ({
    capacities,
    roomQuery,
}: Readonly<{
    capacities: MultiSelectNumber;
    roomQuery: ConvertTokenToId<QueryRoomWithoutCapacities>;
}>) =>
    capacities.length
        ? generalRoom.sortQueryMadm(
              await generalRoom.selectWithCapacities(
                  {
                      ...roomQuery,
                      capacities,
                  },
                  postgreSQL.instance.pool
              )
          )
        : generalRoom.sortQueryMadm(
              await generalRoom.selectWithoutCapacities(
                  roomQuery,
                  postgreSQL.instance.pool
              )
          );

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
                        center: undefined,
                    } as UnitsQueried;
                    logger.log(result);
                    res.status(200).json(result);
                    return;
                }

                const token = parseAsString(query.token).orElseGetUndefined();
                const verifiedId = token
                    ? await auth.verifyIdToken(token)
                    : { uid: '' };

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
                })).orElseThrowDefault('query');

                const units = await queryUnits({
                    bedRooms: parseAsReadonlyIntArray(query.bedRooms),
                    bathRooms: parseAsReadonlyIntArray(query.bathRooms),
                    unitQuery,
                });

                const numberOfResultsQueried = units.length;

                if (!numberOfResultsQueried) {
                    const result = {
                        units: [],
                        numberOfResultsQueried,
                        rentalRangeFrequencies: [],
                        bedRooms: [],
                        bathRooms: [],
                        page: 1,
                        totalPage: 0,
                        center: undefined,
                    } as UnitsQueried;
                    logger.log(result);
                    res.status(200).json(result);
                    return;
                }

                const { page } = query;

                const parsedPage = parseAsNumber(
                    parseInt(typeof page === 'string' ? page : '1')
                ).orElseLazyGet(() => 1);

                const { bedRooms, bathRooms } = await generalUnit.range(
                    { region, unitType },
                    postgreSQL.instance.pool
                );

                const totalPage = Math.ceil(
                    numberOfResultsQueried / maxItemsPerPage
                );

                const slicedUnits = slice(units, {
                    page: parsedPage,
                    totalPage,
                });

                const empty = !slicedUnits.length;

                const result = {
                    units: slicedUnits,
                    numberOfResultsQueried: empty ? 0 : numberOfResultsQueried,
                    rentalRangeFrequencies: await generalUnit.rentalFrequency(
                        { region, unitType },
                        postgreSQL.instance.pool
                    ),
                    bedRooms,
                    bathRooms,
                    page: parsedPage,
                    totalPage: empty ? 0 : totalPage,
                    center: getCentralGeocode(
                        units.map(({ location: { coordinate } }) => coordinate)
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
                        center: undefined,
                    } as RoomsQueried;
                    logger.log(result);
                    res.status(200).json(result);
                    return;
                }

                const token = parseAsString(query.token).orElseGetUndefined();
                const verifiedId = token
                    ? await auth.verifyIdToken(token)
                    : { uid: '' };

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
                })).orElseThrowDefault('query');

                const rooms = await queryRooms({
                    capacities: parseAsReadonlyIntArray(query.capacities),
                    roomQuery,
                });

                const numberOfResultsQueried = rooms.length;

                if (!numberOfResultsQueried) {
                    const result = {
                        rooms: [],
                        numberOfResultsQueried,
                        rentalRangeFrequencies: [],
                        capacities: [],
                        page: 1,
                        totalPage: 0,
                        center: undefined,
                    } as RoomsQueried;
                    logger.log(result);
                    res.status(200).json(result);
                    return;
                }

                const { page } = query;

                const parsedPage = parseAsNumber(
                    parseInt(typeof page === 'string' ? page : '1')
                ).orElseLazyGet(() => 1);

                const capacities = await generalRoom.range(
                    { roomType, region },
                    postgreSQL.instance.pool
                );

                const totalPage = Math.ceil(
                    numberOfResultsQueried / maxItemsPerPage
                );

                const slicedRooms = slice(rooms, {
                    page: parsedPage,
                    totalPage,
                });

                const empty = !slicedRooms.length;

                const result = {
                    rooms: slicedRooms,
                    numberOfResultsQueried,
                    rentalRangeFrequencies: await generalRoom.rentalFrequency(
                        { region, roomType },
                        postgreSQL.instance.pool
                    ),
                    capacities,
                    page: parsedPage,
                    totalPage: empty ? 0 : totalPage,
                    center: getCentralGeocode(
                        rooms.map(({ location: { coordinate } }) => coordinate)
                    ),
                } as RoomsQueried;
                logger.log(result);
                res.status(200).json(result);
            }
        }),
});

export default generalRouter;
