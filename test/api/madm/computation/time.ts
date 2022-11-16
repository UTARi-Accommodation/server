import { computeTimeScore } from '../../../../src/api/madm';
import { describe, it, expect } from 'vitest';

const testComputeTimeScore = () =>
    describe('Time Computation for Multi-Attribute Decision Model', () => {
        it('should give higher priority for time closer to current date', () => {
            const scoreOne = computeTimeScore({
                year: 2022,
                month: 'January',
            });
            const scoreTwo = computeTimeScore({
                year: 2021,
                month: 'December',
            });
            const scoreThree = computeTimeScore({
                year: 2021,
                month: 'November',
            });
            expect(scoreOne > scoreTwo && scoreTwo > scoreThree).toBe(true);
        });
    });

export default testComputeTimeScore;
