import getCentralGeocode from '../../../src/api/geocode';
import { describe, it, expect } from 'vitest';

const testGetCentralGeocode = () =>
    describe('Central geocode computer', () => {
        it('should compute the center point if an array of geocode is provided', () => {
            expect(
                getCentralGeocode(
                    [
                        { latitude: 4.327358, longitude: 101.135041 },
                        { latitude: 4.337368, longitude: 101.153528 },
                        { latitude: 4.327884, longitude: 101.152893 },
                        { latitude: 4.320438, longitude: 101.133256 },
                        { latitude: 4.321877, longitude: 101.132741 },
                        { latitude: 4.318742, longitude: 101.14151 },
                        { latitude: 4.318549, longitude: 101.128537 },
                        { latitude: 4.328001, longitude: 101.140715 },
                        { latitude: 4.325226, longitude: 101.146049 },
                        { latitude: 4.325075, longitude: 101.136875 },
                        { latitude: 4.338206, longitude: 101.151955 },
                        { latitude: 4.327358, longitude: 101.135041 },
                        { latitude: 4.32509, longitude: 101.145125 },
                        { latitude: 4.338685, longitude: 101.151195 },
                        { latitude: 4.320708, longitude: 101.123535 },
                        { latitude: 4.320708, longitude: 101.123535 },
                        { latitude: 4.320708, longitude: 101.123535 },
                    ],
                    'KP'
                )
            ).toStrictEqual({
                lat: 4.325998949847699,
                lng: 101.13853322800641,
            });
        });
        it('should return default region central geocode if empty array is given', () => {
            expect(getCentralGeocode([], 'KP')).toStrictEqual({
                lat: 4.340067,
                lng: 101.14298,
            });
            expect(getCentralGeocode([], 'BTHO')).toStrictEqual({
                lat: 3.040439,
                lng: 101.794537,
            });
            expect(getCentralGeocode([], 'SL')).toStrictEqual({
                lat: 3.040439,
                lng: 101.794537,
            });
        });
    });

export default testGetCentralGeocode;
