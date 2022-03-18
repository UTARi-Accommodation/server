import express from 'express';
import { parseAsString } from 'parse-dont-validate';
import postgreSQL from '../../database/postgres';
import visitor from '../../database/table/visitor';
import logger from '../../logger';

const visitorRouter = (app: express.Application) => ({
    addNewVisitor: () =>
        app.put('/api/visitor', async (req, res) => {
            if (req.method !== 'PUT') {
                throw new Error('Only accept PUT request');
            } else {
                const { body } = req;

                const visitorId = parseAsString(
                    body.visitorId
                ).orElseGetUndefined();

                if (!visitorId) {
                    const result = {
                        message: 'visitorId is undefined',
                    };
                    logger.log(result);
                    res.status(400).json(result);
                } else {
                    const response = await visitor.insert(
                        {
                            id: visitorId,
                            timeCreated: new Date(),
                        },
                        postgreSQL.instance.pool
                    );
                    const result = {
                        message: `visitor ${response.type}`,
                    };
                    logger.log({
                        result,
                        response,
                    });
                    res.status(200).json(result);
                }
            }
        }),
});

export default visitorRouter;
