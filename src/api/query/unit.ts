import generalUnit from '../../database/action/general/unit/index';
import detailedUnit from '../../database/action/detailed/unit/index';
import bookmarkedUnit from '../../database/action/bookmarked/unit/index';
import { parseRentalFromCurrency } from './common';

const parseProperties = ({
    rental,
    bed_rooms,
    bath_rooms,
}: Readonly<{
    bed_rooms: number;
    rental: string;
    bath_rooms: number;
}>) =>
    ({
        bedRooms: bed_rooms,
        rental: parseRentalFromCurrency(rental),
        bathRooms: bath_rooms,
    } as const);

export { parseProperties, generalUnit, detailedUnit, bookmarkedUnit };
