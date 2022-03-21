import { computeRemarkScore } from '../../../../src/api/madm';

const testComputeRemarkScore = () =>
    describe('Remark Computation for Multi-Attribute Decision Model', () => {
        describe('Non-Empty/Blank Remark', () => {
            it('should give higher priority for remark less than 20 words', () => {
                const scoreOne = computeRemarkScore(
                    'Small room attached with toilet can fit 1 person.RM380 for whole room'
                );
                const scoreTwo = computeRemarkScore(
                    'Small room attached with toilet can fit 1 person.RM380 for whole room, Small room attached with toilet can fit 1 person.RM380 for whole room'
                );
                const scoreThree = computeRemarkScore(
                    'Small room attached with toilet can fit 1 person.RM380 for whole room, Small room attached with toilet can fit 1 person.RM380 for whole room, Small room attached with toilet can fit 1 person.RM380 for whole room'
                );
                expect(scoreOne > scoreTwo && scoreTwo > scoreThree).toBe(true);
            });
        });
        describe('Empty or Blank Address', () => {
            it('should give 0 when address is empty or blank', () => {
                expect(computeRemarkScore('')).toBe(0);
                expect(computeRemarkScore(' ')).toBe(0);
            });
        });
    });

export default testComputeRemarkScore;
