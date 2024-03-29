import { parseAsNumber } from 'parse-dont-validate';
import {
    MultiSelectNumber,
    parseNullableAsDefaultOrUndefined,
    SortedBookmarkedUnitDownload,
    SortedUnit,
} from 'utari-common';
import {
    ConvertCurrencyToNumber,
    convertRentalToNumeric,
    parseContact,
    parseRating,
    parseRentalFromNumeric,
} from '../../../../api/query/common';
import { parseProperties } from '../../../../api/query/unit';
import { Pool } from '../../../postgres';
import {
    selectBookmarkedUnitQuery,
    ISelectBookmarkedUnitQueryParams,
    ISelectBookmarkedUnitQueryResult,
} from './selectBookmarked.queries';
import {
    downloadBookmarkedUnitQuery,
    IDownloadBookmarkedUnitQueryParams,
    IDownloadBookmarkedUnitQueryResult,
} from './download.queries';
import {
    ISelectRentalFrequencyParams,
    selectRentalFrequency,
} from './selectRentalFrequency.queries';
import {
    ISelectBedRoomsAndBathRoomsRangeParams,
    selectBedRoomsAndBathRoomsRange,
} from './selectBedRoomsAndBathRoomsRange.queries';
import {
    ISelectCountBookmarkedUnitQueryParams,
    selectCountBookmarkedUnitQuery,
} from './selectCount.queries';
import { DeepNonNullable, DeepReadonly } from '../../../../util/type';

const bookmarkedUnit = {
    select: async (
        params: ConvertCurrencyToNumber<
            DeepNonNullable<DeepReadonly<ISelectBookmarkedUnitQueryParams>>
        >,
        pool: Pool
    ): Promise<DeepNonNullable<SortedUnit>> =>
        (
            (await selectBookmarkedUnitQuery.run(
                {
                    ...params,
                    ...convertRentalToNumeric({
                        min: params.minRental,
                        max: params.maxRental,
                    }),
                } as ISelectBookmarkedUnitQueryParams,
                pool
            )) as ReadonlyArray<
                DeepNonNullable<ISelectBookmarkedUnitQueryResult>
            >
        ).map(
            ({
                address,
                bathRooms,
                bedRooms,
                facilities,
                utariUser,
                latitude,
                longitude,
                month,
                ratings,
                rental,
                timeCreated,
                unitId,
                year,
            }) => ({
                id: unitId,
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
                    bedRooms,
                    rental,
                    bathRooms,
                }),
                ratings: parseRating(ratings),
            })
        ),
    download: async (
        params: ConvertCurrencyToNumber<
            DeepNonNullable<DeepReadonly<IDownloadBookmarkedUnitQueryParams>>
        >,
        pool: Pool
    ): Promise<SortedBookmarkedUnitDownload> =>
        (
            (await downloadBookmarkedUnitQuery.run(
                {
                    ...params,
                    ...convertRentalToNumeric({
                        min: params.minRental,
                        max: params.maxRental,
                    }),
                } as IDownloadBookmarkedUnitQueryParams,
                pool
            )) as ReadonlyArray<
                DeepNonNullable<IDownloadBookmarkedUnitQueryResult>
            >
        ).map(
            ({
                address,
                email,
                mobileNumber,
                facilities,
                month,
                remark,
                rating,
                ratings,
                rental,
                timeCreated,
                bathRooms,
                bedRooms,
                year,
                unitId,
                name,
                handlerType,
            }) => ({
                id: unitId,
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
                    bedRooms,
                    rental,
                    bathRooms,
                }),
                rating: parseNullableAsDefaultOrUndefined(rating),
                ratings: parseRating(ratings),
            })
        ),
    selectRentalFrequency: async (
        params: Readonly<ISelectRentalFrequencyParams>,
        pool: Pool
    ): Promise<ReadonlyArray<Readonly<[number, number]>>> =>
        (await selectRentalFrequency.run(params, pool)).map((obj) => [
            parseRentalFromNumeric(obj.rental),
            parseAsNumber(obj.frequency).elseThrow(
                'frequency is not a number, it is null'
            ),
        ]),
    range: async (
        params: Readonly<ISelectBedRoomsAndBathRoomsRangeParams>,
        pool: Pool
    ): Promise<
        Readonly<{
            bathRooms: MultiSelectNumber;
            bedRooms: MultiSelectNumber;
        }>
    > => {
        const ranges = await selectBedRoomsAndBathRoomsRange.run(params, pool);
        if (ranges.length !== 1) {
            throw new Error(
                `Expect range to have 1 element, got ${ranges.length} instead`
            );
        }
        const [range] = ranges;
        if (!range) {
            throw new Error('range is undefined');
        }
        const { bath_rooms, bed_rooms } = range;
        return {
            bathRooms: bath_rooms ?? [],
            bedRooms: bed_rooms ?? [],
        };
    },
    count: async (
        params: ConvertCurrencyToNumber<
            DeepReadonly<ISelectCountBookmarkedUnitQueryParams>
        >,
        pool: Pool
    ) => {
        const results = await selectCountBookmarkedUnitQuery.run(
            {
                ...params,
                regions: Array.from(params.regions),
                unitTypes: Array.from(params.unitTypes),
                bathRooms: Array.from(params.bathRooms),
                bedRooms: Array.from(params.bedRooms),
                ...convertRentalToNumeric({
                    min: params.minRental,
                    max: params.maxRental,
                }),
            },
            pool
        );
        if (results.length !== 1) {
            throw new Error(
                `Expect bookmarked units count to have 1 element, got ${results.length} instead`
            );
        }
        const count = results[0]?.count;
        return parseAsNumber(count).elseThrow(
            `count is not number, it is ${count}`
        );
    },
};

export default bookmarkedUnit;
