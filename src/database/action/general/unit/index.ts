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
import { Pool } from '../../../postgres';
import {
    ISelectBedRoomsAndBathRoomsRangeParams,
    selectBedRoomsAndBathRoomsRange,
} from './selectBedRoomsAndBathRoomsRange.queries';
import {
    ISelectRentalFrequencyParams,
    selectRentalFrequency,
} from './selectRentalFrequency.queries';
import { parseAsNumber } from 'parse-dont-validate';
import {
    ISelectCountGeneralUnitQueryParams,
    selectCountGeneralUnitQuery,
} from './selectCount.queries';
import { DeepNonNullable, DeepReadonly } from '../../../../util/type';
import { parseProperties } from '../../../../api/query/unit';

type Units = ReadonlyArray<
    DeepNonNullable<DeepReadonly<ISelectGeneralUnitQueryResult>>
>;

const transformGeneralQuery = (units: Units) =>
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
        params: ConvertCurrencyToNumber<
            DeepReadonly<ISelectGeneralUnitQueryParams>
        >,
        pool: Pool
    ) =>
        transformGeneralQuery(
            (await selectGeneralUnitQuery.run(
                {
                    ...params,
                    bathRooms: Array.from(params.bathRooms),
                    bedRooms: Array.from(params.bedRooms),
                    ...convertRentalToNumeric({
                        min: params.minRental,
                        max: params.maxRental,
                    }),
                },
                pool
            )) as Units
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
            parseAsNumber(obj.frequency).elseThrow(
                'frequency is not a number, it is null'
            ),
        ]),
    count: async (
        params: ConvertCurrencyToNumber<
            DeepReadonly<ISelectCountGeneralUnitQueryParams>
        >,
        pool: Pool
    ) => {
        const results = await selectCountGeneralUnitQuery.run(
            {
                ...params,
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
            `count is not a number, it is ${count}`
        );
    },
};

export default generalUnit;
