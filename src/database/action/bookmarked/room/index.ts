import { parseAsNumber, parseAsString } from 'parse-dont-validate';
import {
    MultiSelectNumber,
    SortedRoom,
    SortedBookmarkedRoomDownload,
    parseNullableAsDefaultOrUndefined,
} from 'utari-common';
import {
    ConvertCurrencyToNumber,
    convertRentalToNumeric,
    parseContact,
    parseRating,
    parseRentalFromNumeric,
} from '../../../../api/query/common';
import { parseProperties } from '../../../../api/query/room';
import { Pool } from '../../../postgres';
import {
    selectBookmarkedRoomQuery,
    ISelectBookmarkedRoomQueryParams,
    ISelectBookmarkedRoomQueryResult,
} from './selectBookmarked.queries';
import {
    downloadBookmarkedRoomQuery,
    IDownloadBookmarkedRoomQueryParams,
    IDownloadBookmarkedRoomQueryResult,
} from './download.queries';
import {
    ISelectCapacitiesRangeParams,
    selectCapacitiesRange,
} from './selectCapacitiesRange.queries';
import {
    ISelectCountBookmarkedRoomQueryParams,
    selectCountBookmarkedRoomQuery,
} from './selectCount.queries';
import {
    ISelectRentalFrequencyParams,
    selectRentalFrequency,
} from './selectRentalFrequency.queries';
import { DeepNonNullable, DeepReadonly } from '../../../../util/type';

const bookmarkedRoom = {
    select: async (
        params: ConvertCurrencyToNumber<
            DeepReadonly<ISelectBookmarkedRoomQueryParams>
        >,
        pool: Pool
    ): Promise<SortedRoom> =>
        (
            (await selectBookmarkedRoomQuery.run(
                {
                    ...params,
                    capacities: Array.from(params.capacities),
                    regions: Array.from(params.regions),
                    roomTypes: Array.from(params.roomTypes),
                    ...convertRentalToNumeric({
                        min: params.minRental,
                        max: params.maxRental,
                    }),
                },
                pool
            )) as ReadonlyArray<
                DeepNonNullable<ISelectBookmarkedRoomQueryResult>
            >
        ).map(
            ({
                address,
                capacities,
                facilities,
                latitude,
                longitude,
                month,
                ratings,
                rental,
                roomId,
                utariUser,
                timeCreated,
                roomSize,
                year,
            }) => ({
                id: roomId,
                bookmarked: Boolean(utariUser && timeCreated),
                location: {
                    address,
                    coordinate: {
                        latitude,
                        longitude,
                    },
                },
                facilities,
                remarks: {
                    year,
                    month,
                },
                properties: parseProperties({
                    rental,
                    capacities,
                    roomSize,
                }),
                ratings: parseRating(ratings),
            })
        ),
    download: async (
        params: ConvertCurrencyToNumber<
            DeepReadonly<IDownloadBookmarkedRoomQueryParams>
        >,
        pool: Pool
    ): Promise<SortedBookmarkedRoomDownload> =>
        (
            (await downloadBookmarkedRoomQuery.run(
                {
                    ...params,
                    capacities: Array.from(params.capacities),
                    regions: Array.from(params.regions),
                    roomTypes: Array.from(params.roomTypes),
                    ...convertRentalToNumeric({
                        min: params.minRental,
                        max: params.maxRental,
                    }),
                },
                pool
            )) as ReadonlyArray<
                DeepNonNullable<IDownloadBookmarkedRoomQueryResult>
            >
        ).map(
            ({
                address,
                email,
                mobileNumber,
                capacities,
                facilities,
                month,
                remark,
                rating,
                ratings,
                rental,
                roomId,
                timeCreated,
                roomSize,
                year,
                name,
                handlerType,
            }) => ({
                id: roomId,
                handler: {
                    name,
                    handlerType,
                },
                contact: parseContact({
                    mobileNumber,
                    email,
                }),
                timeCreated,
                address,
                facilities,
                remarks: {
                    remark,
                    year,
                    month,
                },
                properties: parseProperties({
                    rental,
                    capacities,
                    roomSize,
                }),
                ratings: parseRating(ratings),
                rating: parseNullableAsDefaultOrUndefined(rating),
            })
        ),
    selectRentalFrequency: async (
        params: Readonly<ISelectRentalFrequencyParams>,
        pool: Pool
    ): Promise<ReadonlyArray<Readonly<[number, number]>>> =>
        (await selectRentalFrequency.run(params, pool)).map((obj) => [
            parseRentalFromNumeric(obj.rental),
            parseAsNumber(parseInt(obj.frequency ?? '')).orElseThrowDefault(
                'frequency'
            ),
        ]),
    selectCapacitiesRange: async (
        params: Readonly<ISelectCapacitiesRangeParams>,
        pool: Pool
    ): Promise<MultiSelectNumber> => {
        const roomCapacities = await selectCapacitiesRange.run(params, pool);
        if (roomCapacities.length !== 1) {
            throw new Error(
                `Expect roomCapacities to have 1 element, got ${roomCapacities.length} instead`
            );
        }
        const [capacity] = roomCapacities;
        if (!capacity) {
            throw new Error('capacity is undefined');
        }
        const { capacities } = capacity;
        return capacities ?? [];
    },
    count: async (
        params: ConvertCurrencyToNumber<
            DeepReadonly<ISelectCountBookmarkedRoomQueryParams>
        >,
        pool: Pool
    ) => {
        const results = await selectCountBookmarkedRoomQuery.run(
            {
                ...params,
                capacities: Array.from(params.capacities),
                regions: Array.from(params.regions),
                roomTypes: Array.from(params.roomTypes),
                ...convertRentalToNumeric({
                    min: params.minRental,
                    max: params.maxRental,
                }),
            },
            pool
        );
        if (results.length !== 1) {
            throw new Error(
                `Expect bookmarked rooms count to have 1 element, got ${results.length} instead`
            );
        }
        return parseInt(
            parseAsString(results[0]?.count).orElseThrowDefault('count')
        );
    },
};

export default bookmarkedRoom;
