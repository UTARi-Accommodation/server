import puppeteer from 'puppeteer';
import { parseAsLatitude, parseAsLongitude } from 'utari-common';

const getGeoCode = async (page: puppeteer.Page, address: string) => {
    await page.type('#query-input', address);
    await page.click('#geocode-button');
    await page.waitForSelector('#results-control-ui .visible');
    const { lat, long } = await page.evaluate(() => {
        const elements = document.getElementsByClassName('result-location');
        const [_, element] = elements;
        if (!element) {
            throw new Error(`element is undefined`);
        }
        const [lat, long] = (element.textContent ?? '')
            .replace(/\n/gm, '')
            .split(' ')
            .filter((char) => char)
            .join('')
            .replace('(type:GEOMETRIC_CENTER)', '')
            .replace('Location:', '')
            .split(',');
        return {
            lat,
            long,
        };
    });
    await page.close();
    return {
        latitude: parseAsLatitude(parseFloat(lat ?? '')),
        longitude: parseAsLongitude(parseFloat(long ?? '')),
    } as const;
};

const geocode = (async () => {
    const browser = await puppeteer.launch({
        args: ['--disable-setuid-sandbox'],
        ignoreHTTPSErrors: true,
    });
    return {
        getGeoCode: async (address: string) => {
            const page = await browser.newPage();
            while (true) {
                try {
                    await page.goto(
                        'https://developers-dot-devsite-v2-prod.appspot.com/maps/documentation/utils/geocoder'
                    );
                    await page.waitForSelector('#map');
                    await page.waitForSelector('#query-input');
                    await page.waitForSelector('#geocode-button');
                    return await getGeoCode(page, address);
                } catch (error) {
                    console.log(`Error in Geocode from address: ${address}`);
                }
            }
        },
        close: async () => await browser.close(),
    };
})();

export default geocode;
