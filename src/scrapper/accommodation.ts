import {
    Accommodations,
    Category,
    Contact,
    HandlerType,
    Month,
    months,
    Region,
    Remarks,
    Room,
    Unit,
} from 'utari-common';
import { capitalize, isPositiveInt } from 'granula-string';
import fetch from 'node-fetch';
import { parse, HTMLElement } from 'node-html-parser';
import { parseAsNumber, parseAsString } from 'parse-dont-validate';

const fetchCampusHTMLText = async (region: Region) =>
    await (
        await fetch(`http://www2.utar.edu.my/accomList.jsp?fcode=${region}`)
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
            .replace('a href="', 'http://www2.utar.edu.my/')
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
                            mobileNumber: contactInfo
                                .split('/')
                                .flatMap((info) => {
                                    const mobileNumber = removeSpaceFromString(
                                        info
                                            .replace(/\+6/g, '')
                                            .replace(/\D+/g, '')
                                    );
                                    return isPositiveInt(mobileNumber)
                                        ? [mobileNumber]
                                        : [];
                                }),
                        };
                    case 'Email:':
                        return {
                            ...prev,
                            email: contactInfo.split('/').flatMap((info) => {
                                const email = removeSpaceFromString(
                                    info
                                ).replace(',com', '.com');
                                if (
                                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                                        email
                                    )
                                ) {
                                    return [email];
                                }
                                return [];
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
                    : `${prev}${text
                          .split(' ')
                          .map((value) =>
                              capitalize(value.trim().toLowerCase())
                          )
                          .join(' ')
                          .trim()}`,
            ''
        )
        .replace(/\W*$/gim, '')
        .trim();

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
                          .reduce((prev, curr) => {
                              const address = curr
                                  .split(' ')
                                  .map((value) =>
                                      capitalize(value.trim().toLowerCase())
                                  )
                                  .join(' ')
                                  .trim();
                              return prev ? `${prev}, ${address}` : address;
                          }, ''),
            ''
        )
        .replace(/\W*$/gim, '')
        .trim();

const getFacilities = (element: HTMLElement) =>
    element
        .getElementsByTagName('font')
        .reduce((prev, { text }) => {
            if (text === 'Facilities:' || text === 'Others:') {
                return prev;
            }
            const facility = Array.from(
                new Set(removeSpaceFromString(text).replace(';', '').split('/'))
            )
                .join(' · ')
                .trim();
            return prev ? `${prev} · ${facility}` : facility;
        }, '')
        .replace(/\W*$/gim, '')
        .trim();

const splitReduceRemarks = (remarks: string) =>
    remarks
        .split(',')
        .reduce((prev, curr) => {
            const value = curr.trim();
            return prev ? `${prev}, ${value}` : value;
        }, '')
        .replace(/\W*$/gim, '')
        .replace(/^\W*/gim, '')
        .trim();

const processMonth = (month: string): Month => {
    const changedMonth = month.charAt(0) + month.substring(1).toLowerCase();
    const foundMonth = months.find((m) => m.includes(changedMonth));
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

const getRemarks = (element: HTMLElement) =>
    element.getElementsByTagName('font').reduce(
        (prev, { text }) => {
            if (text === 'Remark:') {
                return prev;
            }
            const remark = removeSpaceFromString(text).replace(
                'Avalaible',
                'Available'
            );
            const regex = /Available From .* \d{4}/gm;
            const matches = regex.exec(remark);
            if (!matches) {
                throw new Error(
                    `No available date match for remark of: "${remark}"`
                );
            }
            const [month, year] = parseAsString(matches[0])
                .elseThrow('match is not a string, it is undefined')
                .replace('Available From', '')
                .trim()
                .toUpperCase()
                .split(' ');

            return {
                remark: removeDateFromRemarks(remark.split(regex).join('')),
                month: processMonth(
                    parseAsString(month).elseThrow(
                        'month is not a string, it is undefined'
                    )
                ),
                year: parseAsNumber(
                    parsePositiveInteger(
                        parseAsString(year).elseThrow(
                            'year is not a parseable string, it is undefined'
                        )
                    )
                )
                    .inRangeOf(2002, new Date().getFullYear())
                    .elseGet(undefined),
            };
        },
        {} as Readonly<{
            remark: Remarks['remark'];
            month: Remarks['month'];
            year: Remarks['year'] | undefined;
        }>
    );

const getRooms = (element: HTMLElement) =>
    element.getElementsByTagName('font').reduce((prev, font) => {
        const { text } = font;
        if (text === 'Accommodation Details:' || text === 'Room/Roomate') {
            return prev;
        }
        const roomInfo = text
            .trim()
            .split(/\u00a0/)
            .flatMap((room) =>
                removeSpaceFromString(room)
                    .replace(/persons|person/gim, '')
                    .replace('RM', '')
                    .trim()
                    .split('/ ')
                    .flatMap((info) =>
                        info ? (info === '/' ? [] : [info]) : []
                    )
            );
        if (roomInfo.length !== 3) {
            throw new Error(
                `Room info of ${roomInfo} does not contain 3 elements: type, rental, capacities`
            );
        }
        const [roomType, rental, capacities] = roomInfo;
        const type = parseAsString(roomType)
            .elseThrow('roomType is not a string, it is undefined')
            .replace(' Bedroom', '')
            .toLowerCase();
        if (type === 'master' || type === 'middle' || type === 'small') {
            if (prev[type]) {
                return prev;
            }
            const parsedRental = parseAsNumber(
                parsePositiveInteger(
                    parseAsString(rental).elseThrow(
                        'rental is not a string, it is undefined'
                    )
                )
            )
                .inRangeOf(0, 100000)
                .elseThrow(
                    'parsed rental is not a number within specified range'
                );
            const parsedCapacities = parseAsString(capacities)
                .elseThrow('capacities is not a string, it is undefined')
                .split('/')
                .flatMap((capacity) => {
                    const parsed = parseAsNumber(parsePositiveInteger(capacity))
                        .inRangeOf(0, Number.MAX_SAFE_INTEGER)
                        .elseThrow(
                            'capacity is not a number specified within a range'
                        );
                    return !parsed ? [] : [parsed];
                });
            return !parsedRental || !parsedCapacities.length
                ? prev
                : {
                      ...prev,
                      [type]: {
                          rental: parsedRental,
                          capacities: parsedCapacities,
                      },
                  };
        }
        throw new Error(
            `RefinedType of room: ${type} is not master, middle or small`
        );
    }, {} as Room);

const getUnits = (element: HTMLElement): Unit | undefined => {
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

    if (unitInfo.length !== 6) {
        return undefined;
    }

    const bedRooms = parseAsNumber(
        parsePositiveInteger(
            parseAsString(unitInfo[1]).elseThrow(
                'bedRoom is not a parseable string, it is undefined'
            )
        )
    )
        .inRangeOf(0, Number.MAX_SAFE_INTEGER)
        .elseThrow('bedRooms is not a number within a specified range');
    const bathRooms = parseAsNumber(
        parsePositiveInteger(
            parseAsString(unitInfo[3]).elseThrow(
                'bathRoom is not a parseable string, it is undefined'
            )
        )
    )
        .inRangeOf(0, Number.MAX_SAFE_INTEGER)
        .elseThrow('bathRooms is not a number within a specified range');
    const rental = parseAsNumber(
        parsePositiveInteger(
            parseAsString(unitInfo[4]).elseThrow(
                'wholeUnit is not a number within a specified range'
            )
        )
    )
        .inRangeOf(0, Number.MAX_SAFE_INTEGER)
        .elseThrow(`rental is not a number, it is ${unitInfo[4]}`);
    return bedRooms !== undefined &&
        bathRooms !== undefined &&
        rental != undefined
        ? {
              bedRooms,
              bathRooms,
              rental,
          }
        : undefined;
};

const parseAsHTMLElement = (elem: HTMLElement | undefined, index: number) => {
    if (!elem) {
        throw new Error(`html element is undefined at index: ${index}`);
    }
    return elem;
};

const scrapAccommodationInfo = async (category: Category, urlLists: URLLists) =>
    (
        await Promise.all<Accommodations>(
            urlLists.map(async ({ url, id }) => {
                const parsed = parse(await (await fetch(url)).text())
                    .removeWhitespace()
                    .getElementsByTagName('tr');
                const contact = getContact(parseAsHTMLElement(parsed[5], 5));
                const { mobileNumber, email } = contact;
                if (
                    !(mobileNumber
                        ? Array.from(mobileNumber)
                              .sort((a, b) => a.localeCompare(b))
                              .join('')
                        : Array.from(email ?? [])
                              .sort((a, b) => a.localeCompare(b))
                              .join(''))
                ) {
                    return [];
                }
                const obj = {
                    id,
                    contact,
                    handlerType: getHandlerType(
                        parseAsHTMLElement(parsed[3], 3)
                    ),
                    name: getName(parseAsHTMLElement(parsed[4], 4)),
                    address: getAddress(parseAsHTMLElement(parsed[9], 9)),
                    facilities: getFacilities(
                        parseAsHTMLElement(parsed[10], 10)
                    ),
                    remarks: getRemarks(parseAsHTMLElement(parsed[11], 11)),
                };
                if (!obj.remarks.year) {
                    return [];
                }
                const newObj = {
                    ...obj,
                    remarks: obj.remarks as Remarks,
                };
                const { type } = category;
                switch (type) {
                    case 'Unit': {
                        const unit = getUnits(parseAsHTMLElement(parsed[8], 8));
                        return !unit
                            ? []
                            : [
                                  {
                                      ...newObj,
                                      accommodation: {
                                          type,
                                          unitType: category.unitType,
                                          unit,
                                      },
                                  },
                              ];
                    }
                    case 'Room': {
                        const { small, middle, master } = getRooms(
                            parseAsHTMLElement(parsed[8], 8)
                        );
                        return !(small || middle || master)
                            ? []
                            : [
                                  {
                                      ...newObj,
                                      accommodation: {
                                          type,
                                          roomType: category.roomType,
                                          rooms: { small, middle, master },
                                      },
                                  },
                              ];
                    }
                }
            })
        )
    ).flat();

const scrapper = async (region: Region) => {
    const html = await fetchCampusHTMLText(region);
    return {
        scrapRoom: await scrapAccommodationInfo(
            {
                type: 'Room',
                roomType: 'Room',
            },
            urlLists(html, /a href="accomDetail\.jsp\?fftrsid=.+type=Room"/gm)
        ),
        scrapRoommate: await scrapAccommodationInfo(
            {
                type: 'Room',
                roomType: 'Roommate',
            },
            urlLists(
                html,
                /a href="accomDetail\.jsp\?fftrsid=.+type=Roomate"/gm
            )
        ),
        scrapCondominium: await scrapAccommodationInfo(
            {
                type: 'Unit',
                unitType: 'Condominium',
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

export default scrapper;
