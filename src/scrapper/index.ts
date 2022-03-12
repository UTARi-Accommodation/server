import { Region } from 'utari-common';
import postgreSQL from '../database/postgres';
import resetTablesAndColumns from '../database/action/resetTablesAndColumns/index';
import upsertToDatabase from '../api/populate/index';
import scrapper from './accommodation';
import geocode from './geocode';

const upsertAllToDatabase = async (region: Region) => {
    const { scrapRoom, scrapRoommate, scrapHouse, scrapCondominium } =
        await scrapper(region);
    if (
        (
            await Promise.all([
                await upsertToDatabase(scrapRoom, region),
                await upsertToDatabase(scrapRoommate, region),
                await upsertToDatabase(scrapHouse, region),
                await upsertToDatabase(scrapCondominium, region),
            ])
        ).length !== 4
    ) {
        throw new Error(`Some database insertion failed`);
    }
};

const main = async () => {
    await resetTablesAndColumns(postgreSQL.instance.pool);
    await Promise.all(
        [
            upsertAllToDatabase('SL'),
            upsertAllToDatabase('KP'),
            upsertAllToDatabase('BTHO'),
        ].map(async (accommodations) => await accommodations)
    );
    (await geocode).close();
};

export default main;
