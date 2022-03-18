import room from '../../table/room';
import roomCapacities from '../../table/roomCapacity';
import email from '../../table/email';
import mobileNumber from '../../table/mobileNumber';
import accommodation from '../../table/accommodation';
import unit from '../../table/unit';
import { Pool } from 'pg';

const resetTablesAndColumns = async (pool: Pool) => {
    await email.truncate(pool);
    await mobileNumber.truncate(pool);
    await roomCapacities.truncate(pool);

    await roomCapacities.alterIdSequence(pool);

    await accommodation.setAvailabilityFalse(pool);
    await room.setAvailabilityFalse(pool);
    await unit.setAvailabilityFalse(pool);
};

export default resetTablesAndColumns;
