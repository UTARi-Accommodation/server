import { detailedRoom } from '../../api/query/room';
import { detailedUnit } from '../../api/query/unit';
import postgreSQL from '../../database/postgres';
import express from 'express';
import logger from '../../logger/index';
import { auth } from '../../auth/firebase';
import { parseAsString } from 'parse-dont-validate';

const detailedRouter = (app: express.Application) => ({
    queryUnit: () =>
        app.get('/api/detailed-unit', async (req, res) => {
            if (req.method !== 'GET') {
                throw new Error('Only accept GET request');
            } else {
                const { query } = req;

                const token = parseAsString(query.token).orElseGetUndefined();
                const verifiedId = token
                    ? await auth.verifyIdToken(token)
                    : { uid: '' };
                const userId = verifiedId.uid;

                const id =
                    typeof query.id === 'string'
                        ? parseInt(query.id)
                        : undefined;

                if (!id) {
                    const result = {
                        unit: undefined,
                    };
                    logger.log(result);
                    res.status(400).json(result);
                } else {
                    if (userId) {
                        const result = {
                            unit: await detailedUnit.selectWithUser(
                                { id, userId },
                                postgreSQL.instance.pool
                            ),
                        };
                        logger.log(result);
                        res.status(200).json(result);
                    } else {
                        const result = {
                            unit: await detailedUnit.select(
                                { id },
                                postgreSQL.instance.pool
                            ),
                        };
                        logger.log(result);
                        res.status(200).json(result);
                    }
                }
            }
        }),
    queryRoom: () =>
        app.get('/api/detailed-room', async (req, res) => {
            if (req.method !== 'GET') {
                throw new Error('Only accept GET request');
            } else {
                const { query } = req;

                const token = parseAsString(query.token).orElseGetUndefined();
                const verifiedId = token
                    ? await auth.verifyIdToken(token)
                    : { uid: '' };
                const userId = verifiedId.uid;

                const id =
                    typeof query.id === 'string'
                        ? parseInt(query.id)
                        : undefined;

                if (!id) {
                    const result = {
                        room: undefined,
                    };
                    logger.log(result);
                    res.status(400).json(result);
                } else {
                    if (userId) {
                        const result = {
                            room: await detailedRoom.selectWithUser(
                                { id, userId },
                                postgreSQL.instance.pool
                            ),
                        };
                        logger.log(result);
                        res.status(200).json(result);
                    } else {
                        const result = {
                            room: await detailedRoom.select(
                                { id },
                                postgreSQL.instance.pool
                            ),
                        };
                        logger.log(result);
                        res.status(200).json(result);
                    }
                }
            }
        }),
});

export default detailedRouter;
