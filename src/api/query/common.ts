import { isPositiveInt } from 'granula-string';
import { parseAsString } from 'parse-dont-validate';
import { RentalRange } from 'utari-common';

const parseRentalFromCurrency = (rental: string | null | undefined) =>
    parseFloat(
        parseAsString(rental)
            .orElseThrowDefault('rental')
            .replace('RM', '')
            .replace(/,/g, '')
    );

const parseCurrencyFromRental = (rental: number) => `RM ${rental}`;

const parseNullableCurrencyFromRental = (rental: number | undefined) =>
    rental === undefined ? undefined : `RM ${rental}`;

type Undefinable<T> = { [K in keyof T]: T[K] | undefined };

const convertRentalToCurrency = ({ min, max }: Undefinable<RentalRange>) => ({
    minRental: parseNullableCurrencyFromRental(min),
    maxRental: parseNullableCurrencyFromRental(max),
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
    convertRentalToCurrency,
    parseVisitCount,
    parseContact,
    parseRentalFromCurrency,
    parseRating,
    parseNullableCurrencyFromRental,
    parseCurrencyFromRental,
    ConvertCurrencyToNumber,
};
