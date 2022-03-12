import { parseAsNumber } from 'parse-dont-validate';
import { MultiSelectNumber, QueriedRoom } from 'utari-common';
import { multiAttributeDecisionModelRoom } from '../../../../api/madm/index';
import {
    ConvertCurrencyToNumber,
    convertRentalToCurrency,
    parseContact,
    parseRating,
    parseRentalFromCurrency,
    parseVisitCount,
} from '../../../../api/query/common';
import { parseProperties } from '../../../../api/query/room';
import { Pool } from '../../../postgres';
import {
    ISelectCapacitiesRangeParams,
    selectCapacitiesRange,
} from './selectCapacitiesRange.queries';
import {
    ISelectRentalFrequencyParams,
    selectRentalFrequency,
} from './selectRentalFrequency.queries';
import {
    generalRoomQueryWithCapacities,
    IGeneralRoomQueryWithCapacitiesParams,
    IGeneralRoomQueryWithCapacitiesResult,
} from './withCapacities.queries';
import {
    generalRoomQueryWithoutCapacities,
    IGeneralRoomQueryWithoutCapacitiesParams,
    IGeneralRoomQueryWithoutCapacitiesResult,
} from './withoutCapacities.queries';

const transformGeneralQuery = (
    rooms: ReadonlyArray<
        | IGeneralRoomQueryWithoutCapacitiesResult
        | IGeneralRoomQueryWithCapacitiesResult
    >
): ReadonlyArray<QueriedRoom> =>
    rooms.map(
        ({
            address,
            capacities,
            email,
            facilities,
            latitude,
            longitude,
            mobile_number,
            month,
            ratings,
            remark,
            rental,
            room_id,
            room_size,
            visit_count,
            year,
            utari_user,
        }) => ({
            id: room_id,
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
                rental,
                capacities,
                roomSize: room_size,
            }),
            ratings: parseRating(ratings),
            visitCount: parseVisitCount(visit_count),
            bookmarked: Boolean(utari_user),
        })
    );

const generalRoom = {
    sortQueryMadm: (rooms: ReadonlyArray<QueriedRoom>) =>
        multiAttributeDecisionModelRoom(rooms),
    selectWithCapacities: async (
        params: ConvertCurrencyToNumber<IGeneralRoomQueryWithCapacitiesParams>,
        pool: Pool
    ) =>
        transformGeneralQuery(
            await generalRoomQueryWithCapacities.run(
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
    selectWithoutCapacities: async (
        params: ConvertCurrencyToNumber<IGeneralRoomQueryWithoutCapacitiesParams>,
        pool: Pool
    ) =>
        transformGeneralQuery(
            await generalRoomQueryWithoutCapacities.run(
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

export default generalRoom;
