import { build } from 'esbuild';
import dotenv from 'dotenv';
import { config, generateEnvs } from './shared';
import child from 'child_process';
import { parseAsStringEnv } from '../../src/util/parse-env';

const main = () => {
    dotenv.config();
    const isDev =
        parseAsStringEnv({
            env: process.env.NODE_ENV,
            name: 'NODE_ENV',
        }) === 'development';
    build({
        ...config({
            entryPoint: 'src/index.ts',
            outfile: 'build/index.js',
        }),
        define: generateEnvs(
            [
                'NODE_ENV',
                'ORIGIN',
                'PGUSER',
                'PGHOST',
                'PGDATABASE',
                'PGPASSWORD',
                'PGPORT',
                'EMAIL',
                'PASS',
                'FIREBASE_TYPE',
                'FIREBASE_KEY',
                'FIREBASE_PROJECT_ID',
                'FIREBASE_KEY_ID',
                'FIREBASE_CLIENT_EMAIL',
                'FIREBASE_CLIENT_ID',
                'FIREBASE_AUTH_URI',
                'FIREBASE_TOKEN_URI',
                'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
                'FIREBASE_CLIENT_X509_CERT_URL',
                isDev ? '' : 'DATABASE_URL',
            ].filter(Boolean)
        ),
        watch: !isDev
            ? undefined
            : {
                  onRebuild: (error, result) => console.log(error ?? result),
              },
        plugins: !isDev
            ? undefined
            : [
                  (() => {
                      let server: undefined | child.ChildProcess = undefined;
                      return {
                          name: 'express',
                          setup: (build) => {
                              build.onStart(() => {
                                  if (server) {
                                      console.log('Restarting Server...');
                                      process.kill(-server.pid);
                                  }
                              });
                              build.onEnd(() => {
                                  if (server) {
                                      console.log('Restarted Server...');
                                  }
                                  server = child.spawn('make', ['serve']);
                                  server.stdout.setEncoding('utf-8');
                                  server.stdout.on('data', console.log);
                                  server.stderr.setEncoding('utf-8');
                                  server.stderr.on('data', console.error);
                              });
                          },
                      };
                  })(),
              ],
    })
        .then((r) => {
            console.dir(r);
            console.log('Build succeeded');
        })
        .catch((e) => {
            console.log('Error building:', e.message);
        });
};

main();
