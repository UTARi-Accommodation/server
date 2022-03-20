import * as fs from 'fs';
import dotenv from 'dotenv';

(() => {
    dotenv.config({});
    fs.writeFile(
        'pgTyped.json',
        JSON.stringify(
            {
                extends: './db.json',
                transforms: [
                    {
                        mode: 'sql',
                        include: '**/*.sql',
                        emitTemplate: '{{dir}}/{{name}}.queries.ts',
                    },
                ],
                srcDir: './src/',
                failOnError: true,
                camelCaseColumnNames: false,
                db: {
                    host: process.env.PGHOST,
                    user: process.env.PGUSER,
                    dbName: process.env.PGDATABASE,
                    password: process.env.PGPASSWORD,
                    port: parseInt(process.env.PGPORT ?? `${5432}`),
                },
            },
            null,
            4
        ),
        (err) => {
            if (err) {
                console.error(err);
            }
        }
    );
})();
