import * as fs from 'fs';
import dotenv from 'dotenv';
import { parseAsStringEnv } from '../src/util/parse-env';

const main = () => {
    dotenv.config();
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
                        name: 'PGUSER',
                    }),
                    host: parseAsStringEnv({
                        env: process.env.PGHOST,
                        name: 'PGHOST',
                    }),
                    dbName: parseAsStringEnv({
                        env: process.env.PGDATABASE,
                        name: 'PGDATABASE',
                    }),
                    password: parseAsStringEnv({
                        env: process.env.PGPASSWORD,
                        name: 'PGPASSWORD',
                    }),
                    port: parseInt(
                        parseAsStringEnv({
                            env: process.env.PGPORT,
                            name: 'PGPORT',
                        })
                    ),
                },
            },
            undefined,
            4
        ),
        (error) =>
            error ? console.error(error) : console.log('generated pgTyped.json')
    );
};

main();
