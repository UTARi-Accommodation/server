import * as fs from 'fs';
import dotenv from 'dotenv';
import { parseAsEnv } from 'esbuild-env-parsing';

(() => {
    dotenv.config({});
    fs.writeFile(
        'pgTyped.json',
        JSON.stringify(
            {
                transforms: [
                    {
                        mode: 'sql',
                        include: '**/*.sql',
                        emitTemplate: '{{dir}}/{{name}}.queries.ts',
                    },
                ],
                srcDir: 'src/',
                failOnError: true,
                camelCaseColumnNames: false,
                db: {
                    user: parseAsEnv({
                        env: process.env.PGUSER,
                        name: 'pguser',
                    }),
                    host: parseAsEnv({
                        env: process.env.PGHOST,
                        name: 'pghost',
                    }),
                    dbName: parseAsEnv({
                        env: process.env.PGDATABASE,
                        name: 'pgdatabase',
                    }),
                    password: parseAsEnv({
                        env: process.env.PGPASSWORD,
                        name: 'pgpassword',
                    }),
                    port: parseInt(
                        parseAsEnv({
                            env: process.env.PGPORT,
                            name: 'pgport',
                        })
                    ),
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
