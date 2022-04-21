import { computeVisitCountScore } from '../../../../src/api/madm';

const testComputeVisitCountScore = () =>
    describe('Visit Count Computation for Multi-Attribute Decision Model', () => {
        describe('Different Visit Count', () => {
            it('should give higher priority for higher visit count', () => {
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
        describe('Sigmoid function', () => {
            it('should reduce the significance of visit count as visit count increases, especially when visit count >= 160', () => {
                const oneHundredFifty = computeVisitCountScore(150);
                const oneHundredSixty = computeVisitCountScore(160);
                expect(oneHundredFifty - computeVisitCountScore(140)).toBe(
                    0.018445664385142946
                );
                expect(oneHundredSixty - oneHundredFifty).toBe(
                    0.011533626058314428
                );
                expect(computeVisitCountScore(170) - oneHundredSixty).toBe(
                    0.00885139947685265
                );
            });
        });
    });

export default testComputeVisitCountScore;
