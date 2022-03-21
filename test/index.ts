//api
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

//scrapper
import testBandarTunHusseinOnnScrapper from './scrapper/bandarTunHusseinOn';
import testGeocodeScrapper from './scrapper/geocode';
import testKamparScrapper from './scrapper/kampar';
import testSungaiLongScrapper from './scrapper/sungaiLong';
import postgreSQL from '../src/database/postgres';

(() => {
    testGetCentralGeocode();
    testComputeAddressScore();
    testComputeContactScore();
    testComputeFacilitiesScore();
    testComputeRatingScore();
    testComputeRemarkScore();
    testComputeTimeScore();
    testComputeVisitCountScore();

    testMultiAttributeDecisionModelUnit();
    testMultiAttributeDecisionModelRoom();

    testRoomMutation();
    testTimeScrapMutation();
    testUnitMutation();
    testUserMutation();
    testVisitorMutation();

    testEmptyContactPopulation();
    testRoomPopulate();
    testUnitPopulate();

    testUnitQuery();
    testRoomQuery();

    testBandarTunHusseinOnnScrapper();
    testGeocodeScrapper();
    testKamparScrapper();
    testSungaiLongScrapper();

    afterAll(async () => {
        await postgreSQL.instance.close();
    });
})();
