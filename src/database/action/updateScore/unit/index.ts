import {
    computeUnitScore,
    multiAttributeDecisionModelUnit,
    MultiAttributeDecisionModelUnits,
} from '../../../../api/madm';
import {
    parseAsMinMaxRental,
    parseContact,
    parseRating,
    parseVisitCount,
} from '../../../../api/query/common';
import { parseProperties } from '../../../../api/query/unit';
import postgreSQL, { Pool } from '../../../postgres';
import unit from '../../../table/unit';
import { selectMinMaxRental } from './minMaxRental.queries';
import {
    IQueryToUpdateScoreOfAllUnitParams,
    IQueryToUpdateScoreOfAllUnitResult,
    queryToUpdateScoreOfAllUnit,
} from './selectAll.queries';
import {
    IQueryToUpdateScoreOfOneUnitParams,
    queryToUpdateScoreOfOneUnit,
} from './selectOne.queries';

const updateUnitScore = (() => {
    const transformGeneralQuery = (
        units: ReadonlyArray<IQueryToUpdateScoreOfAllUnitResult>
    ): MultiAttributeDecisionModelUnits =>
        units.map(
            ({
                address,
                bath_rooms,
                bed_rooms,
                email,
                facilities,
                latitude,
                longitude,
                mobile_number,
                month,
                ratings,
                remark,
                rental,
                unit_id,
                visit_count,
                year,
            }) => ({
                id: unit_id,
                contact: parseContact({
                    mobileNumber: mobile_number,
                    email,
                }),
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
                ratings: parseRating(ratings),
                visitCount: parseVisitCount(visit_count),
            })
        );

    const parseAsUnitMinMaxRental = async () => {
        const rentals = await selectMinMaxRental.run(
            undefined as void,
            postgreSQL.instance.pool
        );
        if (rentals.length !== 1) {
            throw new Error(
                `Expect rental to have 1 element, got ${rentals.length} instead`
            );
        }
        const [rental] = rentals;
        if (!rental) {
            throw new Error('rental cannot be undefined');
        }
        return parseAsMinMaxRental(rental);
    };

    return {
        all: async (
            params: Readonly<IQueryToUpdateScoreOfAllUnitParams>,
            pool: Pool
        ) => {
            const units = multiAttributeDecisionModelUnit(
                transformGeneralQuery(
                    await queryToUpdateScoreOfAllUnit.run(params, pool)
                ),
                await parseAsUnitMinMaxRental()
            );
            const res = await Promise.all(
                units.map(
                    async ({ id, score }) =>
                        await unit.updateScore(
                            {
                                id,
                                score,
                            },
                            postgreSQL.instance.pool
                        )
                )
            );
            if (res.length !== units.length) {
                throw new Error(
                    `Some update score failed, number of elements in res: ${res.length} and number of elements in rooms: ${units.length}`
                );
            }
        },
        one: async (
            params: Readonly<IQueryToUpdateScoreOfOneUnitParams>,
            pool: Pool
        ) => {
            const units = transformGeneralQuery(
                await queryToUpdateScoreOfOneUnit.run(params, pool)
            );
            if (units.length !== 1) {
                throw new Error(
                    `Expect units to have 1 element, got ${units.length} instead`
                );
            }
            const [unitQueried] = units;
            if (!unitQueried) {
                throw new Error('unit cannot be undefined');
            }
            const rentals = await selectMinMaxRental.run(
                undefined as void,
                pool
            );
            if (rentals.length !== 1) {
                throw new Error(
                    `Expect rental to have 1 element, got ${rentals.length} instead`
                );
            }
            const [rental] = rentals;
            if (!rental) {
                throw new Error('rental cannot be undefined');
            }
            const score = computeUnitScore(unitQueried, {
                minRentalPerPax: parseInt(rental.min ?? ''),
                maxRentalPerPax: parseInt(rental.max ?? ''),
            });
            await unit.updateScore(
                {
                    id: unitQueried.id,
                    score,
                },
                postgreSQL.instance.pool
            );
        },
    };
})();

export default updateUnitScore;