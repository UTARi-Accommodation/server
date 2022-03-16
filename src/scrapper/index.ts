import { Region } from 'utari-common';
import postgreSQL from '../database/postgres';
import resetTablesAndColumns from '../database/action/resetTablesAndColumns/index';
import upsertToDatabase from '../api/populate/index';
import scrapper from './accommodation';
import logger from '../logger';
import timeScrap from '../database/table/timeScrap';

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
