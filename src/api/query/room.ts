import {
    parseAsNumber,
    parseAsReadonlyArray,
    parseAsString,
} from 'parse-dont-validate';
import { equal } from '../../database/common/whereClause';
import PostgreSQL from '../../database/postgres';
import select from '../../database/query/select';
import { RoomSize, RoomType } from '../../scrapper/scrapper/fetchParser';

const queryRoom = async (accommodationID: number) => {
    const rows = await PostgreSQL.getPoolInstance().select(
        select(['id', 'roomType', 'roomSize', 'rental'])
            .from('roomSize')
            .where(equal('available', true))
            .and(equal('accommodation', accommodationID))
            .toQuery()
    );
    return parseAsReadonlyArray(rows, (val) => ({
        id: parseAsNumber(val.id).orElseThrowDefault('id'),
        roomType: parseAsString(val.roomType).orElseThrowDefault(
            'roomType'
        ) as RoomType,
        roomSize: parseAsString(val.roomSize).orElseThrowDefault(
            'roomSize'
        ) as RoomSize,
        rental: parseAsString(val.rental).orElseThrowDefault('rental'),
    })).orElseThrowDefault('rows');
};

const queryRoomCapacity = async (roomID: number) => {
    const rows = await PostgreSQL.getPoolInstance().select(
        select(['capacity'])
            .from('room_capacity')
            .where(equal('room', roomID))
            .toQuery()
    );
    return parseAsReadonlyArray(rows, (val) => ({
        capacity: parseAsNumber(val.capacity).orElseThrowDefault('capacity'),
    })).orElseThrowDefault('rows');
};

const queryRoomRating = async (roomID: number) => {
    const rows = await PostgreSQL.getPoolInstance().select(
        select(['rating'])
            .from('room_rating')
            .where(equal('room', roomID))
            .toQuery()
    );
    return parseAsReadonlyArray(rows, (val) => ({
        rating: parseAsNumber(val.rating).orElseThrowDefault('rating'),
    })).orElseThrowDefault('rows');
};

const queryRoomVisit = async (roomID: number) => {
    const rows = await PostgreSQL.getPoolInstance().select(
        select(['id']).from('room_visit').where(equal('room', roomID)).toQuery()
    );
    return rows.length;
};

export { queryRoomVisit, queryRoomRating, queryRoom, queryRoomCapacity };
