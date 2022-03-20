import accommodationScrapper from '.';
import postgreSQL from '../database/postgres';

(async () => {
    console.log('scrapping without CronJob');
    await accommodationScrapper();
    await postgreSQL.instance.close();
})();
