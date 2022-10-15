import geocode from '../../src/scrapper/geocode';

const testGeocodeScrapper = () =>
    describe('Geocode', () => {
        it('should return geolocation from address', async () => {
            const geocodeResponse = await (
                await geocode
            ).getGeoCode(
                'The Meadow Park, 47-2, Lorong Makmur 5D off Persiaran AG, Bandar Agacia,c31910 Kampar, Perak'
            );
            expect(geocodeResponse.type).toBe('valid');
            switch (geocodeResponse.type) {
                case 'invalid':
                    throw new Error(
                        'Should be able to scrap the address for testing'
                    );
                case 'valid': {
                    const { latitude, longitude } = geocodeResponse.geocode;
                    expect(latitude).toBe(4.321202);
                    expect(longitude).toBe(101.12573);
                }
            }
        });
        it('should not return geolocation from bad address', async () => {
            expect((await (await geocode).getGeoCode('a')).type).toBe(
                'invalid'
            );
        });
    });

export default testGeocodeScrapper;
