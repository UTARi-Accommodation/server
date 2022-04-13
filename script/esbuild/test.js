import { build } from 'esbuild';
import dotenv from 'dotenv';
import { parseAsEnvs } from 'esbuild-env-parsing';
import config from './config.js';

dotenv.config({
    path: `${process.cwd()}/.env.test`,
});

(() =>
    build({
        ...config({
            entryPoint: 'test/index.ts',
            outfile: '__tests__/index.test.js',
        }),
        define: parseAsEnvs([
            'NODE_ENV',
            'PGUSER',
            'PGHOST',
            'PGDATABASE',
            'PGPASSWORD',
            'PGPORT',
            'MAPS_API_KEY',
        ]),
    })
        .then((r) => {
            console.dir(r);
            console.log('Build succeeded');
        })
        .catch((e) => {
            console.log('Error building:', e.message);
            process.exit(1);
        }))();
