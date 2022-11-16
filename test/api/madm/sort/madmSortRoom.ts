import { QueriedRoom } from 'utari-common';
import {
    getMinMax,
    multiAttributeDecisionModelRoom,
} from '../../../../src/api/madm';
import { roomOne, roomTwo } from '../../../dummy/api/madm/room.json';
import nonNullableNumber from './util';
import { describe, it, expect } from 'vitest';

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
        it('should sort a given room-based accommodations according to MADM', () => {
            const room = roomOne as ReadonlyArray<QueriedRoom>;
            const { min: minRentalPerPax, max: maxRentalPerPax } =
                getMinMaxRental(room);

            const scores = Array.from(
                multiAttributeDecisionModelRoom(room, {
                    minRentalPerPax,
                    maxRentalPerPax,
                })
            )
                .sort((a, b) => b.score - a.score)
                .map(({ score }) => score);

            expect(
                Math.ceil(nonNullableNumber(scores[0]))
            ).toBeGreaterThanOrEqual(73);
            expect(
                Math.ceil(nonNullableNumber(scores[1]))
            ).toBeGreaterThanOrEqual(58);
            expect(
                Math.ceil(nonNullableNumber(scores[2]))
            ).toBeGreaterThanOrEqual(52);
            expect(
                Math.ceil(nonNullableNumber(scores[3]))
            ).toBeGreaterThanOrEqual(39);
            expect(
                Math.ceil(nonNullableNumber(scores[4]))
            ).toBeGreaterThanOrEqual(26);
            expect(
                Math.ceil(nonNullableNumber(scores[5]))
            ).toBeGreaterThanOrEqual(16);
        });
    });

    describe('Multi-Attribute Decision Model', () => {
        it('should sort another given room-based accommodations according to MADM', () => {
            const room = roomTwo as ReadonlyArray<QueriedRoom>;
            const { min: minRentalPerPax, max: maxRentalPerPax } =
                getMinMaxRental(room);

            const scores = Array.from(
                multiAttributeDecisionModelRoom(room, {
                    minRentalPerPax,
                    maxRentalPerPax,
                })
            )
                .sort((a, b) => b.score - a.score)
                .map(({ score }) => score);

            expect(
                Math.ceil(nonNullableNumber(scores[0]))
            ).toBeGreaterThanOrEqual(62);
            expect(
                Math.ceil(nonNullableNumber(scores[1]))
            ).toBeGreaterThanOrEqual(57);
            expect(
                Math.ceil(nonNullableNumber(scores[2]))
            ).toBeGreaterThanOrEqual(52);
            expect(
                Math.ceil(nonNullableNumber(scores[3]))
            ).toBeGreaterThanOrEqual(45);
        });
    });
};

export default testMultiAttributeDecisionModelRoom;
