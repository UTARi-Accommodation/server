import { multiAttributeDecisionModelUnit } from '../../../../src/api/madm/madm';
import unitOne from '../../../dummy/madm/unitOne.json';
import unitTwo from '../../../dummy/madm/unitTwo.json';
import { QueriedUnit } from '../../../../src/scrapper/scrapper/fetchParser';

describe('Multi-Attribute Decision Model', () => {
    it('should sort according to MADM', () =>
        expect(
            multiAttributeDecisionModelUnit(
                unitOne.before as ReadonlyArray<QueriedUnit>
            )
        ).toStrictEqual(unitOne.after));
});

describe('Multi-Attribute Decision Model', () => {
    it('should sort according to MADM', () =>
        expect(
            multiAttributeDecisionModelUnit(
                unitTwo.before as ReadonlyArray<QueriedUnit>
            )
        ).toStrictEqual(unitTwo.after));
});
