import { parseAsNumber, parseAsReadonlyArray } from 'parse-dont-validate';
import { MultiSelectNumber, RoomSize } from 'utari-common';
import { parseRentalFromNumeric } from './common';
import generalRoom from '../../database/action/general/room';
import detailedRoom from '../../database/action/detailed/room';
import bookmarkedRoom from '../../database/action/bookmarked/room';

const parseProperties = ({
    rental,
    roomSize,
    capacities,
}: Readonly<{
    rental: string;
    roomSize: RoomSize;
    capacities: MultiSelectNumber | null;
}>) =>
    ({
        size: roomSize,
        capacities: parseAsReadonlyArray(capacities, (capacity) =>
            parseAsNumber(capacity).orElseThrowDefault('capacity')
        ).orElseThrowDefault('capacity'),
        rental: parseRentalFromNumeric(rental),
    } as const);

export { parseProperties, generalRoom, detailedRoom, bookmarkedRoom };
