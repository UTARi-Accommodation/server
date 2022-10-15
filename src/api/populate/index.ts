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
    RoomSize,
    RoomType,
    Unit,
    UnitType,
} from 'utari-common';
import room from '../../database/table/room';
import roomCapacities from '../../database/table/roomCapacity';
import handler from '../../database/table/handler';
import email from '../../database/table/email';
import mobileNumber from '../../database/table/mobileNumber';
import accommodation from '../../database/table/accommodation';
import unit from '../../database/table/unit';
import updateUnitScore from '../../database/action/updateScore/unit';
import updateRoomScore from '../../database/action/updateScore/room';
import { parseAsStringEnv } from 'esbuild-env-parsing';

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
        roomSize: RoomSize;
    }>) => {
    const roomId = await room.upsert(
        {
            accommodation,
            rental,
            roomType,
            roomSize,
            score: -1,
        },
        postgreSQL.instance.pool
    );
    const capacitiesLength = (
        await Promise.all(
            capacities.map(
                async (capacity) =>
                    await roomCapacities.insert(
                        {
                            room: roomId,
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
    const queriedId = await accommodation.select(
        {
            id: params.id,
        },
        postgreSQL.instance.pool
    );
    if (queriedId === params.id) {
        await accommodation.update(params, postgreSQL.instance.pool);
    } else {
        const geocodeResponse = await (
            await geocode
        ).getGeoCode(params.address);
        switch (geocodeResponse.type) {
            case 'valid': {
                await accommodation.insert(
                    {
                        ...params,
                        ...geocodeResponse.geocode,
                    },
                    postgreSQL.instance.pool
                );
            }
        }
    }
};

const upsertUnit = async (
    params: Unit &
        Readonly<{
            accommodation: number;
            unitType: UnitType;
        }>
) => await unit.upsert({ ...params, score: -1 }, postgreSQL.instance.pool);

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

const upsertInfo = async (accommodations: Accommodations, region: Region) => {
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
                if (
                    parseAsStringEnv({
                        env: process.env.NODE_ENV,
                        name: 'node env',
                    }) === 'test'
                ) {
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
        throw new Error(`Some database upsertion failed for region ${region}`);
    }
};

const updateScores = async (accommodations: Accommodations) => {
    if (
        accommodations.filter(({ accommodation: { type } }) => type === 'Unit')
            .length
    ) {
        await updateUnitScore.all(undefined, postgreSQL.instance.pool);
    }
    if (
        accommodations.filter(({ accommodation: { type } }) => type === 'Room')
            .length
    ) {
        await updateRoomScore.all(undefined, postgreSQL.instance.pool);
    }
};

const upsertToDatabase = async (
    accommodations: Accommodations,
    region: Region
) => {
    await upsertInfo(accommodations, region);
    await updateScores(accommodations);
};

export default upsertToDatabase;
