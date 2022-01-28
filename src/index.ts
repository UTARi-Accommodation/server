import express from 'express';
import { parseAsString } from 'parse-dont-validate';
import * as path from 'path';
import { Region } from './scrapper/scrapper/fetchParser';

const { static: expressStatic, json, urlencoded } = express;
const app = express();
const port = process.env.PORT || 5000;

app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true }));
app.listen(port, () => console.log(`🚀 Express listening at port ${port} 🚀`));

// may need to remove 'ALL'
const parseRegion = (s: string): Region => {
    switch (s) {
        case 'SL':
        case 'KP':
        case 'BTHO':
            return s;
    }
    throw new Error(`Expect s to be Region type, got "${s}" instead`);
};

const dummyUnit = [
    {
        id: 26767,
        handler: {
            handlerType: 'Owner',
            name: 'Chew Chu Yao',
        },
        contact: {
            mobileNumber: [
                {
                    mobileNumberType: 'Mobile',
                    contact: '0123038119',
                },
            ],
            email: ['moonsing@gmail.com'],
        },
        location: {
            address:
                '9, Jalan Bentara 8/5, Sek 5, Bandar Makhota Cheras 43200, Cheras, Selangor',
            coordinate: {
                latitude: 3.0094,
                longitude: 101.25,
            },
        },
        facilities: 'Cupboard, Fan, Air-Conditioner, Water Heater',
        remarks: {
            remark: 'Partial furnished double storey house, 3+1 rooms, 3 bathrooms with water heater, 2 air-conds, kitchen cabinet with stove, wardrobe in master bedroom and stainless steel grilles. View to appreciate',
            month: 'May',
            year: 2020,
        },
        properties: {
            bedRooms: 4,
            bathRooms: 3,
            rental: 1500,
        },
        rating: [4, 5, 1, 1, 3, 4],
        visitCount: 45,
    },
    {
        id: 26711,
        handler: {
            handlerType: 'Owner',
            name: 'Chew Chu Yao',
        },
        contact: {
            mobileNumber: [
                {
                    mobileNumberType: 'Mobile',
                    contact: '0133358899',
                },
                {
                    mobileNumberType: 'Mobile',
                    contact: '0124270766',
                },
            ],
            email: ['kelvin_lam@live.com'],
        },
        location: {
            address:
                'C-3-10, Mahkota Garden, Persiaran Residence, Bandar Mahkota Cheras, 43200, Cheras, Selangor',
            coordinate: {
                latitude: 3.07,
                longitude: 101.25,
            },
        },
        facilities:
            'Fan, Air-Conditioner, Parking Bay, Water Heater, Gym, swimming pool, sauna',
        remarks: {
            remark: 'MRT Feeder Bus and UTAR Bus available.3 min away from UTAR',
            month: 'May',
            year: 2020,
        },
        properties: {
            bedRooms: 3,
            bathRooms: 2,
            rental: 1000,
        },
        rating: [4, 3, 2, 1, 3, 4],
        visitCount: 15,
    },
    {
        id: 26588,
        handler: {
            handlerType: 'Owner',
            name: 'Chew Chu Yao',
        },
        contact: {
            mobileNumber: [
                {
                    mobileNumberType: 'Mobile',
                    contact: '0189611928',
                },
            ],
            email: ['cmei77@gmail.com'],
        },
        location: {
            address: 'A-33, Landmark Residence 1, 43000, Kajang, Selangor',
            coordinate: {
                latitude: 3.0094,
                longitude: 101.7755,
            },
        },
        facilities: 'Fan, Air-Conditioner, Parking Bay, Water Heater',
        remarks: {
            remark: '',
            month: 'January',
            year: 2020,
        },
        properties: {
            bedRooms: 3,
            bathRooms: 2,
            rental: 1400,
        },
        rating: [4, 5, 3, 4],
        visitCount: 13,
    },
    {
        id: 26491,
        handler: {
            handlerType: 'Owner',
            name: 'Chew Chu Yao',
        },
        contact: {
            mobileNumber: [
                {
                    mobileNumberType: 'Mobile',
                    contact: '01164070045',
                },
                {
                    mobileNumberType: 'Mobile',
                    contact: '0167432134',
                },
            ],
            email: ['swathijayanthi.1997@gmail.com'],
        },
        location: {
            address:
                'Unit No 10, 1st Floor, The Residence Condominum, Bandar Mahkota Cheras 43200, Kajang, Selangor',
            coordinate: {
                latitude: 2.9927,
                longitude: 101.7909,
            },
        },
        facilities:
            'Bed, Table/Chair, Cupboard, Fan, Air-Conditioner, Parking Bay, Internet, Washing Machine, Water Heater',
        remarks: {
            remark: 'The rental is negotiable, however not inclusive of utility bills; Prefer female (any nationality',
            month: 'January',
            year: 2021,
        },
        properties: {
            bedRooms: 3,
            bathRooms: 2,
            rental: 1400,
        },
        rating: [1, 2, 3, 4],
        visitCount: 132,
    },
];

app.get('/api/house', async (req, res) => {
    if (req.method === 'GET') {
        const region = parseRegion(
            parseAsString(req.query.region).orElseThrowDefault('region')
        );
        console.dir(req.query);
        res.status(200).json({ region, houses: dummyUnit });
    } else {
        throw new Error('Only accept GET request');
    }
});

app.get('/api/apartmentCondominium', async (req, res) => {
    if (req.method === 'GET') {
        const region = parseRegion(
            parseAsString(req.query.region).orElseThrowDefault('region')
        );
        res.status(200).json({ region, apartmentCondominiums: dummyUnit });
    } else {
        throw new Error('Only accept GET request');
    }
});

const dummyRoom = [
    {
        id: 26412,
        handler: {
            handlerType: 'Owner',
            name: 'Chew Chu Yao',
        },
        contact: {
            mobileNumber: [
                {
                    mobileNumberType: 'Mobile',
                    contact: '0167061671',
                },
            ],
            email: ['jialyaoshan@yahoo.com'],
        },
        address: '12-8, Taming Mutiara, 43200, Kajang, Selangor',
        facilities: 'Parking Bay, Water Heater',
        remarks: {
            remark: 'All utilities include wifi.Share among tenants.Price includes 2 carpark lots.Partially furnished.Whatsapp 016-7061671 if interested',
            month: 'January',
            year: 2020,
        },
        properties: {
            bedRooms: 3,
            bathRooms: 2,
            rental: 900,
        },
        rating: [1, 2, 3, 4, 5],
        visitCount: 100,
    },
    {
        id: 24658,
        handler: {
            handlerType: 'Owner',
            name: 'Chew Chu Yao',
        },
        contact: {
            mobileNumber: [
                {
                    mobileNumberType: 'Mobile',
                    contact: '0163361789',
                },
            ],
            email: ['joelow1789@yahoo.com'],
        },
        address:
            'Blk B06-09, Sutera Pines Condo, Jln Sutera Pines 43000, Kajang, Selangor',
        facilities:
            'Table/Chair, Fan, Parking Bay, Washing Machine, study / dining table (6�2.5ft), 3seater sofa settee',
        remarks: {
            remark: '2 parking bays; full access to clubhouse facilities; facilities can be negotiated pending rental',
            month: 'January',
            year: 2020,
        },
        properties: {
            bedRooms: 3,
            bathRooms: 2,
            rental: 1100,
        },
        rating: [1, 4, 4, 4, 5],
        visitCount: 25,
    },
    {
        id: 26388,
        handler: {
            handlerType: 'Owner',
            name: 'Chew Chu Yao',
        },
        contact: {
            mobileNumber: [
                {
                    mobileNumberType: 'Mobile',
                    contact: '0163232540',
                },
            ],
            email: ['waistacy@icloud.com'],
        },
        address:
            'B08-12, The I-Residence, Jalan Bendahara 38/7, Bandar Mahkota Cheras, 43200, Kajang, Selangor',
        facilities:
            'Bed, Table/Chair, Cupboard, Fan, Air-Conditioner, Parking Bay, Internet, Washing Machine, Water Heater, Sofa, coffee table, water dispenser, refrigerator, induction cooker, dining table, cleaning service',
        remarks: {
            remark: '',
            month: 'January',
            year: 2020,
        },
        properties: {
            bedRooms: 4,
            bathRooms: 2,
            rental: 1650,
        },
        rating: [1, 4, 4, 4, 5],
        visitCount: 20,
    },
];

app.get('/api/room', async (req, res) => {
    if (req.method === 'GET') {
        const region = parseRegion(
            parseAsString(req.query.region).orElseThrowDefault('region')
        );
        res.status(200).json({ region, rooms: dummyRoom });
    } else {
        throw new Error('Only accept GET request');
    }
});

app.get('/api/roommate', async (req, res) => {
    if (req.method === 'GET') {
        const region = parseRegion(
            parseAsString(req.query.region).orElseThrowDefault('region')
        );
        res.status(200).json({ region, roommates: dummyRoom });
    } else {
        throw new Error('Only accept GET request');
    }
});

const build = '../client/build';
app.use(expressStatic(path.resolve(build)));
app.get('*', (_, res) => {
    return res.sendFile(path.resolve(build, 'index.html'));
});
