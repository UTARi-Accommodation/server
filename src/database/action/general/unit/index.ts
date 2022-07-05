import { MultiSelectNumber } from 'utari-common';
import {
    selectGeneralUnitQuery,
    ISelectGeneralUnitQueryParams,
    ISelectGeneralUnitQueryResult,
} from './selectGeneral.queries';
import {
    ConvertCurrencyToNumber,
    convertRentalToNumeric,
    parseRating,
    parseRentalFromNumeric,
} from '../../../../api/query/common';
import { parseProperties } from '../../../../api/query/unit';
import { Pool } from '../../../postgres';
import {
    ISelectBedRoomsAndBathRoomsRangeParams,
    selectBedRoomsAndBathRoomsRange,
} from './selectBedRoomsAndBathRoomsRange.queries';
import {
    ISelectRentalFrequencyParams,
    selectRentalFrequency,
} from './selectRentalFrequency.queries';
import { parseAsNumber, parseAsString } from 'parse-dont-validate';
import {
    ISelectCountGeneralUnitQueryParams,
    selectCountGeneralUnitQuery,
} from './selectCount.queries';

const transformGeneralQuery = (
    units: ReadonlyArray<ISelectGeneralUnitQueryResult>
) =>
    units.map(
        ({
            address,
            bathRooms,
            bedRooms,
            facilities,
            latitude,
            longitude,
            month,
            ratings,
            rental,
            unitId,
            year,
            utariUser,
        }) => ({
            id: unitId,
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
            bookmarked: Boolean(utariUser),
        })
    );

const generalUnit = {
    general: async (
        params: ConvertCurrencyToNumber<ISelectGeneralUnitQueryParams>,
        pool: Pool
    ) =>
        transformGeneralQuery(
            await selectGeneralUnitQuery.run(
                {
                    ...params,
                    ...convertRentalToNumeric({
                        min: params.minRental,
                        max: params.maxRental,
                    }),
                },
                pool
            )
        ),
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
    rentalFrequency: async (
        params: Readonly<ISelectRentalFrequencyParams>,
        pool: Pool
    ): Promise<ReadonlyArray<Readonly<[number, number]>>> =>
        (await selectRentalFrequency.run(params, pool)).map((obj) => [
            parseRentalFromNumeric(obj.rental),
            parseAsNumber(parseInt(obj.frequency ?? '')).orElseThrowDefault(
                'frequency'
            ),
        ]),
    count: async (
        params: ConvertCurrencyToNumber<ISelectCountGeneralUnitQueryParams>,
        pool: Pool
    ) => {
        const results = await selectCountGeneralUnitQuery.run(
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

export default generalUnit;
