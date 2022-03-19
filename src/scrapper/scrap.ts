import accommodationScrapper from '.';

(() => {
    console.log('scrapping without CronJob');
    accommodationScrapper();
})();
