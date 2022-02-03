import PostgreSQL, {
    convertUnderScoreRowToCamelCase,
} from '../../database/postgres';
import {
    parseAsNumber,
    parseAsReadonlyArray,
    parseAsString,
} from 'parse-dont-validate';
import {
    QueriedRoom,
    RoomSize,
    RoomType,
} from '../../scrapper/scrapper/fetchParser';
import {
    CommonQuery,
    OrganizedQuery,
    generateRentalQuery,
    GenerateQuery,
    findIndex,
    generateAccommodationQuery,
    generateRangeQuery,
    parseContact,
    parseLocation,
    parseFacilities,
    parseRemarks,
    parseVisitCount,
    parseRental,
    parseRating,
} from './common';
import { capitalize } from 'granula-string';

type RoomQuery = CommonQuery &
    Readonly<{
        roomType: RoomType | undefined;
        minCapacity: number | undefined;
        maxCapacity: number | undefined;
    }>;

const generateRoomTypeQuery: GenerateQuery = (keys) => {
    const index = findIndex(keys, 'roomType');
    return !index ? '' : `AND room_type=$${index}`;
};

const generateRoomCapacityQuery: GenerateQuery = (keys) =>
    generateRangeQuery({
        keys,
        columnName: 'capacity',
        minRange: 'minCapacity',
        maxRange: 'maxCapacity',
        clause: 'WHERE',
    });

const queryRoom = async (
    roomQuery: RoomQuery
): Promise<ReadonlyArray<QueriedRoom>> => {
    const organizedRoomQuery = Object.entries(roomQuery).reduce(
        (prev, [key, value]) =>
            value === undefined ? prev : prev.concat({ key, value }),
        [] as ReadonlyArray<OrganizedQuery>
    );

    const keys: ReadonlyArray<string> = organizedRoomQuery.map(
        ({ key }) => key
    );

    return convertUnderScoreRowToCamelCase<unknown>(
        (
            await PostgreSQL.getPoolInstance().execParam(
                `
                SELECT room_id, mobile_number, email, address, latitude, longitude, facilities, remark, year, month, room_size, rental, capacity, rating, visit_count
                FROM
                (((((((
                  SELECT id as accommodation_id, handler, address, latitude, longitude, remark, month, year, region, facilities, accommodation_type
                  FROM accommodation
                  WHERE available=true ${generateAccommodationQuery(keys)}
                ) accommodation
                JOIN
                (
                  SELECT id as room_id, accommodation, rental, room_size, room_type
                  FROM room
                  WHERE available=true ${generateRentalQuery(
                      keys
                  )} ${generateRoomTypeQuery(keys)}
                ) room
                ON accommodation.accommodation_id=room.accommodation)
                LEFT OUTER JOIN
                (
                  SELECT handler, ARRAY_AGG(id) email
                  FROM email
                  GROUP BY handler
                ) email
                ON accommodation.handler=email.handler)
                LEFT OUTER JOIN
                (
                  SELECT handler, ARRAY_AGG(id) mobile_number
                  FROM mobile_number
                  GROUP BY handler
                ) mobile_number
                ON accommodation.handler=mobile_number.handler)
                LEFT OUTER JOIN
                (
                  SELECT room, ARRAY_AGG(rating) rating
                  FROM room_rating
                  GROUP BY room
                ) room_rating
                ON room.room_id=room_rating.room)
                LEFT OUTER JOIN
                (
                  SELECT room, COUNT(*) as visit_count
                  FROM room_visit
                  GROUP BY room
                ) room_visit
                ON room.room_id=room_visit.room)
                JOIN
                (
                  SELECT room, ARRAY_AGG(capacity) capacity
                  FROM room_capacity ${generateRoomCapacityQuery(keys)}
                  GROUP BY room
                ) room_capacity
                ON room.room_id=room_capacity.room)
                ORDER BY room.room_id`,
                organizedRoomQuery.map(({ key, value }) =>
                    typeof value === 'string'
                        ? key === 'region'
                            ? value.toUpperCase()
                            : key === 'roomType'
                            ? capitalize(value)
                            : `%${value}%`
                        : value
                )
            )
        ).rows
    ).map((row) => ({
        id: parseAsNumber(row.roomId).orElseThrowDefault('roomId'),
        contact: parseContact(row.mobileNumber, row.email),
        location: parseLocation({
            address: row.address,
            latitude: row.latitude,
            longitude: row.longitude,
        }),
        facilities: parseFacilities(row.facilities),
        remarks: parseRemarks({
            remark: row.remark,
            year: row.year,
            month: row.month,
        }),
        properties: {
            size: parseAsString(row.roomSize).orElseThrowDefault(
                'roomSize'
            ) as RoomSize,
            rental: parseRental(row.rental),
            capacity: parseAsReadonlyArray(row.capacity, (val) =>
                parseAsNumber(val).orElseThrowDefault('capacity')
            ).orElseThrowDefault('capacity'),
        },
        rating: parseRating(row.rating),
        visitCount: parseVisitCount(row.visitCount),
    }));
};

export { queryRoom };
