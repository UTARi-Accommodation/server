import { isPositiveInt } from 'granula-string';
import { parseAsString } from 'parse-dont-validate';
import { RentalRange } from 'utari-common';

const parseRentalFromNumeric = (rental: string | null | undefined) =>
    parseFloat(parseAsString(rental).orElseThrowDefault('rental'));

const parseNumericFromRental = (rental: number) => `${rental}`;

const parseNullableNumericFromRental = (rental: number | undefined) =>
    rental === undefined ? undefined : parseNumericFromRental(rental);

type Undefinable<T> = { [K in keyof T]: T[K] | undefined };

const convertRentalToNumeric = ({ min, max }: Undefinable<RentalRange>) => ({
    minRental: parseNullableNumericFromRental(min),
    maxRental: parseNullableNumericFromRental(max),
});

const parseVisitCount = (visitCount: string | null) =>
    visitCount === null
        ? 0
        : !isPositiveInt(visitCount)
        ? 0
        : parseInt(visitCount, 10);

const parseContact = ({
    mobileNumber,
    email,
}: Readonly<{
    mobileNumber: ReadonlyArray<string> | null;
    email: ReadonlyArray<string> | null;
}>) =>
    ({
        mobileNumber: mobileNumber ?? [],
        email: email ?? [],
    } as const);

const parseRating = (rating: ReadonlyArray<number> | null) => rating ?? [];

type ConvertCurrencyToNumber<T> = Omit<T, 'minRental' | 'maxRental'> &
    Readonly<{
        minRental: number | undefined;
        maxRental: number | undefined;
    }>;

export {
    convertRentalToNumeric,
    parseVisitCount,
    parseContact,
    parseRentalFromNumeric,
    parseRating,
    parseNullableNumericFromRental,
    parseNumericFromRental,
    ConvertCurrencyToNumber,
};
