import { build } from 'esbuild';
import { config, generateEnvs } from './shared';
import dotenv from 'dotenv';

const main = () => {
    dotenv.config();
    build({
        ...config({
            entryPoint: 'src/scrapper/scrap.ts',
            outfile: 'build/scrap.js',
        }),
        define: generateEnvs([
            'NODE_ENV',
            'PGUSER',
            'PGHOST',
            'PGDATABASE',
            'PGPASSWORD',
            'PGPORT',
        ]),
    })
        .then((r) => {
            console.dir(r);
            console.log('Build succeeded');
        })
        .catch((e) => {
            console.log('Error building:', e.message);
            process.exit(1);
        });
};

main();
