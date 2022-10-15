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
import roomRating from '../../database/table/roomRating';
import unitRating from '../../database/table/unitRating';
import logger from '../../logger';

const ratingRouter = (app: express.Application) => ({
    add: () =>
        app.put('/api/rating', async (req, res) => {
            if (req.method !== 'PUT') {
                throw new Error('Only accept PUT request');
            } else {
                const { body } = req;

                const token = parseAsString(body.token).elseGet(undefined);

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
                        .elseGet(undefined),
                    type: parseAsCustomType<AccommodationType>(
                        body.type,
                        (type) => type === 'Unit' || type === 'Room'
                    ).elseGet(undefined),
                    rating: parseAsNumber(body.rating)
                        .inRangeOf(1, 5)
                        .elseGet(undefined),
                })).elseGet(undefined);

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
                        case undefined: {
                            const result = {
                                message: 'rating not added',
                            };
                            logger.log(result);
                            res.status(400).json(result);
                            break;
                        }
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
                    }
                }
            }
        }),
    delete: () =>
        app.delete('/api/rating', async (req, res) => {
            if (req.method !== 'DELETE') {
                throw new Error('Only accept DELETE request');
            } else {
                const { query } = req;

                const token = parseAsString(query.token).elseGet(undefined);

                if (!token) {
                    const result = {
                        message: `token is ${token} and is not a valid token`,
                    };
                    logger.log(result);
                    res.status(400).json(result);
                    return;
                }

                const verifiedId = await auth.verifyIdToken(token);

                const post = parseAsReadonlyObject(query, (query) => ({
                    userId: verifiedId.uid,
                    id: parseAsNumber(parseInt(query.id))
                        .inRangeOf(1, Number.MAX_VALUE)
                        .elseGet(undefined),
                    type: parseAsCustomType<AccommodationType>(
                        query.type,
                        (type) => type === 'Unit' || type === 'Room'
                    ).elseGet(undefined),
                })).elseGet(undefined);

                if (!post) {
                    const result = {
                        message: 'body is undefined',
                    };
                    logger.log(result);
                    res.status(400).json(result);
                    return;
                }

                const { userId, id, type } = post;

                if (!id) {
                    const result = {
                        message: 'id is undefined',
                    };
                    logger.log(result);
                    res.status(400).json(result);
                } else {
                    switch (type) {
                        case undefined: {
                            const result = {
                                message: 'rating not deleted',
                            };
                            logger.log(result);
                            res.status(400).json(result);
                            break;
                        }
                        case 'Room': {
                            const results = await roomRating.delete(
                                {
                                    room: id,
                                    user: userId,
                                },
                                postgreSQL.instance.pool
                            );
                            logger.log({
                                results,
                            });
                            res.status(200).json(
                                `all rating from user for room ${id} removed`
                            );
                            break;
                        }
                        case 'Unit': {
                            const results = await unitRating.delete(
                                {
                                    unit: id,
                                    user: userId,
                                },
                                postgreSQL.instance.pool
                            );
                            logger.log({
                                results,
                            });
                            res.status(200).json(
                                `all rating from user for unit ${id} removed`
                            );
                            break;
                        }
                    }
                }
            }
        }),
});

export default ratingRouter;
