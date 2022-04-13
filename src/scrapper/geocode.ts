import { Client } from '@googlemaps/google-maps-services-js';
import { parseAsEnv } from 'esbuild-env-parsing';

const client = new Client({});

const geocode = {
    getGeoCode: async (address: string) => {
        const {
            data: { results },
        } = await client.geocode({
            params: {
                address,
                key: parseAsEnv({
                    env: process.env.MAPS_API_KEY,
                    name: 'Maps Api Key',
                }),
            },
        });
        const [result] = results;
        if (!result) {
            throw new Error(
                `Result from results is undefined for address ${address}`
            );
        }
        const {
            geometry: {
                location: { lat, lng },
            },
        } = result;
        return {
            latitude: parseFloat(lat.toFixed(6)),
            longitude: parseFloat(lng.toFixed(6)),
        };
    },
};

export default geocode;
