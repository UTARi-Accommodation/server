import { QueriedUnit } from 'utari-common';
import {
    getMinMax,
    multiAttributeDecisionModelUnit,
} from '../../../../src/api/madm';
import { unitOne, unitTwo } from '../../../dummy/api/madm/unit.json';

const getMinMaxRental = (unit: ReadonlyArray<QueriedUnit>) =>
    getMinMax(
        unit.map(
            ({ properties: { rental, bedRooms } }) => rental / (bedRooms ?? 1)
        )
    );

const testMultiAttributeDecisionModelUnit = () => {
    describe('Multi-Attribute Decision Model', () => {
        const { min: minRentalPerPax, max: maxRentalPerPax } =
            getMinMaxRental(unitOne);
        it('should sort according to MADM', () => {
            const scores = multiAttributeDecisionModelUnit(unitOne, {
                minRentalPerPax,
                maxRentalPerPax,
            })
                .sort((a, b) => b.score - a.score)
                .map(({ score }) => score);

            expect(Math.trunc(scores[0])).toBe(65);
            expect(Math.trunc(scores[1])).toBe(64);
            expect(Math.trunc(scores[2])).toBe(62);
            expect(Math.trunc(scores[3])).toBe(46);
        });
    });

    describe('Multi-Attribute Decision Model', () => {
        it('should sort according to MADM', () => {
            const { min: minRentalPerPax, max: maxRentalPerPax } =
                getMinMaxRental(unitTwo);
            const scores = multiAttributeDecisionModelUnit(unitTwo, {
                minRentalPerPax,
                maxRentalPerPax,
            })
                .sort((a, b) => b.score - a.score)
                .map(({ score }) => score);

            expect(Math.trunc(scores[0])).toBe(76);
            expect(Math.trunc(scores[1])).toBe(57);
            expect(Math.trunc(scores[2])).toBe(43);
        });
    });
};

export default testMultiAttributeDecisionModelUnit;
