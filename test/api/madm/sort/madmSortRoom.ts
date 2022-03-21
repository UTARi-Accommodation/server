import { QueriedRoom } from 'utari-common';
import { multiAttributeDecisionModelRoom } from '../../../../src/api/madm';
import { roomOne, roomTwo } from '../../../dummy/api/madm/room.json';

const testMultiAttributeDecisionModelRoom = () => {
    describe('Multi-Attribute Decision Model', () => {
        it('should sort according to MADM', () =>
            expect(
                multiAttributeDecisionModelRoom(
                    roomOne.before as ReadonlyArray<QueriedRoom>
                )
            ).toStrictEqual(roomOne.after));
    });

    describe('Multi-Attribute Decision Model', () => {
        it('should sort according to MADM', () =>
            expect(
                multiAttributeDecisionModelRoom(
                    roomTwo.before as ReadonlyArray<QueriedRoom>
                )
            ).toStrictEqual(roomTwo.after));
    });
};

export default testMultiAttributeDecisionModelRoom;
