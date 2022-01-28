import PostgreSQL from '../database/postgres';
import insertToDatabase from './populate/populate';
import scrapper, { Region } from './scrapper/fetchParser';
import Puppeteer from './scrapper/puppeteer';

const insertAllToDatabase = async (region: Region) => {
    const { scrapRoom, scrapRoommate, scrapHouse, scrapApartmentCondominium } =
        await scrapper(region);
    const result = await Promise.all([
        await insertToDatabase(scrapRoom, region),
        await insertToDatabase(scrapRoommate, region),
        await insertToDatabase(scrapHouse, region),
        await insertToDatabase(scrapApartmentCondominium, region),
    ]);
    if (result.length !== 4) {
        throw new Error('Some database insertion failed');
    }
};

const main = async () => {
    // use client for now, pool connection has problem on config
    await PostgreSQL.getPoolInstance().resetSomeTablesAndColumns();
    // pool
    // await Promise.all(
    //     [
    //         insertAllToDatabase('SL'),
    //         insertAllToDatabase('KP'),
    //         insertAllToDatabase('BTHO'),
    //     ].map(async (accommodations) => await accommodations)
    // );
    // client
    await [
        insertAllToDatabase('SL'),
        insertAllToDatabase('KP'),
        insertAllToDatabase('BTHO'),
    ].reduce(async (prev, curr) => {
        await prev;
        await curr;
    }, Promise.resolve());
    console.log('Completed Insertion and Update');
    PostgreSQL.getPoolInstance().close();
    (await Puppeteer.getInstance()).close();
};

main();
