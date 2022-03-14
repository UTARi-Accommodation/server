import scrapper from '../../src/scrapper/accommodation';

describe('Kampar', () => {
    const scrapped = scrapper('KP');
    it('should return an array of rooms', async () => {
        const { scrapRoom } = await scrapped;
        expect(Array.isArray(scrapRoom));
        expect(scrapRoom.length >= 0);
        expect(
            scrapRoom.every(({ accommodation: { type } }) => type === 'Room')
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
                ({ accommodation: { type } }) => type === 'Room'
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
                ({ accommodation: { type } }) => type === 'Unit'
            )
        ).toBe(true);
        expect(
            scrapHouse.every(
                ({ contact: { email, mobileNumber } }) => email || mobileNumber
            )
        ).toBe(true);
    });
    it('should return an array of apartment/condominium', async () => {
        const { scrapCondominium } = await scrapped;
        expect(Array.isArray(scrapCondominium));
        expect(scrapCondominium.length >= 0);
        expect(
            scrapCondominium.every(
                ({ accommodation: { type } }) => type === 'Unit'
            )
        ).toBe(true);
        expect(
            scrapCondominium.every(
                ({ contact: { email, mobileNumber } }) => email || mobileNumber
            )
        ).toBe(true);
    });
});
