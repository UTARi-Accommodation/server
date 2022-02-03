import insert from '../../database/mutation/insert';
import PostgreSQL from '../../database/postgres';
import MutationAccommodation from './type';

type Rating = Readonly<{
    timeCreated: Date;
    rating: number;
    fingerPrint: string;
}>;

const createRating = async ({
    timeCreated,
    rating,
    fingerPrint,
    accommodation: { key, id },
}: Rating & MutationAccommodation) => {
    const rows = await PostgreSQL.getPoolInstance().insert(
        insert(`${key}_rating`)
            .values({
                [key]: id,
                fingerPrint,
                rating,
                timeCreated: timeCreated.toISOString(),
            })
            .returning([key, 'fingerPrint'])
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
    if (row[key] === id && row.fingerPrint === fingerPrint) {
        return;
    }
    throw new Error(
        `Rows returned should contain only 1 element, instead got ${rows.length} elements`
    );
};

const createRoomRating = async ({
    timeCreated,
    rating,
    room,
    fingerPrint,
}: Rating &
    Readonly<{
        room: number;
    }>) =>
    createRating({
        timeCreated,
        rating,
        fingerPrint,
        accommodation: {
            key: 'room',
            id: room,
        },
    });

const createUnitRating = async ({
    timeCreated,
    rating,
    unit,
    fingerPrint,
}: Rating &
    Readonly<{
        unit: number;
    }>) =>
    createRating({
        timeCreated,
        rating,
        fingerPrint,
        accommodation: {
            key: 'unit',
            id: unit,
        },
    });

export { createRoomRating, createUnitRating };
