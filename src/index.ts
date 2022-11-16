import express from 'express';
import cors from 'cors';
import { CronJob } from 'cron';
import cookieParser from 'cookie-parser';
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
import { parseAsStringEnv } from './util/parse-env';

const { json, urlencoded } = express;

(async () => {
    try {
        new CronJob('00 00 00 * * *', accommodationScrapper).start();

        const app = (() => {
            const middleWares = [
                json({ limit: '10mb' }),
                urlencoded({ extended: true }),
                cookieParser(),
                cors({
                    origin: parseAsStringEnv({
                        env: process.env.ORIGIN,
                        name: 'ORIGIN',
                    }),
                    credentials: true,
                }),
            ];

            const app = express();
            app.use(middleWares);
            const port = process.env.PORT || 5000;
            app.listen(port, () =>
                logger.log(`🚀 Express listening at port ${port} 🚀`)
            );
            return app;
        })();

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
        rating.add();
        rating.delete();

        const bookmarked = bookmarkedRouter(app);
        bookmarked.queryUnit();
        bookmarked.queryRoom();
        bookmarked.add();
        bookmarked.delete();

        const user = userRouter(app);
        user.add();
        user.delete();

        const invalid = invalidRouter(app);
        invalid.fact();
    } catch (error) {
        logger.log(error);
    }
})();
