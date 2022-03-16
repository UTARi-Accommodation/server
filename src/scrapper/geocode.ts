import { Client } from '@googlemaps/google-maps-services-js';
import dotenv from 'dotenv';
import { parseAsString } from 'parse-dont-validate';

const client = new Client({});

dotenv.config({});

const geocode = {
    getGeoCode: async (address: string) => {
        const {
            data: { results },
        } = await client.geocode({
            params: {
                address,
                key: parseAsString(process.env.MAPS_API_KEY).orElseThrowDefault(
                    'Maps Api Key'
                ),
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
