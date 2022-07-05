import generalUnit from '../../database/action/general/unit';
import detailedUnit from '../../database/action/detailed/unit';
import bookmarkedUnit from '../../database/action/bookmarked/unit';
import { parseRentalFromNumeric } from './common';

const parseProperties = ({
    rental,
    bedRooms,
    bathRooms,
}: Readonly<{
    bedRooms: number;
    rental: string;
    bathRooms: number;
}>) =>
    ({
        bedRooms,
        rental: parseRentalFromNumeric(rental),
        bathRooms,
    } as const);

export { parseProperties, generalUnit, detailedUnit, bookmarkedUnit };
