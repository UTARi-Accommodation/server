import esbuild from 'esbuild';

const generateEnvs = (nonNullableKeys: ReadonlyArray<string>) => {
    const keys = Object.keys(process.env);
    const absentKeys = nonNullableKeys.filter((key) => !keys.includes(key));
    if (absentKeys.length) {
        throw new Error(`keys of ${absentKeys.join(', ')} is absent`);
    }
    return Object.entries(process.env).reduce(
        (prev, [key, value]) => ({
            ...prev,
            [`process.env.${key}`]: JSON.stringify(value),
        }),
        {} as Record<string, string>
    );
};

const config = ({ entryPoint, outfile }) =>
    ({
        entryPoints: [entryPoint],
        outfile,
        bundle: true,
        minify: true,
        minifyWhitespace: true,
        sourcemap: 'linked',
        platform: 'node',
        target: 'node16.13.1',
        external: ['pg-native'],
    } as esbuild.BuildOptions);

export { config, generateEnvs };
