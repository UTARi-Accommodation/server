import PostgreSQL, {
    convertUnderScoreRowToCamelCase,
    NullableValue,
} from '../../database/postgres';
import { parseAsNumber } from 'parse-dont-validate';
import { QueriedUnit, UnitType } from '../../scrapper/scrapper/fetchParser';
import {
    CommonQuery,
    OrganizedQuery,
    generateAccommodationQuery,
    GenerateQuery,
    findIndex,
    generateRentalQuery,
    generateRangeQuery,
    parseContact,
    parseLocation,
    parseFacilities,
    parseRemarks,
    parseVisitCount,
    parseRating,
    parseRental,
} from './common';
import { capitalize } from 'granula-string';

type RoomQuery = CommonQuery &
    Readonly<{
        unitType: UnitType | undefined;
        minBedRoom: number | undefined;
        maxBedRoom: number | undefined;
        minBathRoom: number | undefined;
        maxBathRoom: number | undefined;
    }>;

const generateUnitTypeQuery: GenerateQuery = (keys) => {
    const index = findIndex(keys, 'unitType');
    return !index ? '' : `AND unit_type=$${index}`;
};

const generateBedRoomsQuery: GenerateQuery = (keys) =>
    generateRangeQuery({
        keys,
        columnName: 'bed_rooms',
        minRange: 'minBedRoom',
        maxRange: 'maxBedRoom',
        clause: 'AND',
    });

const generateBathRoomsQuery: GenerateQuery = (keys) =>
    generateRangeQuery({
        keys,
        columnName: 'bath_rooms',
        minRange: 'minBathRoom',
        maxRange: 'maxBathRoom',
        clause: 'AND',
    });

const queryUnit = async (
    roomQuery: RoomQuery
): Promise<ReadonlyArray<QueriedUnit>> => {
    const organizedRoomQuery = Object.entries(roomQuery).reduce(
        (prev, [key, value]) =>
            value === undefined ? prev : prev.concat({ key, value }),
        [] as ReadonlyArray<OrganizedQuery>
    );

    const keys: ReadonlyArray<string> = organizedRoomQuery.map(
        ({ key }) => key
    );

    return convertUnderScoreRowToCamelCase<NullableValue>(
        (
            await PostgreSQL.getPoolInstance().execParam(
                `
                SELECT unit_id, mobile_number, email, address, latitude, longitude, facilities, remark, year, month, bed_rooms, bath_rooms, rental, rating, visit_count
                FROM
                ((((((
                    SELECT id as accommodation_id, handler, address, latitude, longitude, remark, month, year, region, facilities, accommodation_type
                    FROM accommodation
                    WHERE available=true ${generateAccommodationQuery(keys)}
                ) accommodation
                JOIN
                (
                    SELECT id as unit_id, accommodation, bath_rooms, bed_rooms, rental, unit_type
                    FROM unit
                    WHERE available=true ${generateRentalQuery(
                        keys
                    )} ${generateUnitTypeQuery(keys)} ${generateBedRoomsQuery(
                    keys
                )} ${generateBathRoomsQuery(keys)}
                ) unit
                ON accommodation.accommodation_id=unit.accommodation)
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
                    SELECT unit, ARRAY_AGG(rating) rating
                    FROM unit_rating
                    GROUP BY unit
                ) unit_rating
                ON unit.unit_id=unit_rating.unit)
                LEFT OUTER JOIN
                (
                    SELECT unit, COUNT(*) as visit_count
                    FROM unit_visit
                    GROUP BY unit
                ) unit_visit
                ON unit.unit_id=unit_visit.unit)
                ORDER BY unit.unit_id
                `,
                organizedRoomQuery.map(({ key, value }) =>
                    typeof value === 'string'
                        ? key === 'region'
                            ? value.toUpperCase()
                            : key === 'unitType'
                            ? capitalize(value)
                            : `%${value}%`
                        : value
                )
            )
        ).rows
    ).map((row) => ({
        id: parseAsNumber(row.unitId).orElseThrowDefault('unitId'),
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
            bedRooms: parseAsNumber(row.bedRooms).orElseThrowDefault(
                'bedRooms'
            ),
            rental: parseRental(row.rental),
            bathRooms: parseAsNumber(row.bathRooms).orElseThrowDefault(
                'bathRooms'
            ),
        },
        rating: parseRating(row.rating),
        visitCount: parseVisitCount(row.visitCount),
    }));
};

export { queryUnit };
