import fs from 'fs';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => {
    const timeout = 100_000;
    const env = fs
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
