const config = ({ entryPoint, outfile }) => ({
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    minify: true,
    minifyWhitespace: true,
    platform: 'node',
    logLevel: 'silent',
    target: 'node16.13.1',
    external: ['pg-native'],
});

export default config;
