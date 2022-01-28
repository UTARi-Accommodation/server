import { inRangeOf, isPositiveInt } from 'granula-string';
import fetch from 'node-fetch';
import { parse, HTMLElement } from 'node-html-parser';
import { parseAsNumber, parseAsString } from 'parse-dont-validate';

type Region = 'BTHO' | 'KP' | 'SL';

const fetchCampusHTMLText = async (region: Region) =>
    await (
        await fetch(`https://www2.utar.edu.my/accomList.jsp?fcode=${region}`)
    ).text();

type URLLists = ReadonlyArray<
    Readonly<{
        url: string;
        id: number;
    }>
>;

const urlLists = (html: string, regex: RegExp): URLLists =>
    (html.match(regex) ?? []).map((match) => {
        const url = match
            .replace("'", '')
            .replace('a href="', 'https://www2.utar.edu.my/')
            .replace('"', '');

        const [_, id] = url.match(/\d+/g) ?? [];

        return {
            url,
            id: parsePositiveInteger(id ?? ''),
        };
    });

const parsePositiveInteger = (input: string) => {
    if (/\d+/i.test(input)) {
        return parseInt(input, 10);
    }
    throw new TypeError(`Input of "${input}" is not of number`);
};

const removeSpaceFromString = (string: string) =>
    string
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .replace(/\u00a0/g, ' ');

type Contact = Readonly<{
    email: ReadonlyArray<string> | undefined;
    mobileNumber:
        | ReadonlyArray<
              Readonly<{
                  mobileNumberType: 'Mobile' | 'Line';
                  contact: string;
              }>
          >
        | undefined;
}>;

const getContact = (element: HTMLElement) =>
    element
        .getElementsByTagName('font')
        .reduce((prev, { nextSibling, text }) => {
            if (nextSibling) {
                const { text: contactInfo } = nextSibling;
                switch (text) {
                    case 'H/P No.:':
                        return {
                            ...prev,
                            mobileNumber: contactInfo.split('/').map((info) => {
                                const contact = removeSpaceFromString(
                                    info.replace(/\+6/g, '').replace(/\D+/g, '')
                                );
                                return {
                                    mobileNumberType:
                                        text === 'H/P No.:' &&
                                        ((contact.startsWith('01') &&
                                            inRangeOf(contact, {
                                                min: 10,
                                                max: 10,
                                            }) &&
                                            isPositiveInt(contact)) ||
                                            (contact.startsWith('011') &&
                                                inRangeOf(contact, {
                                                    min: 11,
                                                    max: 11,
                                                })))
                                            ? 'Mobile'
                                            : 'Line',
                                    contact,
                                } as const;
                            }),
                        };
                    case 'Email:':
                        return {
                            ...prev,
                            email: contactInfo.split('/').map((info) => {
                                const email = removeSpaceFromString(
                                    info
                                ).replace(',com', '.com');
                                if (
                                    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                                        email
                                    )
                                ) {
                                    return email;
                                }
                                throw new Error(
                                    `The email of ${email} is invalid. Original text is ${contactInfo}.`
                                );
                            }),
                        };
                }
            }
            return prev;
        }, {} as Contact);

const getName = (element: HTMLElement) =>
    element
        .getElementsByTagName('font')
        .reduce(
            (prev, { text }) =>
                text === 'Contact Name:'
                    ? prev
                    : `${prev}${removeSpaceFromString(text)}`,
            ''
        )
        .replace(/\W*$/gim, '')
        .trim();

type HandlerType = 'Owner' | 'Agent' | 'Tenant';

const getHandlerType = (element: HTMLElement) =>
    element
        .getElementsByTagName('font')
        .reduce((prev, { text }) => {
            if (text === 'Contact Identity:') {
                return prev;
            }
            const trimmedHandlerType = removeSpaceFromString(text);
            if (
                trimmedHandlerType !== 'Owner' &&
                trimmedHandlerType !== 'Agent' &&
                trimmedHandlerType !== 'Tenant'
            ) {
                if (trimmedHandlerType === 'Select') {
                    // that's one exception that I dont know how to handle, but assumption is made
                    return 'Owner';
                }
                throw new Error(
                    `trimmedIdentity is neither Owner nor Agent nor Tenant, or worse Select, instead it is "${trimmedHandlerType}"`
                );
            }
            return `${prev}${removeSpaceFromString(text)}`;
        }, '')
        .replace(/\W*$/gim, '')
        .trim() as HandlerType;

type Location = Readonly<{
    address: string;
    coordinate: Readonly<{
        latitude: number;
        longitude: number;
    }>;
}>;

const getAddress = (element: HTMLElement) =>
    element
        .getElementsByTagName('font')
        .reduce(
            (prev, { text }) =>
                text === 'Accommodation Address:'
                    ? prev
                    : removeSpaceFromString(text)
                          .replace(/\./g, '')
                          .split(',')
                          .reduce(
                              (prev, curr) =>
                                  prev
                                      ? `${prev}, ${curr.trim()}`
                                      : `${curr.trim()}`,
                              ''
                          ),
            ''
        )
        .replace(/\W*$/gim, '')
        .trim();

const getFacilities = (element: HTMLElement) =>
    element
        .getElementsByTagName('font')
        .reduce(
            (prev, { text }) =>
                text === 'Facilities:' || text === 'Others:'
                    ? prev
                    : prev
                    ? `${prev} · ${removeSpaceFromString(text)
                          .replace(';', '')
                          .replace('/', ' · ')
                          .trim()}`
                    : `${removeSpaceFromString(text)
                          .replace(';', '')
                          .replace('/', ' · ')
                          .trim()}`,
            ''
        )
        .replace(/\W*$/gim, '')
        .trim();

type Month =
    | 'January'
    | 'February'
    | 'March'
    | 'April'
    | 'May'
    | 'June'
    | 'July'
    | 'August'
    | 'September'
    | 'October'
    | 'November'
    | 'December';

const splitReduceRemarks = (remarks: string) =>
    remarks
        .split(',')
        .reduce(
            (prev, curr) =>
                prev ? `${prev}, ${curr.trim()}` : `${curr.trim()}`,
            ''
        )
        .replace(/\W*$/gim, '')
        .replace(/^\W*/gim, '')
        .trim();

const processMonth = (month: string) => {
    const changedMonth = month.charAt(0) + month.substring(1).toLowerCase();
    const foundMonth = (
        [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ] as ReadonlyArray<Month>
    ).find((m) => m.includes(changedMonth));
    if (!foundMonth) {
        throw new Error(`There is no match for month of "${month}"`);
    }
    return foundMonth;
};

const removeDateFromRemarks = (remark: string) =>
    remark
        ? splitReduceRemarks(
              `${remark.charAt(0).toUpperCase()}${remark.substring(1)}`
          )
        : '';

type Remarks = Readonly<{
    remark: string;
    month: Month;
    year: number;
}>;

const getRemarks = (element: HTMLElement) => {
    const remarks = element
        .getElementsByTagName('font')
        .reduce((prev, { text }) => {
            if (text === 'Remark:') {
                return prev;
            }
            const remark = removeSpaceFromString(text).replace(
                'Avalaible',
                'Available'
            );
            const regex = /Available From .* \d{4}/gm;
            const matches = regex.exec(remark);
            if (matches === null) {
                throw new Error(
                    `No available date match for remark of: "${remark}"`
                );
            }
            const [month, year] = parseAsString(matches[0])
                .orElseThrowDefault('match')
                .replace('Available From', '')
                .trim()
                .toUpperCase()
                .split(' ');

            return {
                remark: removeDateFromRemarks(remark.split(regex).join('')),
                month: processMonth(
                    parseAsString(month).orElseThrowDefault('month')
                ),
                year: parseAsNumber(
                    parsePositiveInteger(
                        parseAsString(year).orElseThrowDefault('year')
                    )
                )
                    .inRangeOf(2002, new Date().getFullYear())
                    .orElseThrowDefault('year'),
            };
        }, {} as Remarks);
    return remarks;
};

type RoomProperties = Readonly<{
    rental: number;
    capacity: ReadonlyArray<number>;
}>;

type Room = Readonly<{
    master: RoomProperties | undefined;
    middle: RoomProperties | undefined;
    small: RoomProperties | undefined;
}>;

const getRooms = (element: HTMLElement) =>
    element.getElementsByTagName('font').reduce((prev, font) => {
        const { text } = font;
        if (text === 'Accommodation Details:' || text === 'Room/Roomate') {
            return prev;
        }
        const roomInfo = text
            .trim()
            .split(/\u00a0/)
            .flatMap((room) => {
                return removeSpaceFromString(room)
                    .replace(/persons|person/gim, '')
                    .replace('RM', '')
                    .trim()
                    .split('/ ')
                    .flatMap((info) =>
                        info ? (info === '/' ? [] : [info]) : []
                    );
            });
        if (roomInfo.length !== 3) {
            throw new Error(
                `Room info of ${roomInfo} does not contain 3 elements: type, rental, capacities`
            );
        }
        const [roomType, rental, capacities] = roomInfo;
        const type = parseAsString(roomType)
            .orElseThrowDefault('roomType')
            .replace(' Bedroom', '')
            .toLowerCase();
        if (type === 'master' || type === 'middle' || type === 'small') {
            return {
                ...prev,
                [type]: {
                    rental: parseAsNumber(
                        parsePositiveInteger(
                            parseAsString(rental).orElseThrowDefault('rental')
                        )
                    )
                        .inRangeOf(0, Number.MAX_SAFE_INTEGER)
                        .orElseThrowDefault('rental'),
                    capacity: parseAsString(capacities)
                        .orElseThrowDefault('capacities')
                        .split('/')
                        .map((capacity) =>
                            parseAsNumber(parsePositiveInteger(capacity))
                                .inRangeOf(0, Number.MAX_SAFE_INTEGER)
                                .orElseThrowDefault('capacity')
                        ),
                },
            };
        }
        throw new Error(
            `RefinedType of room: ${type} is not master, middle or small`
        );
    }, {} as Room);

type Unit = Readonly<{
    bedRooms: number;
    bathRooms: number;
    rental: number;
}>;

const getUnits = (element: HTMLElement): Unit => {
    const unitInfo = element.getElementsByTagName('font').flatMap((font) => {
        const { text } = font;
        if (
            text === 'Accommodation Details:' ||
            text === 'Apartment/Condominium/House'
        ) {
            return [];
        }
        const unit = removeSpaceFromString(text)
            .replace(':', '')
            .replace('Price', '')
            .trim();

        return unit ? [unit] : [];
    });
    if (unitInfo.length === 6) {
        return {
            bedRooms: parseAsNumber(
                parsePositiveInteger(
                    parseAsString(unitInfo[1]).orElseThrowDefault(
                        'bedRoom or unitInfo[1]'
                    )
                )
            )
                .inRangeOf(1, Number.MAX_SAFE_INTEGER)
                .orElseThrowDefault('capacity'),
            bathRooms: parseAsNumber(
                parsePositiveInteger(
                    parseAsString(unitInfo[3]).orElseThrowDefault(
                        'bathRoom or unitInfo[3]'
                    )
                )
            )
                .inRangeOf(1, Number.MAX_SAFE_INTEGER)
                .orElseThrowDefault('capacity'),
            rental: parseAsNumber(
                parsePositiveInteger(
                    parseAsString(unitInfo[4]).orElseThrowDefault(
                        'wholeUnit or unitInfo[4]'
                    )
                )
            )
                .inRangeOf(1, Number.MAX_SAFE_INTEGER)
                .orElseThrowDefault('rental'),
        };
    }
    if (unitInfo.length === 4) {
        return {
            bedRooms: 0,
            bathRooms: 0,
            rental: parseAsNumber(
                parsePositiveInteger(
                    parseAsString(unitInfo[2]).orElseThrowDefault(
                        'Whole Unit or unitInfo[2]'
                    )
                )
            )
                .inRangeOf(1, Number.MAX_SAFE_INTEGER)
                .orElseThrowDefault('rental'),
        };
    }
    throw new Error(
        `Unit info of "${unitInfo}" does not contain 4-6 elements: Bathrooms, Bedrooms and Price`
    );
};

const parseAsHTMLElement = (elem: HTMLElement | undefined, index: number) => {
    if (!elem) {
        throw new Error(`html element is undefined at index: ${index}`);
    }
    return elem;
};

type RoomType = 'Room' | 'Roommate';
type UnitType = 'House' | 'ApartmentCondominium';

type Category = Readonly<
    | {
          type: 'Room';
          roomType: RoomType;
      }
    | {
          type: 'Unit';
          unitType: UnitType;
      }
>;

type Accommodations = ReadonlyArray<
    Readonly<{
        id: number;
        handlerType: HandlerType;
        name: string;
        contact: Contact;
        accommodationType: Readonly<
            | {
                  type: 'Room';
                  roomType: RoomType;
                  rooms: Room;
              }
            | {
                  type: 'Unit';
                  unitType: UnitType;
                  unit: Unit;
              }
        >;
        address: string;
        facilities: string;
        remarks: Remarks;
    }>
>;

type QueriedAccommodation = Readonly<{
    id: number;
    handler: Readonly<{
        name: string;
        handlerType: HandlerType;
    }>;
    contact: Contact;
    location: Location;
    facilities: string;
    remarks: Remarks;
    rating: ReadonlyArray<number>;
    visitCount: number;
}>;

type QueriedUnit = QueriedAccommodation &
    Readonly<{
        properties: Unit;
    }>;

type RoomSize = 'Master' | 'Middle' | 'Small';

type QueriedRoom = QueriedAccommodation &
    Readonly<{
        properties: RoomProperties &
            Readonly<{
                size: RoomSize;
            }>;
    }>;

type AccommodationType = 'Unit' | 'Room';

const scrapAccommodationInfo = async (
    category: Category,
    urlLists: URLLists
): Promise<Accommodations> =>
    await Promise.all(
        urlLists.map(async ({ url, id }) => {
            const parsed = parse(await (await fetch(url)).text())
                .removeWhitespace()
                .getElementsByTagName('tr');
            const obj = {
                id,
                handlerType: getHandlerType(parseAsHTMLElement(parsed[3], 3)),
                name: getName(parseAsHTMLElement(parsed[4], 4)),
                contact: getContact(parseAsHTMLElement(parsed[5], 5)),
                address: getAddress(parseAsHTMLElement(parsed[9], 9)),
                facilities: getFacilities(parseAsHTMLElement(parsed[10], 10)),
                remarks: getRemarks(parseAsHTMLElement(parsed[11], 11)),
            };
            const { type } = category;
            switch (type) {
                case 'Room': {
                    return {
                        ...obj,
                        accommodationType: {
                            type,
                            roomType: category.roomType,
                            rooms: getRooms(parseAsHTMLElement(parsed[8], 8)),
                        },
                    };
                }
                case 'Unit': {
                    return {
                        ...obj,
                        accommodationType: {
                            type,
                            unitType: category.unitType,
                            unit: getUnits(parseAsHTMLElement(parsed[8], 8)),
                        },
                    };
                }
            }
        })
    );

const scrapper = async (region: Region) => {
    const html = await fetchCampusHTMLText(region);
    return {
        scrapRoom: await scrapAccommodationInfo(
            {
                type: 'Room',
                roomType: 'Room',
            },
            urlLists(
                html,
                /a href="accomDetail\.jsp\?fftrsid=.+type=Roomate"/gm
            )
        ),
        scrapRoommate: await scrapAccommodationInfo(
            {
                type: 'Room',
                roomType: 'Roommate',
            },
            urlLists(html, /a href="accomDetail\.jsp\?fftrsid=.+type=Room"/gm)
        ),
        scrapApartmentCondominium: await scrapAccommodationInfo(
            {
                type: 'Unit',
                unitType: 'ApartmentCondominium',
            },
            urlLists(
                html,
                /a href="accomDetail\.jsp\?fftrsid=.+type=Apartment\/Condominium"/gm
            )
        ),
        scrapHouse: await scrapAccommodationInfo(
            {
                type: 'Unit',
                unitType: 'House',
            },
            urlLists(html, /a href="accomDetail\.jsp\?fftrsid=.+type=House"/gm)
        ),
    };
};

export {
    Region,
    Contact,
    Month,
    RoomProperties,
    RoomType,
    RoomSize,
    UnitType,
    Category,
    Accommodations,
    QueriedUnit,
    QueriedRoom,
    HandlerType,
    AccommodationType,
};

export default scrapper;
