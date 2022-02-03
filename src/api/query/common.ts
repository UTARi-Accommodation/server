import {
    parseAsNumber,
    parseAsReadonlyArray,
    parseAsString,
} from 'parse-dont-validate';
import { Value } from '../../database/postgres';
import { Month, Region } from '../../scrapper/scrapper/fetchParser';

type CommonQuery = Readonly<{
    region: Region;
    minRental: number | undefined;
    maxRental: number | undefined;
    address: string | undefined;
    remark: string | undefined;
    facilities: string | undefined;
}>;

type OrganizedQuery = Readonly<{
    key: string;
    value: Value;
}>;

type GenerateQuery = (keys: ReadonlyArray<string>) => string;

const generateRegionQuery: GenerateQuery = (keys) => {
    const index = findIndex(keys, 'region');
    return !index ? '' : `AND region=$${index}`;
};

const findIndex = (keys: ReadonlyArray<string>, searchKey: string) =>
    keys.findIndex((key) => key === searchKey) + 1;

const generateAddressQuery: GenerateQuery = (keys) => {
    const index = findIndex(keys, 'address');
    return !index ? '' : `AND LOWER(address) LIKE LOWER($${index})`;
};

const generateRemarkQuery: GenerateQuery = (keys) => {
    const index = findIndex(keys, 'remark');
    return !index ? '' : `AND LOWER(remark) LIKE LOWER($${index})`;
};

const generateFacilitiesQuery: GenerateQuery = (keys) => {
    const index = findIndex(keys, 'facilities');
    return !index ? '' : `AND LOWER(facilities) LIKE LOWER($${index})`;
};

const generateRentalQuery: GenerateQuery = (keys) => {
    const min = findIndex(keys, 'minRental');
    const max = findIndex(keys, 'maxRental');
    return !min && !max ? '' : `AND rental BETWEEN $${min} AND $${max}`;
};

const generateRangeQuery = ({
    keys,
    columnName,
    minRange,
    maxRange,
    clause,
}: Readonly<{
    keys: ReadonlyArray<string>;
    columnName: 'bed_rooms' | 'bath_rooms' | 'capacity' | 'rental';
    minRange: string;
    maxRange: string;
    clause: 'WHERE' | 'AND';
}>) => {
    const min = findIndex(keys, minRange);
    const max = findIndex(keys, maxRange);
    return !min && !max
        ? ''
        : `${clause} ${columnName} BETWEEN $${min} AND $${max}`;
};

const generateAccommodationQuery: GenerateQuery = (keys) =>
    `${generateRegionQuery(keys)} ${generateAddressQuery(
        keys
    )} ${generateRemarkQuery(keys)} ${generateFacilitiesQuery(keys)}`;

const parseContact = (mobileNumber: unknown, email: unknown) =>
    ({
        mobileNumber:
            mobileNumber === null
                ? []
                : parseAsReadonlyArray(mobileNumber, (val) =>
                      parseAsString(val).orElseThrowDefault('mobileNumber')
                  ).orElseThrowDefault('mobileNumber'),
        email:
            email === null
                ? []
                : parseAsReadonlyArray(email, (val) =>
                      parseAsString(val).orElseThrowDefault('email')
                  ).orElseThrowDefault('email'),
    } as const);

const parseLocation = ({
    address,
    latitude,
    longitude,
}: Readonly<{
    address: unknown;
    latitude: unknown;
    longitude: unknown;
}>) =>
    ({
        address: parseAsString(address).orElseThrowDefault('address'),
        coordinate: {
            latitude: parseAsNumber(latitude).orElseThrowDefault('latitude'),
            longitude: parseAsNumber(longitude).orElseThrowDefault('longitude'),
        },
    } as const);

const parseRental = (rental: unknown) =>
    parseFloat(
        parseAsString(rental)
            .orElseThrowDefault('rental')
            .replace('RM', '')
            .replace(/,/g, '')
    );

const parseFacilities = (facilities: unknown) =>
    parseAsString(facilities).orElseThrowDefault('facilities');

const parseRemarks = ({
    remark,
    year,
    month,
}: Readonly<{
    remark: unknown;
    year: unknown;
    month: unknown;
}>) =>
    ({
        remark: parseAsString(remark).orElseThrowDefault('remark'),
        year: parseAsNumber(year).orElseThrowDefault('year'),
        month: parseAsString(month).orElseThrowDefault('month') as Month,
    } as const);

const parseRating = (rating: unknown) =>
    parseAsReadonlyArray(rating, (val) =>
        parseAsNumber(val).inRangeOf(1, 5).orElseThrowDefault('rating')
    ).orElseGetReadonlyEmptyArray();

const parseVisitCount = (visitCount: unknown) =>
    parseInt(
        parseAsString(visitCount).orElseLazyGet(() => '0'),
        10
    );

export {
    CommonQuery,
    OrganizedQuery,
    GenerateQuery,
    generateRentalQuery,
    generateAccommodationQuery,
    generateRangeQuery,
    findIndex,
    parseContact,
    parseLocation,
    parseRental,
    parseFacilities,
    parseRemarks,
    parseRating,
    parseVisitCount,
};
