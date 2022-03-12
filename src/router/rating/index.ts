import express from 'express';
import {
    parseAsCustomType,
    parseAsNumber,
    parseAsReadonlyObject,
    parseAsString,
} from 'parse-dont-validate';
import { AccommodationType } from 'utari-common';
import { auth } from '../../auth/firebase';
import postgreSQL from '../../database/postgres';
import roomRating from '../../database/table/roomRating/index';
import unitRating from '../../database/table/unitRating/index';
import logger from '../../logger/index';

const ratingRouter = (app: express.Application) => ({
    insert: () =>
        app.put('/api/rating', async (req, res) => {
            if (req.method !== 'PUT') {
                throw new Error('Only accept PUT request');
            } else {
                const { body } = req;

                const token = parseAsString(body.token).orElseGetUndefined();

                if (!token) {
                    const result = {
                        message: `token is ${token} and is not a valid token`,
                    };
                    logger.log(result);
                    res.status(400).json(result);
                    return;
                }

                const verifiedId = await auth.verifyIdToken(token);

                const post = parseAsReadonlyObject(body, (body) => ({
                    userId: verifiedId.uid,
                    id: parseAsNumber(parseInt(body.id))
                        .inRangeOf(1, Number.MAX_VALUE)
                        .orElseGetUndefined(),
                    type: parseAsCustomType<AccommodationType>(
                        body.type,
                        (type) => type === 'Unit' || type === 'Room'
                    ).orElseGetUndefined(),
                    rating: parseAsNumber(body.rating)
                        .inRangeOf(1, 5)
                        .orElseGetUndefined(),
                })).orElseGetUndefined();

                if (!post) {
                    const result = {
                        message: 'body is undefined',
                    };
                    logger.log(result);
                    res.status(400).json(result);
                    return;
                }

                const { userId, id, type, rating } = post;

                if (!id) {
                    const result = {
                        message: 'id is undefined',
                    };
                    logger.log(result);
                    res.status(400).json(result);
                } else if (!rating) {
                    const result = {
                        message: 'rating is out of range',
                    };
                    logger.log(result);
                    res.status(200).json(result);
                } else {
                    switch (type) {
                        case 'Room': {
                            const response = await roomRating.insert(
                                {
                                    room: id,
                                    rating,
                                    user: userId,
                                    timeCreated: new Date(),
                                },
                                postgreSQL.instance.pool
                            );
                            const result = {
                                rating,
                            };
                            logger.log({
                                response,
                                rating,
                            });
                            res.status(200).json(result);
                            break;
                        }
                        case 'Unit': {
                            const response = await unitRating.insert(
                                {
                                    unit: id,
                                    rating,
                                    user: userId,
                                    timeCreated: new Date(),
                                },
                                postgreSQL.instance.pool
                            );
                            const result = {
                                rating,
                            };
                            logger.log({
                                response,
                                rating,
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

export default ratingRouter;