import express from 'express';
import cors from 'cors';
import { CronJob } from 'cron';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';

import accommodationScrapper from './scrapper/';
import generalRouter from './router/general/';
import visitorRouter from './router/visitor/';
import bookmarkedRouter from './router/bookmarked/';
import userRouter from './router/user/';
import detailedRouter from './router/detailed/';
import visitRouter from './router/visit/';
import ratingRouter from './router/rating/';
import contactRouter from './router/contact/';
import invalidRouter from './router/invalid';
import logger from './logger';
import antiCsrfRouter from './router/csrf';

const { json, urlencoded } = express;

(async () => {
    try {
        new CronJob(
            '00 00 00 * * *',
            async () => await accommodationScrapper()
        ).start();

        const app = (() => {
            const env = process.env.NODE_ENV;
            const isNotDev = env === 'production' || env === 'staging';
            const middleWares = [
                json({ limit: '10mb' }),
                urlencoded({ extended: true }),
                cors({
                    origin: process.env.ORIGIN,
                    credentials: true,
                }),
                cookieParser(),
                csurf({
                    cookie: {
                        httpOnly: true,
                        secure: isNotDev,
                        maxAge: 60 * 60 * 1000,
                        // ref: https://developers.google.com/search/blog/2020/01/get-ready-for-new-samesitenone-secure
                        sameSite: isNotDev ? 'none' : 'lax',
                    },
                }),
            ];

            const app = express();
            app.use(middleWares);
            app.set('trust proxy', 1);
            app.use((req, res, next) => {
                res.cookie('XSRF-TOKEN', req.csrfToken(), { secure: isNotDev });
                next();
            });
            const port = process.env.PORT || 5000;
            app.listen(port, () =>
                logger.log(`🚀 Express listening at port ${port} 🚀`)
            );
            return app;
        })();

        const antiCsrf = antiCsrfRouter(app);
        antiCsrf.generate();

        const visitor = visitorRouter(app);
        visitor.addNewVisitor();

        const general = generalRouter(app);
        general.queryUnit();
        general.queryRoom();

        const detailed = detailedRouter(app);
        detailed.queryUnit();
        detailed.queryRoom();

        const visit = visitRouter(app);
        visit.add();

        const contact = contactRouter(app);
        contact.sendEmail();

        const rating = ratingRouter(app);
        rating.insert();

        const bookmarked = bookmarkedRouter(app);
        bookmarked.queryUnit();
        bookmarked.queryRoom();
        bookmarked.addBookmark();
        bookmarked.deleteBookmark();

        const user = userRouter(app);
        user.add();
        user.delete();

        const invalid = invalidRouter(app);
        invalid.fact();
    } catch (error) {
        logger.log(error);
    }
})();
