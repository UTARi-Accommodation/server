import {
    Month,
    months,
    QueriedContact,
    QueriedRoom,
    QueriedUnit,
    RoomSize,
    SortedRoom,
    SortedUnit,
} from 'utari-common';
import { isBlank, isEmpty, isWhiteSpace } from 'granula-string';

type MultiAttributeDecisionModelUnits = ReadonlyArray<
    Omit<QueriedUnit, 'bookmarked'>
>;
type MultiAttributeDecisionModelRooms = ReadonlyArray<
    Omit<QueriedRoom, 'bookmarked'>
>;

const convertMonthToNumeric = (month: Month) => {
    const index = months.indexOf(month) + 1;
    if (index < 1 || index > 12) {
        throw new Error(`Month of ${month} is not found from array of months`);
    }
    return index;
};

const determinePunishmentForBadRoomRental = ({
    rental,
    min,
    max,
}: Readonly<{
    rental: number;
    min: number;
    max: number;
}>) => (rental < min ? -1 : rental > max ? -2 : 0);

const punishmentForBadRoomRental = (rental: number, size: RoomSize) =>
    determinePunishmentForBadRoomRental({
        rental,
        min: size === 'Master' ? 300 : 350,
        max: size === 'Small' ? 550 : size === 'Middle' ? 500 : 450,
    });

const computeAddressScore = (address: string) =>
    normalizeNonQuantifiableAttribute({
        string: address,
        max: 20,
        delimiter: ' ',
    });

const computeRatingScore = (rating: ReadonlyArray<number>) =>
    !rating.length
        ? 0
        : normalizeBeneficialQuantifiableAttribute({
              current:
                  (rating.length <= 150
                      ? 5 / (1 + Math.exp(-0.1 * (rating.length - 50)))
                      : 1) *
                  (rating.reduce((prev, curr) => {
                      if (curr < 1 || curr > 5) {
                          throw new Error(
                              `curr rating is ${curr}, which is < 1 OR > 5`
                          );
                      }
                      return prev + curr;
                  }, 0) /
                      rating.length),
              min: 0,
              max: rating.length <= 150 ? 25 : 5,
          });

// ref https://www.desmos.com/calculator/8yjcuu7oan
const computeVisitCountScore = (visitCount: number) =>
    !visitCount
        ? 0
        : normalizeBeneficialQuantifiableAttribute({
              current: !visitCount
                  ? 0
                  : visitCount <= 160
                  ? 5 / (1 + Math.exp(-0.05 * (visitCount - 80)))
                  : Math.log(visitCount) + 2.71,
              min: visitCount <= 160 ? 0 : 4.91,
              max: visitCount <= 160 ? 4.91 : 7.82,
          });

const computeFacilitiesScore = (facilities: string) =>
    normalizeNonQuantifiableAttribute({
        string: facilities,
        max: 20,
        delimiter: /\W/gm,
    });

const computeTimeScore = ({
    year,
    month,
}: Readonly<{
    year: number;
    month: Month;
}>) =>
    normalizeBeneficialQuantifiableAttribute({
        current: new Date(year, convertMonthToNumeric(month), 1).getTime(),
        min: new Date(2002, 8, 13).getTime(),
        max: new Date().getTime(),
    });

const computeRemarkScore = (remark: string) =>
    normalizeNonQuantifiableAttribute({
        string: remark,
        max: 20,
        delimiter: /\W/gm,
    });

const computeContactScore = ({
    mobileNumber: { length: mLength },
    email: { length: eLength },
}: QueriedContact) =>
    mLength && eLength
        ? 1
        : mLength && !eLength
        ? 0.8
        : !mLength && eLength
        ? 0.5
        : 0;

const computeUnitScore = (
    unit: Omit<QueriedUnit, 'bookmarked'>,
    {
        minRentalPerPax,
        maxRentalPerPax,
    }: Readonly<{
        minRentalPerPax: number;
        maxRentalPerPax: number;
    }>
) => {
    const weightageOfAttributes = {
        address: 20,
        rental: 15,
        rating: 15,
        visitCount: 15,
        facilities: 10,
        time: 10,
        bedRooms: 6,
        bathRooms: 4,
        remark: 4,
        contact: 1,
    } as const;

    const {
        id,
        location: { address },
        properties: { rental, bedRooms, bathRooms },
        ratings,
        visitCount,
        facilities,
        contact,
        remarks: { year, month, remark },
    } = unit;

    const rentalScore =
        (minRentalPerPax === maxRentalPerPax
            ? 1
            : normalizeNonBeneficialQuantifiableAttribute({
                  current: rental / (bedRooms ?? 1),
                  min: minRentalPerPax,
                  max: maxRentalPerPax,
              })) * weightageOfAttributes.rental;

    const bedRoomsScore =
        normalizeBeneficialQuantifiableAttribute({
            current: bedRooms,
            min: 1,
            max: 4,
        }) * weightageOfAttributes.bedRooms;

    const bathRoomsScore =
        normalizeBeneficialQuantifiableAttribute({
            current: bathRooms,
            min: 1,
            max: 3,
        }) * weightageOfAttributes.bathRooms;

    const addressScore =
        computeAddressScore(address) * weightageOfAttributes.address;

    const ratingScore =
        computeRatingScore(ratings) * weightageOfAttributes.rating;

    const visitCountScore =
        computeVisitCountScore(visitCount) * weightageOfAttributes.visitCount;

    const facilitiesScore =
        computeFacilitiesScore(facilities) * weightageOfAttributes.facilities;

    const timeScore =
        computeTimeScore({
            year,
            month,
        }) * weightageOfAttributes.time;

    const remarkScore =
        computeRemarkScore(remark) * weightageOfAttributes.remark;

    const contactScore =
        computeContactScore(contact) * weightageOfAttributes.contact;

    const score =
        addressScore +
        rentalScore +
        ratingScore +
        visitCountScore +
        facilitiesScore +
        timeScore +
        bedRoomsScore +
        bathRoomsScore +
        remarkScore +
        contactScore;

    if (Number.isNaN(score)) {
        console.log('min and max rental:', {
            minRentalPerPax,
            maxRentalPerPax,
        });
        console.log('finalscore:', {
            addressScore,
            rentalScore,
            ratingScore,
            visitCountScore,
            facilitiesScore,
            timeScore,
            bedRoomsScore,
            bathRoomsScore,
            remarkScore,
            contactScore,
        });
        console.log('unitInfo as below');
        console.dir(unit, { depth: null });
        throw new Error(`final score is NaN for ID of ${id}`);
    }

    return score;
};

const multiAttributeDecisionModelUnit = (
    units: MultiAttributeDecisionModelUnits,
    {
        minRentalPerPax,
        maxRentalPerPax,
    }: Readonly<{
        minRentalPerPax: number;
        maxRentalPerPax: number;
    }>
) =>
    units.map((unit) => ({
        id: unit.id,
        score: computeUnitScore(unit, {
            minRentalPerPax,
            maxRentalPerPax,
        }),
    }));

const computeRoomScore = (
    room: Omit<QueriedRoom, 'bookmarked'>,
    {
        minRentalPerPax,
        maxRentalPerPax,
    }: Readonly<{
        minRentalPerPax: number;
        maxRentalPerPax: number;
    }>
) => {
    const weightageOfAttributes = {
        address: 20,
        rental: 15,
        rating: 15,
        visitCount: 15,
        facilities: 10,
        capacities: 10,
        time: 10,
        remark: 4,
        contact: 1,
    } as const;
    const {
        id,
        location: { address },
        properties: { rental, capacities, size },
        ratings,
        visitCount,
        facilities,
        contact,
        remarks: { year, month, remark },
    } = room;

    const rentalScore =
        (minRentalPerPax === maxRentalPerPax
            ? 1
            : normalizeNonBeneficialQuantifiableAttribute({
                  current:
                      capacities.length === 1 && capacities[0] === 0
                          ? rental
                          : rental /
                            (capacities.reduce((prev, curr) => prev + curr) /
                                capacities.length),
                  min: minRentalPerPax,
                  max: maxRentalPerPax,
              }) + punishmentForBadRoomRental(rental, size)) *
        weightageOfAttributes.rental;

    const capacitiesScore =
        capacities.reduce(
            (prev, capacity) =>
                prev +
                normalizeBeneficialQuantifiableAttribute({
                    current: capacity,
                    min: 0,
                    max: size === 'Small' ? 1 : 4,
                }) *
                    weightageOfAttributes.capacities,
            0
        ) / (capacities.length || 1);

    const addressScore =
        computeAddressScore(address) * weightageOfAttributes.address;

    const ratingScore =
        computeRatingScore(ratings) * weightageOfAttributes.rating;

    const visitCountScore =
        computeVisitCountScore(visitCount) * weightageOfAttributes.visitCount;

    const facilitiesScore =
        computeFacilitiesScore(facilities) * weightageOfAttributes.facilities;

    const timeScore =
        computeTimeScore({
            year,
            month,
        }) * weightageOfAttributes.time;

    const remarkScore =
        computeRemarkScore(remark) * weightageOfAttributes.remark;

    const contactScore =
        computeContactScore(contact) * weightageOfAttributes.contact;

    const score =
        addressScore +
        rentalScore +
        ratingScore +
        visitCountScore +
        facilitiesScore +
        capacitiesScore +
        timeScore +
        remarkScore +
        contactScore;

    if (Number.isNaN(score)) {
        console.log('min and max rental:', {
            minRentalPerPax,
            maxRentalPerPax,
        });
        console.log('finalScore:', {
            addressScore,
            rentalScore,
            ratingScore,
            visitCountScore,
            facilitiesScore,
            capacitiesScore,
            timeScore,
            remarkScore,
            contactScore,
        });
        console.log('roomInfo as below');
        console.dir(room, { depth: null });
        throw new Error(`final score is NaN for ID of ${id}`);
    }

    return score;
};

const multiAttributeDecisionModelRoom = (
    rooms: MultiAttributeDecisionModelRooms,
    {
        minRentalPerPax,
        maxRentalPerPax,
    }: Readonly<{
        minRentalPerPax: number;
        maxRentalPerPax: number;
    }>
) =>
    rooms.map((room) => ({
        id: room.id,
        score: computeRoomScore(room, {
            minRentalPerPax,
            maxRentalPerPax,
        }),
    }));

const getMinMax = (numbers: ReadonlyArray<number>) => ({
    min: Math.min(...numbers),
    max: Math.max(...numbers),
});

const normalizeNonQuantifiableAttribute = ({
    string,
    max,
    delimiter,
}: Readonly<{
    string: string;
    max: number;
    delimiter: string | RegExp;
}>): 1 | 0.5 | 0 => {
    if (isEmpty(string) || isBlank(string) || isWhiteSpace(string)) {
        return 0;
    }
    const wordCount = string.split(delimiter).filter((s) => s).length;
    return wordCount <= max ? 1 : wordCount <= max * 1.5 ? 0.5 : 0;
};

type NormalizeQuantifiable = Readonly<{
    current: number;
    min: number;
    max: number;
}>;

const normalizeBeneficialQuantifiableAttribute = ({
    current,
    min,
    max,
}: NormalizeQuantifiable) => (current - min) / (max - min);

const normalizeNonBeneficialQuantifiableAttribute = ({
    current,
    min,
    max,
}: NormalizeQuantifiable) => 1 - (current - min) / (max - min);

export {
    computeAddressScore,
    computeRatingScore,
    computeVisitCountScore,
    computeFacilitiesScore,
    computeTimeScore,
    computeRemarkScore,
    computeContactScore,
    multiAttributeDecisionModelRoom,
    multiAttributeDecisionModelUnit,
    SortedRoom,
    SortedUnit,
    computeRoomScore,
    computeUnitScore,
    getMinMax,
    MultiAttributeDecisionModelRooms,
    MultiAttributeDecisionModelUnits,
};
