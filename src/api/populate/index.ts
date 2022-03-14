import postgreSQL from '../../database/postgres';
import geocode from '../../scrapper/geocode';
import {
    Accommodations,
    AccommodationType,
    Contact,
    HandlerType,
    Month,
    Region,
    Room,
    RoomProperties,
    RoomType,
    Unit,
    UnitType,
} from 'utari-common';
import room from '../../database/table/room/index';
import roomCapacities from '../../database/table/roomCapacity/index';
import handler from '../../database/table/handler/index';
import email from '../../database/table/email/index';
import mobileNumber from '../../database/table/mobileNumber/index';
import accommodation from '../../database/table/accommodation/index';
import unit from '../../database/table/unit/index';

const upsertRoom = async ({
    capacities,
    rental,
    accommodation,
    roomType,
    roomSize,
}: RoomProperties &
    Readonly<{
        accommodation: number;
        roomType: RoomType;
        roomSize: 'Small' | 'Middle' | 'Master';
    }>) => {
    const roomID = await room.upsert(
        {
            accommodation,
            rental,
            roomType,
            roomSize,
        },
        postgreSQL.instance.pool
    );
    const capacitiesLength = (
        await Promise.all(
            capacities.map(
                async (capacity) =>
                    await roomCapacities.insert(
                        {
                            room: roomID,
                            capacities: capacity,
                        },
                        postgreSQL.instance.pool
                    )
            )
        )
    ).length;
    if (capacities.length !== capacitiesLength) {
        throw new Error(
            `Expect number of capacity inserted to be "${capacitiesLength}", received "${capacities.length}"`
        );
    }
};

const upsertHandler = async (
    params: Readonly<{
        name: string;
        id: string;
        handlerType: HandlerType;
    }>
) => await handler.upsert(params, postgreSQL.instance.pool);

const insertEmail = async (emails: Contact['email'], handler: string) => {
    if (emails) {
        const length = (
            await Promise.all(
                emails.map(
                    async (mail) =>
                        await email.insert(
                            {
                                email: mail,
                                handler,
                            },
                            postgreSQL.instance.pool
                        )
                )
            )
        ).length;
        if (length !== emails.length) {
            throw new Error(
                `Expect number of emails inserted to be "${emails.length}", received "${length}"`
            );
        }
    }
};

const insertMobileNumbers = async (
    mobileNumbers: Contact['mobileNumber'],
    handler: string
) => {
    if (mobileNumbers) {
        const length = (
            await Promise.all(
                mobileNumbers.map(
                    async (contact) =>
                        await mobileNumber.insert(
                            {
                                mobileNumber: contact,
                                handler,
                            },
                            postgreSQL.instance.pool
                        )
                )
            )
        ).length;
        if (length !== mobileNumbers.length) {
            throw new Error(
                `Expect number of mobile number inserted to be "${mobileNumbers.length}", received "${length}"`
            );
        }
    }
};

const upsertAccommodation = async (
    params: Readonly<{
        id: number;
        handler: string;
        address: string;
        remark: string;
        month: Month;
        year: number;
        region: Region;
        facilities: string;
        accommodationType: AccommodationType;
    }>
) => {
    if (
        params.id !==
        (await accommodation.upsert(
            {
                ...params,
                ...(await (await geocode).getGeoCode(params.address)),
            },
            postgreSQL.instance.pool
        ))
    ) {
        throw new Error(`accommodationId udpate does not match ${params.id}`);
    }
};

const upsertUnit = async (
    params: Unit &
        Readonly<{
            accommodation: number;
            unitType: UnitType;
        }>
) => await unit.upsert(params, postgreSQL.instance.pool);

const upsertRooms = async (
    params: Room &
        Readonly<{
            accommodation: number;
            roomType: RoomType;
        }>
) => {
    const { small, middle, master, accommodation, roomType } = params;
    if (small) {
        await upsertRoom({
            ...small,
            accommodation,
            roomSize: 'Small',
            roomType,
        });
    }
    if (middle) {
        await upsertRoom({
            ...middle,
            accommodation,
            roomSize: 'Middle',
            roomType,
        });
    }
    if (master) {
        await upsertRoom({
            ...master,
            accommodation,
            roomSize: 'Master',
            roomType,
        });
    }
};

const upsertToDatabase = async (
    accommodations: Accommodations,
    region: Region
) => {
    const accommodationsResolved = await accommodations.reduce(
        async (p, accom) => {
            const num = await p;
            const {
                id: accommodationId,
                name,
                handlerType,
                contact: { email: emails, mobileNumber: mobileNumbers },
                address,
                facilities,
                remarks: { remark, month, year },
                accommodation,
            } = accom;

            const handlerId = mobileNumbers
                ? Array.from(mobileNumbers)
                      .sort((a, b) => a.localeCompare(b))
                      .join('')
                : Array.from(emails ?? [])
                      .sort((a, b) => a.localeCompare(b))
                      .join('');

            if (
                !(mobileNumbers
                    ? Array.from(mobileNumbers)
                          .sort((a, b) => a.localeCompare(b))
                          .join('')
                    : Array.from(emails ?? [])
                          .sort((a, b) => a.localeCompare(b))
                          .join(''))
            ) {
                if (process.env.NODE_ENV === 'test') {
                    return await Promise.resolve(num + 1);
                }
                throw new Error(
                    'Scrapper should already resolve empty contact'
                );
            }

            await upsertHandler({
                handlerType,
                name,
                id: handlerId,
            });

            await insertEmail(emails, handlerId);

            await insertMobileNumbers(mobileNumbers, handlerId);

            await upsertAccommodation({
                id: accommodationId,
                handler: handlerId,
                address,
                remark,
                month,
                year,
                region,
                facilities,
                accommodationType: accommodation.type,
            });

            if (accommodation.type === 'Unit') {
                await upsertUnit({
                    ...accommodation.unit,
                    accommodation: accommodationId,
                    unitType: accommodation.unitType,
                });
            } else {
                await upsertRooms({
                    ...accommodation.rooms,
                    accommodation: accommodationId,
                    roomType: accommodation.roomType,
                });
            }
            return await Promise.resolve(num + 1);
        },
        Promise.resolve(0)
    );
    if (accommodationsResolved !== accommodations.length) {
        throw new Error(`Some database insertion failed for region ${region}`);
    }
};

export default upsertToDatabase;
