import {
    parseNullableAsDefaultOrUndefined,
    QueriedRoomDetails,
} from 'utari-common';
import {
    parseContact,
    parseRating,
    parseVisitCount,
} from '../../../../api/query/common';
import { parseProperties } from '../../../../api/query/room';
import { Pool } from '../../../postgres';
import {
    detailedRoomQuery,
    IDetailedRoomQueryParams,
} from './detailed.queries';
import {
    detailedRoomQueryWithUser,
    IDetailedRoomQueryWithUserParams,
} from './detailedWithUser.queries';

const detailedRoom = {
    select: async (
        params: Readonly<IDetailedRoomQueryParams>,
        pool: Pool
    ): Promise<QueriedRoomDetails | undefined> => {
        const rooms = await detailedRoomQuery.run(params, pool);
        if (rooms.length > 1) {
            throw new Error(
                `Expect rooms to have 0 or 1 room, got ${rooms.length} instead`
            );
        }
        const [room] = rooms.map(
            ({
                address,
                latitude,
                longitude,
                capacities,
                email,
                facilities,
                handler_type,
                mobile_number,
                month,
                name,
                remark,
                rental,
                room_id,
                room_size,
                year,
                visit_count,
                ratings,
            }) => ({
                id: room_id,
                handler: {
                    name,
                    handlerType: handler_type,
                },
                contact: parseContact({ mobileNumber: mobile_number, email }),
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
                    roomSize: room_size,
                    capacities,
                }),
                bookmarked: false,
                visitCount: parseVisitCount(visit_count),
                ratings: parseRating(ratings),
                rating: undefined,
            })
        );
        return room;
    },
    selectWithUser: async (
        params: Readonly<IDetailedRoomQueryWithUserParams>,
        pool: Pool
    ): Promise<QueriedRoomDetails | undefined> => {
        const rooms = await detailedRoomQueryWithUser.run(params, pool);
        if (rooms.length > 1) {
            throw new Error(
                `Expect rooms to have 0 or 1 room, got ${rooms.length} instead`
            );
        }
        const [room] = rooms.map(
            ({
                address,
                latitude,
                longitude,
                capacities,
                email,
                facilities,
                handler_type,
                mobile_number,
                month,
                name,
                remark,
                rental,
                room_id,
                room_size,
                year,
                utari_user,
                visit_count,
                rating,
                ratings,
            }) => ({
                id: room_id,
                handler: {
                    name,
                    handlerType: handler_type,
                },
                contact: parseContact({ mobileNumber: mobile_number, email }),
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
                    roomSize: room_size,
                    capacities,
                }),
                bookmarked: Boolean(utari_user),
                visitCount: parseVisitCount(visit_count),
                ratings: parseRating(ratings),
                rating: parseNullableAsDefaultOrUndefined(rating),
            })
        );
        return room;
    },
};

export default detailedRoom;
