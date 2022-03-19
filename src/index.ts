import express from 'express';
import cors from 'cors';
import { CronJob } from 'cron';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';

import accommodationScrapper from './scrapper/index';
import generalRouter from './router/general/index';
import visitorRouter from './router/visitor/index';
import bookmarkedRouter from './router/bookmarked/index';
import userRouter from './router/user/index';
import detailedRouter from './router/detailed/index';
import visitRouter from './router/visit/index';
import ratingRouter from './router/rating/index';
import contactRouter from './router/contact/index';
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
                        sameSite: 'lax',
                        // ref: https://softwareengineering.stackexchange.com/questions/425184/how-do-you-set-cookies-on-frontend-from-the-backend
                        // ref: https://stackoverflow.com/questions/32354962/is-it-possible-to-share-cookies-between-subdomains
                        domain: process.env.DOMAIN,
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
