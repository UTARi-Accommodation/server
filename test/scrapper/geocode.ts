import geocode from '../../src/scrapper/geocode';

const testGeocodeScrapper = () =>
    describe('Geocode', () => {
        it('should return geolocation from address', async () => {
            const { latitude, longitude } = await geocode.getGeoCode(
                'The Meadow Park, 47-2, Lorong Makmur 5D off Persiaran AG, Bandar Agacia,c31910 Kampar, Perak'
            );
            expect(latitude).toBe(4.321283);
            expect(longitude).toBe(101.125729);
        });
    });

export default testGeocodeScrapper;
