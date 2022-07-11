import {
    parseNullableAsDefaultOrUndefined,
    QueriedUnitDetails,
} from 'utari-common';
import {
    parseContact,
    parseRating,
    parseVisitCount,
} from '../../../../api/query/common';
import { parseProperties } from '../../../../api/query/unit';
import { Pool } from '../../../postgres';
import {
    detailedUnitQueryWithUser,
    IDetailedUnitQueryWithUserParams,
    IDetailedUnitQueryWithUserResult,
} from './detailedWithUser.queries';
import {
    detailedUnitQuery,
    IDetailedUnitQueryParams,
    IDetailedUnitQueryResult,
} from './detailed.queries';
import { DeepNonNullable } from '../../../../util/type';

const detailedUnit = {
    select: async (
        params: Readonly<IDetailedUnitQueryParams>,
        pool: Pool
    ): Promise<QueriedUnitDetails | undefined> => {
        const units = await detailedUnitQuery.run(params, pool);
        if (units.length > 1) {
            throw new Error(
                `Expect units to have 0 or 1 unit, got ${units.length} instead`
            );
        }
        const [unit] = (
            units as ReadonlyArray<DeepNonNullable<IDetailedUnitQueryResult>>
        ).map(
            ({
                address,
                latitude,
                longitude,
                bathRooms,
                bedRooms,
                email,
                facilities,
                handlerType,
                mobileNumber,
                month,
                name,
                remark,
                rental,
                unitId,
                year,
                visitCount,
                ratings,
            }) => ({
                id: unitId,
                handler: {
                    name,
                    handlerType,
                },
                contact: parseContact({ mobileNumber, email }),
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
                    bedRooms,
                    rental,
                    bathRooms,
                }),
                bookmarked: false,
                visitCount: parseVisitCount(visitCount),
                ratings: parseRating(ratings),
                rating: undefined,
            })
        );
        return unit;
    },
    selectWithUser: async (
        params: Readonly<IDetailedUnitQueryWithUserParams>,
        pool: Pool
    ): Promise<QueriedUnitDetails | undefined> => {
        const units = await detailedUnitQueryWithUser.run(params, pool);
        if (units.length > 1) {
            throw new Error(
                `Expect units to have 0 or 1 unit, got ${units.length} instead`
            );
        }
        const [unit] = (
            units as ReadonlyArray<
                DeepNonNullable<IDetailedUnitQueryWithUserResult>
            >
        ).map(
            ({
                address,
                latitude,
                longitude,
                bathRooms,
                bedRooms,
                email,
                facilities,
                handlerType,
                mobileNumber,
                month,
                name,
                remark,
                rental,
                unitId,
                year,
                utariUser,
                visitCount,
                rating,
                ratings,
            }) => ({
                id: unitId,
                handler: {
                    name,
                    handlerType,
                },
                contact: parseContact({ mobileNumber, email }),
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
                    bedRooms,
                    rental,
                    bathRooms,
                }),
                bookmarked: Boolean(utariUser),
                visitCount: parseVisitCount(visitCount),
                ratings: parseRating(ratings),
                rating: parseNullableAsDefaultOrUndefined(rating),
            })
        );
        return unit;
    },
};

export default detailedUnit;
