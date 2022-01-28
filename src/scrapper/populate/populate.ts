import { parseAsNumber, parseAsString } from 'parse-dont-validate';
import { parseAsReadonlyArray } from 'parse-dont-validate';
import PostgreSQL from '../../database/postgres';
import {
    Accommodations,
    Region,
    RoomProperties,
    RoomType,
} from '../scrapper/fetchParser';
import select from '../../database/query/select';
import insertInto from '../../database/mutation/insert';
import update from '../../database/mutation/update';
import { equal } from '../../database/common/whereClause';
import Puppeteer from '../scrapper/puppeteer';

const insertRoom = async ({
    capacity,
    rental,
    accommodationID,
    roomType,
    roomSize,
}: RoomProperties &
    Readonly<{
        accommodationID: number;
        roomType: RoomType;
        roomSize: 'Small' | 'Middle' | 'Master';
    }>) => {
    const roomID = parseAsNumber(
        (
            await PostgreSQL.getPoolInstance().insert(
                insertInto('room')
                    .values({
                        accommodation: accommodationID,
                        rental,
                        roomType,
                        roomSize,
                        available: true,
                    })
                    .returning(['id'])
                    .command()
            )
        )[0]?.id
    )
        .inRangeOf(0, Number.MAX_SAFE_INTEGER)
        .orElseThrowDefault('roomID');
    const capacities = await Promise.all(
        capacity.map(
            async (roomCapacity) =>
                await PostgreSQL.getPoolInstance().insert(
                    insertInto('room_capacity')
                        .values({
                            room: roomID,
                            capacity: roomCapacity,
                        })
                        .returning(['id'])
                        .command()
                )
        )
    );
    if (capacities.length !== capacity.length) {
        throw new Error(
            `Expect number of capacity inserted to be "${capacity.length}", received "${capacities.length}"`
        );
    }
};

const updateRoom = async ({
    capacity,
    rental,
    accommodationID,
    roomType,
    roomSize,
}: RoomProperties &
    Readonly<{
        accommodationID: number;
        roomType: RoomType;
        roomSize: 'Small' | 'Middle' | 'Master';
    }>) => {
    const roomID = parseAsNumber(
        (
            await PostgreSQL.getPoolInstance().update(
                update('room')
                    .set({
                        rental,
                        roomType,
                        available: true,
                    })
                    .where(equal('accommodation', accommodationID))
                    .and(equal('roomSize', roomSize))
                    .returning(['id'])
                    .toQuery()
            )
        )[0]?.id
    )
        .inRangeOf(0, Number.MAX_SAFE_INTEGER)
        .orElseThrowDefault('roomID');
    const capacities = await Promise.all(
        capacity.map(
            async (roomCapacity) =>
                await PostgreSQL.getPoolInstance().insert(
                    insertInto('room_capacity')
                        .values({
                            room: roomID,
                            capacity: roomCapacity,
                        })
                        .returning(['id'])
                        .command()
                )
        )
    );
    if (capacities.length !== capacity.length) {
        throw new Error(
            `Expect number of capacity inserted to be "${capacity.length}", received "${capacities.length}"`
        );
    }
};

const insertToDatabase = async (rooms: Accommodations, region: Region) => {
    const roomsResolved = await rooms.reduce(async (p, room) => {
        const num = await p;
        const {
            id,
            name,
            handlerType,
            contact: { email, mobileNumber },
            address,
            facilities,
            remarks: { remark, month, year },
            accommodationType,
        } = room;
        // handler
        const handlerID = mobileNumber
            ? Array.from(mobileNumber)
                  .map(({ contact }) => contact)
                  .sort((a, b) => a.localeCompare(b))
                  .join('')
            : Array.from(email ?? [])
                  .sort((a, b) => a.localeCompare(b))
                  .join('');

        if (!handlerID) {
            // skip due to lack of contact information
            return Promise.resolve(num + 1);
        }
        const queriedHandlerID = parseAsString(
            (
                await PostgreSQL.getPoolInstance().select(
                    select(['id'])
                        .from('handler')
                        .where(equal('id', handlerID))
                        .toQuery()
                )
            )[0]?.id
        ).orElseGetUndefined();

        const finalizedHandlerID = queriedHandlerID ?? handlerID;
        if (queriedHandlerID) {
            await PostgreSQL.getPoolInstance().update(
                update('handler')
                    .set({
                        handlerType,
                        name,
                    })
                    .where(equal('id', finalizedHandlerID))
                    .toQuery()
            );
        } else {
            await PostgreSQL.getPoolInstance().insert(
                insertInto('handler')
                    .values({
                        id: finalizedHandlerID,
                        handlerType,
                        name,
                    })
                    .toQuery()
            );
        }
        //email
        if (email) {
            const emails = await Promise.all(
                email.map(
                    async (mail) =>
                        parseAsString(
                            (
                                await PostgreSQL.getPoolInstance().select(
                                    select(['id'])
                                        .from('email')
                                        .where(equal('id', mail))
                                        .toQuery()
                                )
                            )[0]?.id
                        ).orElseGetUndefined() ??
                        (await PostgreSQL.getPoolInstance().insert(
                            insertInto('email')
                                .values({
                                    id: mail,
                                    handler: finalizedHandlerID,
                                })
                                .toQuery()
                        ))
                )
            );
            if (emails.length !== email.length) {
                throw new Error(
                    `Expect number of emails inserted to be "${email.length}", received "${emails.length}"`
                );
            }
        }
        // mobileNumber
        if (mobileNumber) {
            const mobileNumbers = await Promise.all(
                mobileNumber.map(
                    async ({ mobileNumberType, contact }) =>
                        parseAsString(
                            (
                                await PostgreSQL.getPoolInstance().select(
                                    select(['id'])
                                        .from('mobile_number')
                                        .where(equal('id', contact))
                                        .toQuery()
                                )
                            )[0]?.id
                        ).orElseGetUndefined() ??
                        (await PostgreSQL.getPoolInstance().insert(
                            insertInto('mobile_number')
                                .values({
                                    id: contact,
                                    mobileNumberType,
                                    handler: finalizedHandlerID,
                                })
                                .toQuery()
                        ))
                )
            );
            if (mobileNumbers.length !== mobileNumber.length) {
                throw new Error(
                    `Expect number of mobile number inserted to be "${mobileNumber.length}", received "${mobileNumbers.length}"`
                );
            }
        }

        const queriedAccommodationID = parseAsNumber(
            (
                await PostgreSQL.getPoolInstance().select(
                    select(['id'])
                        .from('accommodation')
                        .where(equal('id', id))
                        .toQuery()
                )
            )[0]?.id
        ).orElseGetUndefined();
        // accommodation
        if (queriedAccommodationID) {
            const accommodationID = parseAsNumber(
                (
                    await PostgreSQL.getPoolInstance().update(
                        update('accommodation')
                            .set({
                                handler: finalizedHandlerID,
                                remark,
                                month,
                                year,
                                region,
                                facilities,
                                accommodationType: accommodationType.type,
                                available: true,
                            })
                            .where(equal('id', queriedAccommodationID))
                            .returning(['id'])
                            .toQuery()
                    )
                )[0]?.id
            )
                .inRangeOf(0, Number.MAX_SAFE_INTEGER)
                .orElseThrowDefault('accommodationID');
            if (accommodationType.type === 'Unit') {
                const { bedRooms, bathRooms, rental } = accommodationType.unit;
                await PostgreSQL.getPoolInstance().update(
                    update('unit')
                        .set({
                            accommodation: accommodationID,
                            rental,
                            bedRooms,
                            bathRooms,
                            unitType: accommodationType.unitType,
                            available: true,
                        })
                        .where(equal('accommodation', accommodationID))
                        .toQuery()
                );
            } else {
                // room
                const queriedRooms = parseAsReadonlyArray(
                    await PostgreSQL.getPoolInstance().select(
                        select(['id', 'roomSize'])
                            .from('room')
                            .where(equal('accommodation', accommodationID))
                            .toQuery()
                    ),
                    (val) =>
                        ({
                            id: parseAsNumber(val.id).orElseThrowDefault(
                                'room ID'
                            ),
                            roomSize: parseAsString(
                                val.roomSize
                            ).orElseThrowDefault('room size'),
                        } as const)
                ).orElseThrowDefault('queried room IDs and room size');
                const { small, middle, master } = accommodationType.rooms;
                const { roomType } = accommodationType;
                queriedRooms.forEach(async (queriedRoom) => {
                    const { roomSize } = queriedRoom;
                    switch (roomSize) {
                        case 'Small':
                            if (small) {
                                await updateRoom({
                                    ...small,
                                    accommodationID,
                                    roomSize,
                                    roomType,
                                });
                            }
                            break;
                        case 'Middle':
                            if (middle) {
                                await updateRoom({
                                    ...middle,
                                    accommodationID,
                                    roomSize,
                                    roomType,
                                });
                            }
                            break;
                        case 'Master':
                            if (master) {
                                await updateRoom({
                                    ...master,
                                    accommodationID,
                                    roomSize,
                                    roomType,
                                });
                            }
                            break;
                        default:
                            throw new Error(
                                `Expected roomSize to be Master, Middle or Small, got ${roomSize} instead`
                            );
                    }
                });
            }
        } else {
            const { latitude, longitude } = await (
                await Puppeteer.getInstance()
            ).getGeoCode(address);

            const accommodationID = parseAsNumber(
                (
                    await PostgreSQL.getPoolInstance().insert(
                        insertInto('accommodation')
                            .values({
                                id,
                                handler: finalizedHandlerID,
                                address,
                                latitude,
                                longitude,
                                remark,
                                month,
                                year,
                                region,
                                facilities,
                                accommodationType: accommodationType.type,
                                available: true,
                            })
                            .returning(['id'])
                            .command()
                    )
                )[0]?.id
            )
                .inRangeOf(0, Number.MAX_SAFE_INTEGER)
                .orElseThrowDefault('accommodationID');
            if (accommodationType.type === 'Unit') {
                const { bedRooms, bathRooms, rental } = accommodationType.unit;
                await PostgreSQL.getPoolInstance().insert(
                    insertInto('unit')
                        .values({
                            accommodation: accommodationID,
                            rental,
                            bedRooms,
                            bathRooms,
                            unitType: accommodationType.unitType,
                            available: true,
                        })
                        .toQuery()
                );
            } else {
                // room
                const { small, middle, master } = accommodationType.rooms;
                const { roomType } = accommodationType;
                if (small) {
                    await insertRoom({
                        ...small,
                        accommodationID,
                        roomSize: 'Small',
                        roomType,
                    });
                }
                if (middle) {
                    await insertRoom({
                        ...middle,
                        accommodationID,
                        roomSize: 'Middle',
                        roomType,
                    });
                }
                if (master) {
                    await insertRoom({
                        ...master,
                        accommodationID,
                        roomSize: 'Master',
                        roomType,
                    });
                }
            }
        }
        return await Promise.resolve(num + 1);
    }, Promise.resolve(0));
    if (roomsResolved !== rooms.length) {
        throw new Error(`Some database insertion failed for region ${region}`);
    }
};

export default insertToDatabase;
