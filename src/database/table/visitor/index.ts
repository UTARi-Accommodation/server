import { Pool } from '../../postgres';
import { insert, IInsertParams, IInsertResult } from './insert.queries';

const visitor = {
    insert: async (
        params: Readonly<IInsertParams['params']>,
        pool: Pool
    ): Promise<
        Readonly<
            | {
                  type: 'created';
                  id: IInsertResult['id'];
              }
            | {
                  type: 'existed';
              }
        >
    > => {
        const visitors = await insert.run({ params }, pool);
        if (visitors.length > 1) {
            throw new Error(
                `Expect visitors to have O or 1 element, got ${visitors.length} instead`
            );
        }
        const [visitor] = visitors;
        return !visitor
            ? {
                  type: 'existed',
              }
            : {
                  id: visitor.id,
                  type: 'created',
              };
    },
};

export default visitor;
