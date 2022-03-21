import { QueriedUnit } from 'utari-common';
import { multiAttributeDecisionModelUnit } from '../../../../src/api/madm';
import { unitOne, unitTwo } from '../../../dummy/api/madm/unit.json';

const testMultiAttributeDecisionModelUnit = () => {
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
};

export default testMultiAttributeDecisionModelUnit;
