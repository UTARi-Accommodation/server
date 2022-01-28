import { parseAsNumber } from 'parse-dont-validate';
import puppeteer from 'puppeteer';

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
        latitude: parseAsNumber(parseFloat(lat ?? ''))
            .inRangeOf(-90, 90)
            .orElseThrowCustom(
                `lat must be in range of -90 to 90, got "${lat}" instead`
            ),
        longitude: parseAsNumber(parseFloat(long ?? ''))
            .inRangeOf(-180, 180)
            .orElseThrowCustom(
                `long must be in range of -180 to 180, got "${long}" instead`
            ),
    };
};

const createPuppeteer = async () => {
    const browser = await puppeteer.launch({
        args: ['--disable-setuid-sandbox'],
        ignoreHTTPSErrors: true,
    });
    return {
        getGeoCode: async (address: string) => {
            const page = await browser.newPage();
            await page.goto(
                'https://developers-dot-devsite-v2-prod.appspot.com/maps/documentation/utils/geocoder'
            );
            await page.waitForSelector('#map');
            await page.waitForSelector('#query-input');
            await page.waitForSelector('#geocode-button');

            try {
                return await getGeoCode(page, address);
            } catch (error) {
                return await getGeoCode(page, address);
            }
        },
        close: async () => await browser.close(),
    };
};

class Puppeteer {
    private static readonly instance = createPuppeteer();

    static getInstance = () => this.instance;
}

export default Puppeteer;
