import insert from '../../database/mutation/insert';
import PostgreSQL from '../../database/postgres';

const createFingerPrint = async ({
    id,
    timeCreated,
}: Readonly<{
    id: string;
    timeCreated: Date;
}>) => {
    const rows = await PostgreSQL.getPoolInstance().insert(
        insert('finger_print')
            .values({
                id,
                timeCreated: timeCreated.toISOString(),
            })
            .returning(['id'])
            .toQuery()
    );
    const [row] = rows;
    if (rows.length !== 1) {
        throw new Error(
            `Rows returned should contain only 1 element, instead got ${rows.length} elements`
        );
    }
    if (row === undefined) {
        throw new Error(`Row is undefined`);
    }
    if (row.id === id) {
        return;
    }
    throw new Error(
        `Rows returned should contain only 1 element, instead got ${rows.length} elements`
    );
};

export default createFingerPrint;
