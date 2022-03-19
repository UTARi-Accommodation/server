import { build } from 'esbuild';
import dotenv from 'dotenv';
import config from './config.js';

dotenv.config({});

(() =>
    build(
        config({
            entryPoint: 'src/scrapper/scrap.ts',
            outfile: 'build/scrap.js',
        })
    )
        .then((r) => {
            console.dir(r);
            console.log('Build succeeded');
        })
        .catch((e) => {
            console.log('Error building:', e.message);
            process.exit(1);
        }))();
