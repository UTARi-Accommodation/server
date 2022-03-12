import { parseAsNumber } from 'parse-dont-validate';
import {
    MultiSelectNumber,
    SortedRoom,
    SortedBookmarkedRoomDownload,
    parseNullableAsDefaultOrUndefined,
} from 'utari-common';
import {
    ConvertCurrencyToNumber,
    convertRentalToCurrency,
    parseContact,
    parseRating,
    parseRentalFromCurrency,
} from '../../../../api/query/common';
import { parseProperties } from '../../../../api/query/room';
import { Pool } from '../../../postgres';
import {
    bookmarkedRoomQuery,
    IBookmarkedRoomQueryParams,
} from './bookmarked.queries';
import {
    downloadBookmarkedRoomQuery,
    IDownloadBookmarkedRoomQueryParams,
} from './download.queries';
import {
    ISelectCapacitiesRangeParams,
    selectCapacitiesRange,
} from './selectCapacitiesRange.queries';
import {
    ISelectRentalFrequencyParams,
    selectRentalFrequency,
} from './selectRentalFrequency.queries';

const bookmarkedRoom = {
    select: async (
        params: ConvertCurrencyToNumber<IBookmarkedRoomQueryParams>,
        pool: Pool
    ): Promise<SortedRoom> =>
        (
            await bookmarkedRoomQuery.run(
                {
                    ...params,
                    ...convertRentalToCurrency({
                        min: params.minRental,
                        max: params.maxRental,
                    }),
                },
                pool
            )
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
                room_id,
                utari_user,
                time_created,
                room_size,
                year,
            }) => ({
                id: room_id,
                bookmarked: Boolean(utari_user && time_created),
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
                    rental: rental,
                    capacities,
                    roomSize: room_size,
                }),
                ratings: parseRating(ratings),
            })
        ),
    download: async (
        params: ConvertCurrencyToNumber<IDownloadBookmarkedRoomQueryParams>,
        pool: Pool
    ): Promise<SortedBookmarkedRoomDownload> =>
        (
            await downloadBookmarkedRoomQuery.run(
                {
                    ...params,
                    ...convertRentalToCurrency({
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
                mobile_number,
                capacities,
                facilities,
                month,
                remark,
                rating,
                ratings,
                rental,
                room_id,
                time_created,
                room_size,
                year,
                name,
                handler_type,
            }) => ({
                id: room_id,
                handler: {
                    name,
                    handlerType: handler_type,
                },
                contact: parseContact({
                    mobileNumber: mobile_number,
                    email,
                }),
                timeCreated: time_created,
                address,
                facilities,
                remarks: {
                    remark,
                    year,
                    month,
                },
                properties: parseProperties({
                    rental: rental,
                    capacities,
                    roomSize: room_size,
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
            parseRentalFromCurrency(obj.rental),
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
};

export default bookmarkedRoom;
