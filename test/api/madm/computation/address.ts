import { computeAddressScore } from '../../../../src/api/madm';
import { describe, it, expect } from 'vitest';

const testComputeAddressScore = () =>
    describe('Address Computation for Multi-Attribute Decision Model', () => {
        describe('Non Empty/Blank Address', () => {
            it('should give higher priority for address less than 20 words', () => {
                const scoreOne = computeAddressScore(
                    'A-5-12, Mahkota Garden Condo, Jln Mahkota Garden, Bandar Mahkota Cheras 43200, Cheras, Selangor'
                );
                const scoreTwo = computeAddressScore(
                    'A-5-12, Mahkota Garden Condo, Jln Mahkota Garden, Bandar Mahkota Cheras 43200, Cheras, Selangor, A-5-12, Mahkota Garden Condo, Jln Mahkota Garden, Bandar Mahkota Cheras 43200, Cheras, Selangor'
                );
                const scoreThree = computeAddressScore(
                    'A-5-12, Mahkota Garden Condo, Jln Mahkota Garden, Bandar Mahkota Cheras 43200, Cheras, Selangor, A-5-12, Mahkota Garden Condo, Jln Mahkota Garden, Bandar Mahkota Cheras 43200, Cheras, Selangor, A-5-12, Mahkota Garden Condo, Jln Mahkota Garden, Bandar Mahkota Cheras 43200, Cheras, Selangor'
                );
                expect(scoreOne > scoreTwo && scoreTwo > scoreThree).toBe(true);
            });
        });
        describe('Empty/Blank Address', () => {
            it('should give 0 when address is empty or blank', () => {
                expect(computeAddressScore('')).toBe(0);
                expect(computeAddressScore(' ')).toBe(0);
            });
        });
    });

export default testComputeAddressScore;
