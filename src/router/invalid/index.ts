import express, { Response } from 'express';
import child from 'child_process';
import logger from '../../logger';

const invalidRouter = (app: express.Application) => {
    const respond = (res: Response, data: string) => {
        const json = JSON.parse(data)[0];
        logger.log(json);
        res.status(404).json(json);
    };
    return {
        fact: () =>
            app.all('*', (_, res) => {
                const command = `
                    curl 'https://api.api-ninjas.com/v1/facts?limit=1' \
                    -H 'authority: api.api-ninjas.com' \
                    -H 'accept: */*' \
                    -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36' \
                    -H 'content-type: application/json' \
                    -H 'sec-gpc: 1' \
                    -H 'origin: https://api-ninjas.com' \
                    -H 'sec-fetch-site: same-site' \
                    -H 'sec-fetch-mode: cors' \
                    -H 'sec-fetch-dest: empty' \
                    -H 'referer: https://api-ninjas.com/' \
                    -H 'accept-language: en-US,en;q=0.9' \
                    --compressed
                `;
                const { stdout, stderr } = child.exec(command);
                if (stdout) {
                    stdout.on('data', (data) => respond(res, data));
                } else if (stderr) {
                    stderr?.on('data', (data) => respond(res, data));
                } else {
                    respond(res, 'No more facts for now');
                }
            }),
    };
};

export default invalidRouter;
