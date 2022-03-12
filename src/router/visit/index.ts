import express from 'express';
import {
    parseAsCustomType,
    parseAsNumber,
    parseAsReadonlyObject,
    parseAsString,
} from 'parse-dont-validate';
import { AccommodationType } from 'utari-common';
import postgreSQL from '../../database/postgres';
import roomVisit from '../../database/table/roomVisit/index';
import unitVisit from '../../database/table/unitVisit/index';
import logger from '../../logger/index';

const visitRouter = (app: express.Application) => ({
    add: () =>
        app.put('/api/visit', async (req, res) => {
            if (req.method !== 'PUT') {
                throw new Error('Only accept PUT request');
            } else {
                const { body } = req;

                const post = parseAsReadonlyObject(body, (body) => ({
                    visitorId: parseAsString(
                        body.visitorId
                    ).orElseGetUndefined(),
                    id: parseAsNumber(parseInt(body.id))
                        .inRangeOf(1, Number.MAX_VALUE)
                        .orElseGetUndefined(),
                    type: parseAsCustomType<AccommodationType>(
                        body.type,
                        (type) => type === 'Unit' || type === 'Room'
                    ).orElseGetUndefined(),
                })).orElseGetUndefined();

                if (!post) {
                    const result = {
                        message: 'body is undefined',
                    };
                    logger.log(result);
                    res.status(400).json(result);
                    return;
                }

                const { visitorId, id, type } = post;

                if (!visitorId) {
                    const result = {
                        message: 'visitorId is undefined',
                    };
                    logger.log(result);
                    res.status(400).json(result);
                } else if (!id) {
                    const result = {
                        message: 'id is undefined',
                    };
                    logger.log(result);
                    res.status(400).json(result);
                } else {
                    switch (type) {
                        case 'Room': {
                            const room = await roomVisit.insert(
                                {
                                    room: id,
                                    visitor: visitorId,
                                    timeCreated: new Date(),
                                },
                                postgreSQL.instance.pool
                            );
                            const result = {
                                message: 'success',
                            };
                            logger.log({
                                result,
                                room,
                            });
                            res.status(200).json(result);
                            break;
                        }
                        case 'Unit': {
                            const unit = await unitVisit.insert(
                                {
                                    unit: id,
                                    visitor: visitorId,
                                    timeCreated: new Date(),
                                },
                                postgreSQL.instance.pool
                            );
                            const result = {
                                message: 'success',
                            };
                            logger.log({
                                result,
                                unit,
                            });
                            res.status(200).json(result);
                            break;
                        }
                        case undefined: {
                            const result = {
                                message: 'visit not added',
                            };
                            logger.log(result);
                            res.status(400).json(result);
                        }
                    }
                }
            }
        }),
});

export default visitRouter;
