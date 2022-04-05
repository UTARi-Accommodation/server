import { computeRatingScore } from '../../../../src/api/madm';

const testComputeRatingScore = () =>
    describe('Rating Computation for Multi-Attribute Decision Model', () => {
        describe('Same Number of Rating', () => {
            it('should give higher priority for higher rating with same quantity', () => {
                const scoreOne = computeRatingScore([4, 5, 3, 2]);
                const scoreTwo = computeRatingScore([4, 2, 2, 2]);
                const scoreThree = computeRatingScore([4, 1, 1, 1]);
                expect(scoreOne > scoreTwo && scoreTwo > scoreThree).toBe(true);
            });
        });
        describe('Different Number of Rating', () => {
            it('should give higher priority for similar rating with higher quantity', () => {
                const scoreOne = computeRatingScore([4, 5, 3, 2, 5, 4, 3]);
                const scoreTwo = computeRatingScore([4, 5, 3, 2, 5, 4]);
                const scoreThree = computeRatingScore([4, 5, 3, 2, 5]);
                expect(scoreOne > scoreTwo && scoreTwo > scoreThree).toBe(true);
            });
        });
        describe('No Rating', () => {
            it('should give 0 when there is no rating', () =>
                expect(computeRatingScore([])).toBe(0));
        });
        describe('0 Rating', () => {
            it('should give 0 when rating is 0', () => {
                expect(computeRatingScore([0])).toBe(0);
                expect(computeRatingScore([0, 0, 0])).toBe(0);
            });
        });
        describe('Sigmoid function', () => {
            it('should reduce the significance of visit count as visit count increases, especially when visit count >= 160', () => {
                const oneHundredFifty = computeRatingScore(
                    Array.from({ length: 150 }, () => 1)
                );
                const oneHundredSixty = computeRatingScore(
                    Array.from({ length: 160 }, () => 1)
                );
                expect(
                    oneHundredFifty -
                        computeRatingScore(Array.from({ length: 140 }, () => 1))
                ).toBe(0.000015599341456729032);
                expect(oneHundredSixty - oneHundredFifty).toBe(
                    0.000009079573740522484
                );
                expect(
                    computeRatingScore(Array.from({ length: 170 }, () => 1)) -
                        oneHundredSixty
                ).toBe(0);
            });
        });
    });

export default testComputeRatingScore;
