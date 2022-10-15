import puppeteer from 'puppeteer';
import { parseAsLatitude, parseAsLongitude } from 'utari-common';

type GeocodeResponse = Readonly<
    | {
          type: 'invalid';
      }
    | {
          type: 'valid';
          geocode: {
              latitude: number;
              longitude: number;
          };
      }
>;

const getGeoCodeResponse = async (
    browser: puppeteer.Browser,
    address: string
): Promise<GeocodeResponse> => {
    try {
        const page = await browser.newPage();
        await page.goto(
            `https://developers-dot-devsite-v2-prod.appspot.com/maps/documentation/utils/geocoder#q=${address}`
        );
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
        return {
            type: 'valid',
            geocode: {
                latitude: parseAsLatitude(parseFloat(lat ?? '')),
                longitude: parseAsLongitude(parseFloat(long ?? '')),
            },
        };
    } catch (error) {
        console.log(
            `Error in Geocode for address '${address}', error: ${JSON.stringify(
                error,
                undefined,
                4
            )}`
        );
        return {
            type: 'invalid',
        };
    }
};

const geocode = (async () => {
    const browser = await puppeteer.launch({
        args: ['--disable-setuid-sandbox'],
        ignoreHTTPSErrors: true,
    });
    return {
        close: async () => await browser.close(),
        getGeoCode: async (address: string) =>
            Array.from(
                {
                    length: 3, // max try count
                },
                (_, index) => index
            ).reduce(
                async (prev) => {
                    const response = await prev;
                    switch (response.type) {
                        case 'valid': {
                            return prev;
                        }
                        case 'invalid': {
                            try {
                                return await getGeoCodeResponse(
                                    browser,
                                    address
                                );
                            } catch (error) {
                                console.log(
                                    `Error in Geocode from address '${address}': error: ${JSON.stringify(
                                        error,
                                        undefined,
                                        4
                                    )}`
                                );
                                return prev;
                            }
                        }
                    }
                },
                Promise.resolve({
                    type: 'invalid',
                } as GeocodeResponse)
            ),
    };
})();

export default geocode;
