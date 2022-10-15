import { parseAsNumber } from 'parse-dont-validate';
import { MultiSelectNumber } from 'utari-common';
import {
    ConvertCurrencyToNumber,
    convertRentalToNumeric,
    parseRating,
    parseRentalFromNumeric,
} from '../../../../api/query/common';
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
    selectGeneralRoomQuery,
    ISelectGeneralRoomQueryResult,
    ISelectGeneralRoomQueryParams,
} from './selectGeneral.queries';
import {
    ISelectCountGeneralRoomQueryParams,
    selectCountGeneralRoomQuery,
} from './selectCount.queries';
import { DeepNonNullable, DeepReadonly } from '../../../../util/type';
import { parseProperties } from '../../../../api/query/room';

type Rooms = ReadonlyArray<DeepNonNullable<ISelectGeneralRoomQueryResult>>;

const transformGeneralQuery = (rooms: Rooms) =>
    rooms.map(
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
            roomSize,
            year,
            utariUser,
        }) => ({
            id: roomId,
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
            bookmarked: Boolean(utariUser),
        })
    );

const generalRoom = {
    general: async (
        params: ConvertCurrencyToNumber<
            DeepNonNullable<DeepReadonly<ISelectGeneralRoomQueryParams>>
        >,
        pool: Pool
    ) => {
        return transformGeneralQuery(
            (await selectGeneralRoomQuery.run(
                {
                    ...params,
                    ...convertRentalToNumeric({
                        min: params.minRental,
                        max: params.maxRental,
                    }),
                } as ISelectGeneralRoomQueryParams,
                pool
            )) as Rooms
        );
    },
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
            parseRentalFromNumeric(obj.rental),
            parseAsNumber(obj.frequency).elseThrow(
                'frequency is not a number, it is null'
            ),
        ]),
    count: async (
        params: ConvertCurrencyToNumber<
            DeepNonNullable<DeepReadonly<ISelectCountGeneralRoomQueryParams>>
        >,
        pool: Pool
    ) => {
        const results = await selectCountGeneralRoomQuery.run(
            {
                ...params,
                ...convertRentalToNumeric({
                    min: params.minRental,
                    max: params.maxRental,
                }),
            } as ISelectCountGeneralRoomQueryParams,
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

export default generalRoom;
