import { parseAsNumber, parseAsString } from 'parse-dont-validate';
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
} from './selectBookmarked.queries';
import {
    downloadBookmarkedUnitQuery,
    IDownloadBookmarkedUnitQueryParams,
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

const bookmarkedUnit = {
    select: async (
        params: ConvertCurrencyToNumber<ISelectBookmarkedUnitQueryParams>,
        pool: Pool
    ): Promise<SortedUnit> =>
        (
            await selectBookmarkedUnitQuery.run(
                {
                    ...params,
                    ...convertRentalToNumeric({
                        min: params.minRental,
                        max: params.maxRental,
                    }),
                },
                pool
            )
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
        params: ConvertCurrencyToNumber<IDownloadBookmarkedUnitQueryParams>,
        pool: Pool
    ): Promise<SortedBookmarkedUnitDownload> =>
        (
            await downloadBookmarkedUnitQuery.run(
                {
                    ...params,
                    ...convertRentalToNumeric({
                        min: params.minRental,
                        max: params.maxRental,
                    }),
                },
                pool
            )
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
            parseAsNumber(parseInt(obj.frequency ?? '')).orElseThrowDefault(
                'frequency'
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
        params: ConvertCurrencyToNumber<ISelectCountBookmarkedUnitQueryParams>,
        pool: Pool
    ) => {
        const results = await selectCountBookmarkedUnitQuery.run(
            {
                ...params,
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
        return parseInt(
            parseAsString(results[0]?.count).orElseThrowDefault('count')
        );
    },
};

export default bookmarkedUnit;
