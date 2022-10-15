import { QueriedUnit } from 'utari-common';
import {
    getMinMax,
    multiAttributeDecisionModelUnit,
} from '../../../../src/api/madm';
import { unitOne, unitTwo } from '../../../dummy/api/madm/unit.json';
import nonNullableNumber from './util';

const getMinMaxRental = (unit: ReadonlyArray<QueriedUnit>) =>
    getMinMax(
        unit.map(
            ({ properties: { rental, bedRooms } }) => rental / (bedRooms ?? 1)
        )
    );

const testMultiAttributeDecisionModelUnit = () => {
    describe('Multi-Attribute Decision Model', () => {
        const unit = unitOne as ReadonlyArray<QueriedUnit>;
        const { min: minRentalPerPax, max: maxRentalPerPax } =
            getMinMaxRental(unit);
        it('should sort a given unit-based accommodations according to MADM', () => {
            const scores = Array.from(
                multiAttributeDecisionModelUnit(unit, {
                    minRentalPerPax,
                    maxRentalPerPax,
                })
            )
                .sort((a, b) => b.score - a.score)
                .map(({ score }) => score);

            expect(Math.trunc(nonNullableNumber(scores[0]))).toBe(65);
            expect(Math.trunc(nonNullableNumber(scores[1]))).toBe(64);
            expect(Math.trunc(nonNullableNumber(scores[2]))).toBe(62);
            expect(Math.trunc(nonNullableNumber(scores[3]))).toBe(46);
        });
    });

    describe('Multi-Attribute Decision Model', () => {
        it('should sort another given unit-based accommodations according to MADM', () => {
            const unit = unitTwo as ReadonlyArray<QueriedUnit>;
            const { min: minRentalPerPax, max: maxRentalPerPax } =
                getMinMaxRental(unit);
            const scores = Array.from(
                multiAttributeDecisionModelUnit(unit, {
                    minRentalPerPax,
                    maxRentalPerPax,
                })
            )
                .sort((a, b) => b.score - a.score)
                .map(({ score }) => score);

            expect(Math.trunc(nonNullableNumber(scores[0]))).toBe(75);
            expect(Math.trunc(nonNullableNumber(scores[1]))).toBe(56);
            expect(Math.trunc(nonNullableNumber(scores[2]))).toBe(43);
        });
    });
};

export default testMultiAttributeDecisionModelUnit;
