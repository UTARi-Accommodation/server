import Puppeteer from '../../../src/scrapper/scrapper/puppeteer';

describe('Puppeteer', () => {
    it('should return geolocation from address', async () => {
        const { latitude, longitude } = await (
            await Puppeteer.getInstance()
        ).getGeoCode(
            'The Meadow Park, 47-2, Lorong Makmur 5D off Persiaran AG, Bandar Agacia,c31910 Kampar, Perak'
        );
        expect(latitude).toBe(4.315845);
        expect(longitude).toBe(101.123835);
    });
    afterEach(async () => (await Puppeteer.getInstance()).close());
});
