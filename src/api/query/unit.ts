import {
    parseAsNumber,
    parseAsReadonlyArray,
    parseAsString,
} from 'parse-dont-validate';
import { equal } from '../../database/common/whereClause';
import PostgreSQL from '../../database/postgres';
import select from '../../database/query/select';
import { UnitType } from '../../scrapper/scrapper/fetchParser';

const queryUnit = async (accommodationID: number) => {
    const rows = await PostgreSQL.getPoolInstance().select(
        select(['id', 'bathRooms', 'bedRooms', 'rental', 'unitType'])
            .from('unit')
            .where(equal('available', true))
            .and(equal('accommodation', accommodationID))
            .toQuery()
    );
    return parseAsReadonlyArray(rows, (val) => ({
        id: parseAsNumber(val.id).orElseThrowDefault('id'),
        bathRooms: parseAsNumber(val.bathRooms).orElseThrowDefault('bathRooms'),
        bedRooms: parseAsNumber(val.bedRooms).orElseThrowDefault('bedRooms'),
        rental: parseAsString(val.rental).orElseThrowDefault('rental'),
        unitType: parseAsString(val.unitType).orElseThrowDefault(
            'unitType'
        ) as UnitType,
    })).orElseThrowDefault('rows');
};

const queryUnitRating = async (unitID: number) => {
    const rows = await PostgreSQL.getPoolInstance().select(
        select(['rating'])
            .from('unit_rating')
            .where(equal('unit', unitID))
            .toQuery()
    );
    return parseAsReadonlyArray(rows, (val) => ({
        rating: parseAsNumber(val.rating).orElseThrowDefault('rating'),
    })).orElseThrowDefault('rows');
};

const queryUnitVisit = async (unitID: number) => {
    const rows = await PostgreSQL.getPoolInstance().select(
        select(['id']).from('unit_visit').where(equal('unit', unitID)).toQuery()
    );
    return rows.length;
};

export { queryUnitVisit, queryUnitRating, queryUnit };
