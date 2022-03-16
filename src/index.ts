import express from 'express';
import { resolve } from 'path';
import accommodationScrapper from './scrapper/index';
import generalRouter from './router/general/index';
import visitorRouter from './router/visitor/index';
import bookmarkedRouter from './router/bookmarked/index';
import userRouter from './router/user/index';
import detailedRouter from './router/detailed/index';
import visitRouter from './router/visit/index';
import ratingRouter from './router/rating/index';
import contactRouter from './router/contact/index';

import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import { CronJob } from 'cron';

const { static: expressStatic, json, urlencoded } = express;

(async () => {
    const build = '../client/build';
    const isDev = process.env.NODE_ENV === 'DEVELOPMENT';

    try {
        new CronJob(
            '00 00 00 * * *',
            async () => await accommodationScrapper()
        ).start();

        const app = (() => {
            const csrfMiddleware = csrf({ cookie: true });

            const app = express();
            app.use(json({ limit: '10mb' }));
            app.use(urlencoded({ extended: true }));
            if (isDev) {
                app.use(expressStatic(resolve(build)));
            }
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
        if (isDev) {
            app.get('*', (_, res) =>
                res.sendFile(resolve(build, 'index.html'))
            );
        }
    } catch (error) {
        console.dir(error, { depth: null });
    }
})();
