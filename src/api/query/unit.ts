import generalUnit from '../../database/action/general/unit';
import detailedUnit from '../../database/action/detailed/unit';
import bookmarkedUnit from '../../database/action/bookmarked/unit';
import { parseRentalFromNumeric } from './common';

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
        rental: parseRentalFromNumeric(rental),
        bathRooms: bath_rooms,
    } as const);

export { parseProperties, generalUnit, detailedUnit, bookmarkedUnit };
