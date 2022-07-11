import testGetCentralGeocode from './api/geocode/geocode';

import testComputeAddressScore from './api/madm/computation/address';
import testComputeContactScore from './api/madm/computation/contact';
import testComputeFacilitiesScore from './api/madm/computation/facilities';
import testComputeRatingScore from './api/madm/computation/rating';
import testComputeRemarkScore from './api/madm/computation/remark';
import testComputeTimeScore from './api/madm/computation/time';
import testComputeVisitCountScore from './api/madm/computation/visitCount';

import testMultiAttributeDecisionModelRoom from './api/madm/sort/madmSortRoom';
import testMultiAttributeDecisionModelUnit from './api/madm/sort/madmSortUnit';

import testRoomMutation from './api/mutation/room';
import testTimeScrapMutation from './api/mutation/timeScrap';
import testUnitMutation from './api/mutation/unit';
import testUserMutation from './api/mutation/user';
import testVisitorMutation from './api/mutation/visitor';

import testEmptyContactPopulation from './api/populate/emptyContact';
import testRoomPopulate from './api/populate/room';
import testUnitPopulate from './api/populate/unit';

import testUnitQuery from './api/query/unit';
import testRoomQuery from './api/query/room';

import {
    testBandarTunHusseinOnnScrapper,
    testKamparScrapper,
    testSungaiLongScrapper,
} from './scrapper/accommodation';
import testGeocodeScrapper from './scrapper/geocode';
import postgreSQL from '../src/database/postgres';
import reset from './script/reset';

const tests: ReadonlyArray<readonly [() => void, 'only'?]> = [
    [testGetCentralGeocode],
    [testComputeAddressScore],
    [testComputeContactScore],
    [testComputeFacilitiesScore],
    [testComputeRatingScore],
    [testComputeRemarkScore],
    [testComputeTimeScore],
    [testComputeVisitCountScore],

    [testMultiAttributeDecisionModelUnit],
    [testMultiAttributeDecisionModelRoom],

    [testUnitMutation],
    [testRoomMutation],
    [testUserMutation],
    [testVisitorMutation],
    [testTimeScrapMutation],

    [testEmptyContactPopulation],
    [testRoomPopulate],
    [testUnitPopulate],

    [testUnitQuery],
    [testRoomQuery],

    [testGeocodeScrapper],
    [testBandarTunHusseinOnnScrapper],
    [testKamparScrapper],
    [testSungaiLongScrapper],
];

const selectedTests = tests.filter(([_, only]) => only);

if (process.env.IS_CI && selectedTests.length) {
    throw new Error('cannot have "only" in ci cd');
}

beforeAll(async () => {
    const { viewsAndFunctions, db } = await reset;
    await db(postgreSQL.instance.exec);
    await viewsAndFunctions(postgreSQL.instance.exec);
});

(!selectedTests.length ? tests : selectedTests).forEach(([test]) => test());

afterAll(postgreSQL.instance.close);
