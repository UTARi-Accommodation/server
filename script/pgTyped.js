import * as fs from 'fs';
import dotenv from 'dotenv';
import { parseAsNumEnv, parseAsStringEnv } from 'esbuild-env-parsing';

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
                    user: parseAsStringEnv({
                        env: process.env.PGUSER,
                        name: 'pguser',
                    }),
                    host: parseAsStringEnv({
                        env: process.env.PGHOST,
                        name: 'pghost',
                    }),
                    dbName: parseAsStringEnv({
                        env: process.env.PGDATABASE,
                        name: 'pgdatabase',
                    }),
                    password: parseAsStringEnv({
                        env: process.env.PGPASSWORD,
                        name: 'pgpassword',
                    }),
                    port: parseAsNumEnv({
                        env: process.env.PGPORT,
                        name: 'pgport',
                    }),
                },
            },
            null,
            4
        ),
        (error) =>
            error ? console.error(error) : console.log('generated pgTyped.json')
    );
})();
