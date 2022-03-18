import express from 'express';
import logger from '../../logger';

const antiCsrfRouter = (app: express.Application) => ({
    generate: () =>
        app.get('/api/csrf', (req, res) => {
            const csrfToken = req.csrfToken();
            logger.log({ csrfToken });
            res.send({
                csrfToken,
            });
        }),
});

export default antiCsrfRouter;
