import express from 'express';
import { parseAsReadonlyObject, parseAsString } from 'parse-dont-validate';
import { auth } from '../../auth/firebase';
import postgreSQL from '../../database/postgres';
import utariUser from '../../database/table/utariUser';
import logger from '../../logger';

const userRouter = (app: express.Application) => ({
    add: () =>
        app.post('/api/user', async (req, res) => {
            if (req.method !== 'POST') {
                throw new Error('Only accept POST request');
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
                    timeCreated: new Date(
                        parseAsString(body.timeCreated).elseLazyGet(
                            () => new Date(Date.now())
                        )
                    ),
                })).elseGet(undefined);

                if (!post) {
                    const result = {
                        message: 'post is undefined',
                    };
                    logger.log(result);
                    res.status(400).json(result);
                    return;
                }

                const { userId, timeCreated } = post;

                const user = await utariUser.insert(
                    {
                        id: userId,
                        timeCreated,
                    },
                    postgreSQL.instance.pool
                );
                switch (user.type) {
                    case 'created':
                        {
                            const result = {
                                message: 'user added',
                            };
                            logger.log({
                                result,
                                user,
                            });
                            res.status(200).json(result);
                        }
                        break;
                    case 'existed':
                        {
                            const result = {
                                message: 'user existed',
                            };
                            logger.log({
                                result,
                                user,
                            });
                            res.status(200).json(result);
                        }
                        break;
                }
            }
        }),
    delete: () =>
        app.delete('/api/user', async (req, res) => {
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

                const { uid: userId } = verifiedId;

                const user = await utariUser.softDelete(
                    {
                        id: userId,
                        timeDeleted: new Date(),
                    },
                    postgreSQL.instance.pool
                );
                const result = {
                    message: 'user deleted',
                };
                logger.log({
                    result,
                    user,
                });
                res.status(200).json(result);
            }
        }),
});

export default userRouter;
