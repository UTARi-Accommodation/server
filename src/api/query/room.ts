import { parseAsNumber, parseAsReadonlyArray } from 'parse-dont-validate';
import { MultiSelectNumber, RoomSize } from 'utari-common';
import { parseRentalFromNumeric } from './common';
import generalRoom from '../../database/action/general/room';
import detailedRoom from '../../database/action/detailed/room';
import bookmarkedRoom from '../../database/action/bookmarked/room';
import { DeepReadonly } from '../../util/type';

const parseProperties = ({
    rental,
    roomSize,
    capacities,
}: DeepReadonly<{
    rental: string;
    roomSize: RoomSize;
    capacities: MultiSelectNumber | null;
}>) =>
    ({
        size: roomSize,
        capacities: parseAsReadonlyArray(capacities, (capacity) =>
            parseAsNumber(capacity).elseThrow(
                `capacity is not a number, it is ${capacity}`
            )
        ).elseThrow(`capacities is not an array, it is ${capacities}`),
        rental: parseRentalFromNumeric(rental),
    } as const);

export { parseProperties, generalRoom, detailedRoom, bookmarkedRoom };
