import { build } from 'esbuild';
import dotenv from 'dotenv';
import child from 'child_process';

dotenv.config({});

const isDev = process.env.NODE_ENV === 'development';

(() =>
    build({
        entryPoints: ['src/index.ts'],
        outfile: 'build/index.js',
        bundle: true,
        minify: true,
        minifyWhitespace: true,
        platform: 'node',
        define: {
            'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
        },
        logLevel: 'silent',
        watch: !isDev
            ? undefined
            : {
                  onRebuild: (error, result) => {
                      console.log(error ?? result);
                  },
              },
        target: 'node16.13.1',
        external: ['pg-native'],
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
