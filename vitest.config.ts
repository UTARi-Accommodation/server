import fs from 'fs';
import { defineConfig } from 'vitest/config';
import ci from 'ci-info';

export default defineConfig(() => {
    const timeout = 100_000;
    const env = ci.isCI
        ? {}
        : fs
              .readFileSync('.env.test', {
                  encoding: 'utf-8',
              })
              .split('\n')
              .filter(Boolean)
              .reduce((prev, keyValuePair) => {
                  const [key, value] = keyValuePair.split('=');
                  return {
                      ...prev,
                      [key]: value,
                  };
              }, {} as Record<string, string>);

    return {
        test: {
            watch: false,
            testTimeout: timeout,
            hookTimeout: timeout,
            include: ['test/index.ts'],
            env: Object.entries(env).reduce(
                (config, [key, value]) => ({
                    ...config,
                    [key]: value,
                }),
                {} as Record<string, string>
            ),
        },
    };
});
