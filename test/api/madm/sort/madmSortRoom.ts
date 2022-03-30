import { QueriedRoom } from 'utari-common';
import {
    getMinMax,
    multiAttributeDecisionModelRoom,
} from '../../../../src/api/madm';
import { roomOne, roomTwo } from '../../../dummy/api/madm/room.json';

const getMinMaxRental = (room: ReadonlyArray<QueriedRoom>) =>
    getMinMax(
        room.map(({ properties: { rental, capacities } }) => {
            const x =
                rental /
                (!capacities.length
                    ? 1
                    : capacities.reduce((prev, curr) => prev + curr) /
                      capacities.length);
            if (Number.isNaN(x)) {
                console.log({ rental, capacities });
            }
            return x;
        })
    );

const testMultiAttributeDecisionModelRoom = () => {
    describe('Multi-Attribute Decision Model', () => {
        it('should sort according to MADM', () => {
            const { min: minRentalPerPax, max: maxRentalPerPax } =
                getMinMaxRental(roomOne);

            const scores = multiAttributeDecisionModelRoom(roomOne, {
                minRentalPerPax,
                maxRentalPerPax,
            })
                .sort((a, b) => b.score - a.score)
                .map(({ score }) => score);

            expect(Math.trunc(scores[0])).toBe(73);
            expect(Math.trunc(scores[1])).toBe(59);
            expect(Math.trunc(scores[2])).toBe(52);
            expect(Math.trunc(scores[3])).toBe(39);
            expect(Math.trunc(scores[4])).toBe(26);
            expect(Math.trunc(scores[5])).toBe(16);
        });
    });

    describe('Multi-Attribute Decision Model', () => {
        it('should sort according to MADM', () => {
            const { min: minRentalPerPax, max: maxRentalPerPax } =
                getMinMaxRental(roomTwo);

            const scores = multiAttributeDecisionModelRoom(roomTwo, {
                minRentalPerPax,
                maxRentalPerPax,
            })
                .sort((a, b) => b.score - a.score)
                .map(({ score }) => score);

            expect(Math.trunc(scores[0])).toBe(62);
            expect(Math.trunc(scores[1])).toBe(57);
            expect(Math.trunc(scores[2])).toBe(52);
            expect(Math.trunc(scores[3])).toBe(45);
        });
    });
};

export default testMultiAttributeDecisionModelRoom;
