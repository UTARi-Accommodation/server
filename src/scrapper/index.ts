import { Region } from 'utari-common';
import postgreSQL from '../database/postgres';
import resetTablesAndColumns from '../database/action/resetTablesAndColumns';
import upsertToDatabase from '../api/populate';
import scrapper from './accommodation';
import logger from '../logger';
import timeScrap from '../database/table/timeScrap';

const upsertAllToDatabase = async (region: Region) => {
    const { scrapRoom, scrapRoommate, scrapHouse, scrapCondominium } =
        await scrapper(region);
    logger.log({
        roomLen: scrapRoom.length,
        roommateLen: scrapRoommate.length,
        houseLen: scrapHouse.length,
        condominiumLen: scrapCondominium.length,
        region,
    });
    if (
        (
            await Promise.all([
                upsertToDatabase(scrapRoom, region),
                upsertToDatabase(scrapRoommate, region),
                upsertToDatabase(scrapHouse, region),
                upsertToDatabase(scrapCondominium, region),
            ])
        ).length !== 4
    ) {
        throw new Error(`Some database insertion failed`);
    }
};

const accommodationScrapper = async () => {
    const label = 'Scrapper time taken';
    console.time(label);

    const timeStarted = new Date();
    logger.log(`Scrapper started at time: ${timeStarted}`);

    await resetTablesAndColumns(postgreSQL.instance.pool);
    await Promise.all(
        [
            upsertAllToDatabase('SL'),
            upsertAllToDatabase('KP'),
            upsertAllToDatabase('BTHO'),
        ].map(async (accommodations) => await accommodations)
    );

    const timeCompleted = new Date();
    logger.log(`Scrapper completed at time: ${timeCompleted}`);

    console.timeEnd(label);

    const scrapped = await timeScrap.insert(
        {
            timeStarted,
            timeCompleted,
        },
        postgreSQL.instance.pool
    );
    logger.log(scrapped);
};

export default accommodationScrapper;
