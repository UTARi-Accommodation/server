import insert from '../../database/mutation/insert';
import PostgreSQL from '../../database/postgres';
import MutationAccommodation from './type';

type VisitCount = Readonly<{
    fingerPrint: string;
    timeCreated: Date;
}>;

const createVisitCount = async ({
    fingerPrint,
    timeCreated,
    accommodation: { key, id },
}: VisitCount & MutationAccommodation) => {
    const rows = await PostgreSQL.getPoolInstance().insert(
        insert(`${key}_visit`)
            .values({
                [key]: id,
                fingerPrint,
                timeCreated: timeCreated.toISOString(),
            })
            .returning(['fingerPrint', key])
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
    if (row.fingerPrint === fingerPrint && row[key] === id) {
        return;
    }
    throw new Error(
        `Rows returned should contain only 1 element, instead got ${rows.length} elements`
    );
};

const createRoomVisitCount = async ({
    fingerPrint,
    room,
    timeCreated,
}: VisitCount & Readonly<{ room: number }>) =>
    createVisitCount({
        fingerPrint,
        timeCreated,
        accommodation: {
            key: 'room',
            id: room,
        },
    });

const createUnitVisitCount = async ({
    fingerPrint,
    unit,
    timeCreated,
}: VisitCount & Readonly<{ unit: number }>) =>
    createVisitCount({
        fingerPrint,
        timeCreated,
        accommodation: {
            key: 'unit',
            id: unit,
        },
    });

export { createUnitVisitCount, createRoomVisitCount };
