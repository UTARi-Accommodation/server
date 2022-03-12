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
} from './detailedWithUser.queries';
import {
    detailedUnitQuery,
    IDetailedUnitQueryParams,
} from './detailed.queries';

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
        const [unit] = units.map(
            ({
                address,
                latitude,
                longitude,
                bath_rooms,
                bed_rooms,
                email,
                facilities,
                handler_type,
                mobile_number,
                month,
                name,
                remark,
                rental,
                unit_id,
                year,
                visit_count,
                ratings,
            }) => ({
                id: unit_id,
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
                    bed_rooms,
                    rental,
                    bath_rooms,
                }),
                bookmarked: false,
                visitCount: parseVisitCount(visit_count),
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
        const [unit] = units.map(
            ({
                address,
                latitude,
                longitude,
                bath_rooms,
                bed_rooms,
                email,
                facilities,
                handler_type,
                mobile_number,
                month,
                name,
                remark,
                rental,
                unit_id,
                year,
                utari_user,
                visit_count,
                rating,
                ratings,
            }) => ({
                id: unit_id,
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
                    bed_rooms,
                    rental,
                    bath_rooms,
                }),
                bookmarked: Boolean(utari_user),
                visitCount: parseVisitCount(visit_count),
                ratings: parseRating(ratings),
                rating: parseNullableAsDefaultOrUndefined(rating),
            })
        );
        return unit;
    },
};

export default detailedUnit;
