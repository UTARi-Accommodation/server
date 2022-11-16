import { computeContactScore } from '../../../../src/api/madm';
import { describe, it, expect } from 'vitest';

const testComputeContactScore = () =>
    describe('Contact Computation for Multi-Attribute Decision Model', () => {
        describe('Non-Empty Contact', () => {
            it('should give higher priority for complete contact information, follow by mobile number only and lastly email only', () => {
                const scoreOne = computeContactScore({
                    email: ['wendy@gmail.com'],
                    mobileNumber: ['0177878978'],
                });
                const scoreTwo = computeContactScore({
                    email: [],
                    mobileNumber: ['0177878978'],
                });
                const scoreThree = computeContactScore({
                    email: ['wendy@gmail.com'],
                    mobileNumber: [],
                });
                const scoreFour = computeContactScore({
                    email: [],
                    mobileNumber: [],
                });
                expect(
                    scoreOne > scoreTwo &&
                        scoreTwo > scoreThree &&
                        scoreThree > scoreFour
                ).toBe(true);
            });
        });
        describe('Empty Contact', () => {
            it('should give 0 when contact is an empty array', () =>
                expect(
                    computeContactScore({
                        mobileNumber: [],
                        email: [],
                    })
                ).toBe(0));
        });
    });

export default testComputeContactScore;
