import { parseAsNumber, parseAsReadonlyArray } from 'parse-dont-validate';
import { MultiSelectNumber, RoomSize } from 'utari-common';
import { parseRentalFromCurrency } from './common';
import generalRoom from '../../database/action/general/room/index';
import detailedRoom from '../../database/action/detailed/room/index';
import bookmarkedRoom from '../../database/action/bookmarked/room/index';

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
        rental: parseRentalFromCurrency(rental),
    } as const);

export { parseProperties, generalRoom, detailedRoom, bookmarkedRoom };
