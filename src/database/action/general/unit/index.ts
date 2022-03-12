import { MultiSelectNumber, QueriedUnit } from 'utari-common';
import {
    generalUnitQueryWithBathRoomsAndBedRooms,
    IGeneralUnitQueryWithBathRoomsAndBedRoomsParams,
    IGeneralUnitQueryWithBathRoomsAndBedRoomsResult,
} from './withBathRoomsAndBedRooms.queries';
import {
    generalUnitQueryWithBathRoomsAndWithoutBedRooms,
    IGeneralUnitQueryWithBathRoomsAndWithoutBedRoomsParams,
    IGeneralUnitQueryWithBathRoomsAndWithoutBedRoomsResult,
} from './withBathRoomsAndWithoutBedRooms.queries';
import {
    generalUnitQueryWithoutBathRoomsAndBedRooms,
    IGeneralUnitQueryWithoutBathRoomsAndBedRoomsParams,
    IGeneralUnitQueryWithoutBathRoomsAndBedRoomsResult,
} from './withoutBathRoomsAndBedRooms.queries';
import {
    generalUnitQueryWithoutBathRoomsAndWithBedRooms,
    IGeneralUnitQueryWithoutBathRoomsAndWithBedRoomsParams,
    IGeneralUnitQueryWithoutBathRoomsAndWithBedRoomsResult,
} from './withoutBathRoomsAndWithBedRooms.queries';
import {
    ConvertCurrencyToNumber,
    convertRentalToCurrency,
    parseContact,
    parseRating,
    parseRentalFromCurrency,
    parseVisitCount,
} from '../../../../api/query/common';
import { parseProperties } from '../../../../api/query/unit';
import { multiAttributeDecisionModelUnit } from '../../../../api/madm/index';
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

const transformGeneralQuery = (
    units: ReadonlyArray<
        | IGeneralUnitQueryWithBathRoomsAndBedRoomsResult
        | IGeneralUnitQueryWithoutBathRoomsAndBedRoomsResult
        | IGeneralUnitQueryWithBathRoomsAndWithoutBedRoomsResult
        | IGeneralUnitQueryWithoutBathRoomsAndWithBedRoomsResult
    >
): ReadonlyArray<QueriedUnit> =>
    units.map(
        ({
            address,
            bath_rooms,
            bed_rooms,
            email,
            facilities,
            latitude,
            longitude,
            mobile_number,
            month,
            ratings,
            remark,
            rental,
            unit_id,
            visit_count,
            year,
            utari_user,
        }) => ({
            id: unit_id,
            contact: parseContact({
                mobileNumber: mobile_number,
                email,
            }),
            location: {
                address,
                coordinate: {
                    latitude,
                    longitude,
                },
            },
            facilities,
            remarks: {
                remark,
                year,
                month,
            },
            properties: parseProperties({
                bed_rooms,
                rental,
                bath_rooms,
            }),
            ratings: parseRating(ratings),
            visitCount: parseVisitCount(visit_count),
            bookmarked: Boolean(utari_user),
        })
    );

const generalUnit = {
    sortQueryMadm: (units: ReadonlyArray<QueriedUnit>) =>
        multiAttributeDecisionModelUnit(units),
    selectWithBathRoomsAndBedRooms: async (
        params: ConvertCurrencyToNumber<IGeneralUnitQueryWithBathRoomsAndBedRoomsParams>,
        pool: Pool
    ) =>
        transformGeneralQuery(
            await generalUnitQueryWithBathRoomsAndBedRooms.run(
                {
                    ...params,
                    ...convertRentalToCurrency({
                        min: params.minRental,
                        max: params.maxRental,
                    }),
                },
                pool
            )
        ),
    selectWithoutBathRoomsAndBedRooms: async (
        params: ConvertCurrencyToNumber<IGeneralUnitQueryWithoutBathRoomsAndBedRoomsParams>,
        pool: Pool
    ) =>
        transformGeneralQuery(
            await generalUnitQueryWithoutBathRoomsAndBedRooms.run(
                {
                    ...params,
                    ...convertRentalToCurrency({
                        min: params.minRental,
                        max: params.maxRental,
                    }),
                },
                pool
            )
        ),
    selectWithBathRoomsAndWithoutBedRooms: async (
        params: ConvertCurrencyToNumber<IGeneralUnitQueryWithBathRoomsAndWithoutBedRoomsParams>,
        pool: Pool
    ) =>
        transformGeneralQuery(
            await generalUnitQueryWithBathRoomsAndWithoutBedRooms.run(
                {
                    ...params,
                    ...convertRentalToCurrency({
                        min: params.minRental,
                        max: params.maxRental,
                    }),
                },
                pool
            )
        ),
    selectWithoutBathRoomsAndWithBedRooms: async (
        params: ConvertCurrencyToNumber<IGeneralUnitQueryWithoutBathRoomsAndWithBedRoomsParams>,
        pool: Pool
    ) =>
        transformGeneralQuery(
            await generalUnitQueryWithoutBathRoomsAndWithBedRooms.run(
                {
                    ...params,
                    ...convertRentalToCurrency({
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
            parseRentalFromCurrency(obj.rental),
            parseAsNumber(parseInt(obj.frequency ?? '')).orElseThrowDefault(
                'frequency'
            ),
        ]),
};
export default generalUnit;
