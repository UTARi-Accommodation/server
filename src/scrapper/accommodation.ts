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
                          .reduce(
                              (prev, curr) =>
                                  prev
                                      ? `${prev}, ${curr
                                            .split(' ')
                                            .map((value) =>
                                                capitalize(
                                                    value.trim().toLowerCase()
                                                )
                                            )
                                            .join(' ')
                                            .trim()}`
                                      : `${curr
                                            .split(' ')
                                            .map((value) =>
                                                capitalize(
                                                    value.trim().toLowerCase()
                                                )
                                            )
                                            .join(' ')
                                            .trim()}`,
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
                    ? `${prev} · ${Array.from(
                          new Set(
                              removeSpaceFromString(text)
                                  .replace(';', '')
                                  .split('/')
                          )
                      )
                          .join(' · ')
                          .trim()}`
                    : `${Array.from(
                          new Set(
                              removeSpaceFromString(text)
                                  .replace(';', '')
                                  .split('/')
                          )
                      )
                          .join(' · ')
                          .trim()}`,
            ''
        )
        .replace(/\W*$/gim, '')
        .trim();

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
            .orElseThrowDefault('roomType')
            .replace(' Bedroom', '')
            .toLowerCase();
        if (type === 'master' || type === 'middle' || type === 'small') {
            if (prev[type]) {
                throw new Error(`${type} already exists`);
            }
            const parsedRental = parseAsNumber(
                parsePositiveInteger(
                    parseAsString(rental).orElseThrowDefault('rental')
                )
            )
                .inRangeOf(0, 100000)
                .orElseThrowDefault('default');
            const parsedCapacities = parseAsString(capacities)
                .orElseThrowDefault('capacities')
                .split('/')
                .flatMap((capacity) => {
                    const parsed = parseAsNumber(parsePositiveInteger(capacity))
                        .inRangeOf(0, Number.MAX_SAFE_INTEGER)
                        .orElseThrowDefault('capacity');
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
    return unitInfo.length !== 6
        ? undefined
        : {
              bedRooms: parseAsNumber(
                  parsePositiveInteger(
                      parseAsString(unitInfo[1]).orElseThrowDefault(
                          'bedRoom or unitInfo[1]'
                      )
                  )
              )
                  .inRangeOf(1, Number.MAX_SAFE_INTEGER)
                  .orElseThrowDefault('bedRooms'),
              bathRooms: parseAsNumber(
                  parsePositiveInteger(
                      parseAsString(unitInfo[3]).orElseThrowDefault(
                          'bathRoom or unitInfo[3]'
                      )
                  )
              )
                  .inRangeOf(1, Number.MAX_SAFE_INTEGER)
                  .orElseThrowDefault('bathRooms'),
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
                const { type } = category;
                switch (type) {
                    case 'Room': {
                        const { small, middle, master } = getRooms(
                            parseAsHTMLElement(parsed[8], 8)
                        );
                        return !(small || middle || master)
                            ? []
                            : [
                                  {
                                      ...obj,
                                      accommodation: {
                                          type,
                                          roomType: category.roomType,
                                          rooms: { small, middle, master },
                                      },
                                  },
                              ];
                    }
                    case 'Unit': {
                        const unit = getUnits(parseAsHTMLElement(parsed[8], 8));
                        return !unit
                            ? []
                            : [
                                  {
                                      ...obj,
                                      accommodation: {
                                          type,
                                          unitType: category.unitType,
                                          unit,
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
