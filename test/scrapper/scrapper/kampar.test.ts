import scrapper from '../../../src/scrapper/scrapper/fetchParser';

describe('Kampar', () => {
    const scrapped = scrapper('KP');
    it('should return an array of rooms', async () => {
        const { scrapRoom } = await scrapped;
        expect(Array.isArray(scrapRoom));
        expect(scrapRoom.length >= 0);
        expect(
            scrapRoom.every(
                ({ accommodationType: { type } }) => type === 'Room'
            )
        ).toBe(true);
        expect(
            scrapRoom.every(
                ({ contact: { email, mobileNumber } }) => email || mobileNumber
            )
        ).toBe(true);
    });
    it('should return an array of roommates', async () => {
        const { scrapRoommate } = await scrapped;
        expect(Array.isArray(scrapRoommate));
        expect(scrapRoommate.length >= 0);
        expect(
            scrapRoommate.every(
                ({ accommodationType: { type } }) => type === 'Room'
            )
        ).toBe(true);
        expect(
            scrapRoommate.every(
                ({ contact: { email, mobileNumber } }) => email || mobileNumber
            )
        ).toBe(true);
    });
    it('should return an array of houses', async () => {
        const { scrapHouse } = await scrapped;
        expect(Array.isArray(scrapHouse));
        expect(scrapHouse.length >= 0);
        expect(
            scrapHouse.every(
                ({ accommodationType: { type } }) => type === 'Unit'
            )
        ).toBe(true);
        expect(
            scrapHouse.every(
                ({ contact: { email, mobileNumber } }) => email || mobileNumber
            )
        ).toBe(true);
    });
    it('should return an array of apartment/condominium', async () => {
        const { scrapApartmentCondominium } = await scrapped;
        expect(Array.isArray(scrapApartmentCondominium));
        expect(scrapApartmentCondominium.length >= 0);
        expect(
            scrapApartmentCondominium.every(
                ({ accommodationType: { type } }) => type === 'Unit'
            )
        ).toBe(true);
        expect(
            scrapApartmentCondominium.every(
                ({ contact: { email, mobileNumber } }) => email || mobileNumber
            )
        ).toBe(true);
    });
});
