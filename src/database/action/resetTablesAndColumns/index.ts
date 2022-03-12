import room from '../../table/room/index';
import roomCapacities from '../../table/roomCapacity/index';
import email from '../../table/email/index';
import mobileNumber from '../../table/mobileNumber/index';
import accommodation from '../../table/accommodation/index';
import unit from '../../table/unit/index';
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
