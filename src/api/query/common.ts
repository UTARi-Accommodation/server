import {
    parseAsNumber,
    parseAsReadonlyArray,
    parseAsString,
} from 'parse-dont-validate';
import { equal } from '../../database/common/whereClause';
import PostgreSQL from '../../database/postgres';
import select from '../../database/query/select';
import {
    AccommodationType,
    HandlerType,
    Month,
    Region,
} from '../../scrapper/scrapper/fetchParser';

const queryAccommodation = async (region: Region) => {
    const rows = await PostgreSQL.getPoolInstance().select(
        select([
            'id',
            'handler',
            'address',
            'latitude',
            'longitude',
            'remark',
            'month',
            'year',
            'facilities',
            'accommodationType',
        ])
            .from('accommodation')
            .where(equal('available', true))
            .and(equal('region', region))
            .toQuery()
    );

    return parseAsReadonlyArray(rows, (row) => {
        return {
            id: parseAsString(row.id).orElseThrowDefault('id'),
            handlerID: parseAsString(row.handler).orElseThrowDefault('handler'),
            address: parseAsString(row.address).orElseThrowDefault('address'),
            latitude: parseAsNumber(row.latitude).orElseGetUndefined(),
            longitude: parseAsNumber(row.longitude).orElseGetUndefined(),
            remark: parseAsString(row.remark).orElseThrowDefault('remark'),
            month: parseAsString(row.month).orElseThrowDefault(
                'month'
            ) as Month,
            year: parseAsNumber(row.year).orElseThrowDefault('year'),
            facilities: parseAsString(row.facilities).orElseThrowDefault(
                'facilities'
            ),
            accommodationType: parseAsString(
                row.accommodationType
            ).orElseThrowDefault('accommodationType') as AccommodationType,
        };
    }).orElseThrowDefault('rows');
};

const queryHandler = async (id: string) => {
    const rows = await PostgreSQL.getPoolInstance().select(
        select(['id', 'name', 'handlerType'])
            .from('handler')
            .where(equal('id', id))
            .toQuery()
    );
    return parseAsReadonlyArray(rows, (row) => {
        return {
            id: parseAsString(row.id).orElseThrowDefault('id'),
            name: parseAsString(row.name).orElseThrowDefault('name'),
            handlerType: parseAsString(row.address).orElseThrowDefault(
                'handlerType'
            ) as HandlerType,
        };
    }).orElseThrowDefault('rows');
};

const queryEmail = async (handler: string) => {
    const rows = await PostgreSQL.getPoolInstance().select(
        select(['id']).from('email').where(equal('handler', handler)).toQuery()
    );
    return parseAsReadonlyArray(rows, (row) => {
        return {
            email: parseAsString(row.id).orElseThrowDefault('id'),
        };
    }).orElseThrowDefault('rows');
};

const queryMobileNumber = async (handler: string) => {
    const rows = await PostgreSQL.getPoolInstance().select(
        select(['id'])
            .from('mobile_number')
            .where(equal('handler', handler))
            .toQuery()
    );
    return parseAsReadonlyArray(rows, (row) => {
        return {
            mobileNumber: parseAsString(row.id).orElseThrowDefault('id'),
        };
    }).orElseThrowDefault('rows');
};

export { queryMobileNumber, queryEmail, queryHandler, queryAccommodation };
