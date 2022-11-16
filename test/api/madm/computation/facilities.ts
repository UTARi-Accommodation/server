import { computeFacilitiesScore } from '../../../../src/api/madm';
import { describe, it, expect } from 'vitest';

const testComputeFacilitiesScore = () =>
    describe('Facilities Computation for Multi-Attribute Decision Model', () => {
        describe('Non-Empty/Blank Facilities', () => {
            it('should give higher priority for facilities less than 20 words', () => {
                const scoreOne = computeFacilitiesScore(
                    'Bed, Table/Chair, Cupboard, Fan, Air-Conditioner, Parking Bay, Internet, Washing Machine, Water Heater'
                );
                const scoreTwo = computeFacilitiesScore(
                    'Bed, Table/Chair, Cupboard, Fan, Air-Conditioner, Parking Bay, Internet, Washing Machine, Water Heater, Bed, Table/Chair, Cupboard, Fan, Air-Conditioner, Parking Bay, Internet, Washing Machine, Water Heater'
                );
                const scoreThree = computeFacilitiesScore(
                    'Bed, Table/Chair, Cupboard, Fan, Air-Conditioner, Parking Bay, Internet, Washing Machine, Water Heater, Bed, Table/Chair, Cupboard, Fan, Air-Conditioner, Parking Bay, Internet, Washing Machine, Water Heater, Bed, Table/Chair, Cupboard, Fan, Air-Conditioner, Parking Bay, Internet, Washing Machine, Water Heater'
                );
                expect(scoreOne > scoreTwo && scoreTwo > scoreThree).toBe(true);
            });
        });
        describe('Empty/Blank Facilities', () => {
            it('should give 0 when facilities is empty or blank', () => {
                expect(computeFacilitiesScore('')).toBe(0);
                expect(computeFacilitiesScore(' ')).toBe(0);
            });
        });
    });

export default testComputeFacilitiesScore;
