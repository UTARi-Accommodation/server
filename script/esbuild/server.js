import { build } from 'esbuild';
import dotenv from 'dotenv';
import child from 'child_process';
import config from './config.js';
import { parseAsEnvs, parseAsStringEnv } from 'esbuild-env-parsing';

dotenv.config({});

const isDev =
    parseAsStringEnv({
        env: process.env.NODE_ENV,
        name: 'node env',
    }) === 'development';

(() =>
    build({
        ...config({
            entryPoint: 'src/index.ts',
            outfile: 'build/index.js',
        }),
        define: parseAsEnvs(
            [
                'NODE_ENV',
                'ORIGIN',
                'PGUSER',
                'PGHOST',
                'PGDATABASE',
                'PGPASSWORD',
                'PGPORT',
                'MAPS_API_KEY',
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
                      let serverPid = undefined;
                      return {
                          name: 'express',
                          setup: (build) => {
                              build.onStart(() => {
                                  if (serverPid !== undefined) {
                                      child.exec(`kill ${serverPid}`);
                                  }
                              });
                              build.onEnd(() => {
                                  const { stdout, stderr, pid } = child.exec(
                                      'make serve',
                                      (error, stdout, stderr) => {
                                          console.log(
                                              `serve stdout: ${stdout}`
                                          );
                                          console.error(
                                              `serve stderr: ${stderr}`
                                          );
                                          if (error !== null) {
                                              console.log(
                                                  `serve error: ${error}`
                                              );
                                          }
                                      }
                                  );
                                  stdout.on('data', (data) =>
                                      console.log(data)
                                  );
                                  stderr.on('data', (data) =>
                                      console.log(data)
                                  );
                                  serverPid = pid + 2;
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
            process.exit(1);
        }))();
