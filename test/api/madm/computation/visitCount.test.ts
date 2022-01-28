import { computeVisitCountScore } from '../../../../src/api/madm/madm';

describe('Visit Count Computation for Multi-Attribute Decision Model', () => {
    describe('Different Visit Count', () => {
        it('should give higher priority for same rating with lower visit count', () => {
            const scoreOne = computeVisitCountScore(5);
            const scoreTwo = computeVisitCountScore(7);
            const scoreThree = computeVisitCountScore(10);
            expect(scoreThree > scoreTwo && scoreTwo > scoreOne).toBe(true);
        });
    });
    describe('No Visit', () => {
        it('should give 0 when visit count', () =>
            expect(computeVisitCountScore(0)).toBe(0));
    });
});
