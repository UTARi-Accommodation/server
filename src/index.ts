import express from 'express';
import { resolve } from 'path';
import mainScrapper from './scrapper/index';
import generalRouter from './router/general/index';
import visitorRouter from './router/visitor/index';
import bookmarkedRouter from './router/bookmarked/index';
import userRouter from './router/user/index';
import postgreSQL from './database/postgres';
import detailedRouter from './router/detailed/index';
import visitRouter from './router/visit/index';
import ratingRouter from './router/rating/index';
import contactRouter from './router/contact/index';

import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import timeScrap from './database/table/timeScrap/index';
import { CronJob } from 'cron';
import logger from './logger/index';

const { static: expressStatic, json, urlencoded } = express;

(() => {
    const build = '../client/build';

    try {
        new CronJob('00 00 00 * * *', async () => {
            const label = 'Scrapper time taken';
            console.time(label);

            const timeStarted = new Date();
            logger.log(`Scrapper started at time: ${timeStarted}`);

            await mainScrapper();

            const timeCompleted = new Date();
            logger.log(`Scrapper completed at time: ${timeCompleted}`);

            console.timeEnd(label);

            const scrapped = await timeScrap.insert(
                {
                    timeStarted,
                    timeCompleted,
                },
                postgreSQL.instance.pool
            );
            logger.log(scrapped);
        }).start();

        const app = (() => {
            const csrfMiddleware = csrf({ cookie: true });

            const app = express();
            app.use(json({ limit: '10mb' }));
            app.use(urlencoded({ extended: true }));

            app.use(expressStatic(resolve(build)));
            app.use(cookieParser());
            app.use(csrfMiddleware);

            const port = process.env.PORT || 5000;
            app.listen(port, () =>
                console.log(
                    `🚀 Express listening at port ${port} 🚀 at time: ${new Date()}`
                )
            );

            app.all('*', (req, res, next) => {
                res.cookie('XSRF-TOKEN', req.csrfToken());
                next();
            });

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
        rating.insert();

        const bookmarked = bookmarkedRouter(app);
        bookmarked.queryUnit();
        bookmarked.queryRoom();
        bookmarked.addBookmark();
        bookmarked.deleteBookmark();

        const user = userRouter(app);
        user.add();
        user.delete();

        app.get('*', (_, res) => res.sendFile(resolve(build, 'index.html')));
    } catch (error) {
        console.dir(error, { depth: null });
    }
})();
