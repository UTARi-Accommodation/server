import { Location, Center } from 'utari-common';

const getCentralGeocode = (
    geocodes: ReadonlyArray<Location['coordinate']>
): Center => {
    const total = geocodes.length;

    if (!total) {
        return undefined;
    }

    if (total === 1) {
        const [geocode] = geocodes;
        if (!geocode) {
            throw new Error(`geocode is undefined`);
        }
        const { latitude, longitude } = geocode;
        return {
            lat: latitude,
            lng: longitude,
        };
    }

    const { x, y, z } = geocodes.reduce(
        ({ x, y, z }, geocode) => {
            const latitude = (geocode.latitude * Math.PI) / 180;
            const longitude = (geocode.longitude * Math.PI) / 180;

            return {
                x: x + Math.cos(latitude) * Math.cos(longitude),
                y: y + Math.cos(latitude) * Math.sin(longitude),
                z: z + Math.sin(latitude),
            };
        },
        { x: 0, y: 0, z: 0 } as Readonly<{
            x: number;
            y: number;
            z: number;
        }>
    );

    const averageX = x / total;
    const averageY = y / total;
    const averageZ = z / total;

    const centralLongitude = Math.atan2(averageY, averageX);
    const centralSquareRoot = Math.sqrt(
        averageX * averageX + averageY * averageY
    );
    const centralLatitude = Math.atan2(averageZ, centralSquareRoot);

    return {
        lat: (centralLatitude * 180) / Math.PI,
        lng: (centralLongitude * 180) / Math.PI,
    };
};

export default getCentralGeocode;
