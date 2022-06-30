const config = ({ entryPoint, outfile }) => {
    const env = process.env.NODE_ENV;
    return {
        entryPoints: [entryPoint],
        outfile,
        bundle: true,
        minify: true,
        minifyWhitespace: true,
        sourcemap: env === 'development' || env === 'test',
        platform: 'node',
        logLevel: 'silent',
        target: 'node16.13.1',
        external: ['pg-native'],
    };
};

export default config;
