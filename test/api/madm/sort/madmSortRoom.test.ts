import { multiAttributeDecisionModelRoom } from '../../../../src/api/madm/madm';
// import roomOne from '../../../dummy/madm/roomOne.json';
import roomTwo from '../../../dummy/madm/roomTwo.json';
import { QueriedRoom } from '../../../../src/scrapper/scrapper/fetchParser';

// describe('Multi-Attribute Decision Model', () => {
//     it('should sort according to MADM', () =>
//         expect(
//             multiAttributeDecisionModelRoom(
//                 roomOne.before as ReadonlyArray<QueriedRoom>
//             )
//         ).toStrictEqual(roomOne.after));
// });

describe('Multi-Attribute Decision Model', () => {
    it('should sort according to MADM', () =>
        expect(
            multiAttributeDecisionModelRoom(
                roomTwo.before as ReadonlyArray<QueriedRoom>
            )
        ).toStrictEqual(roomTwo.after));
});
