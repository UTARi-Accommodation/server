const config = {
    verbose: true,
    transform: {
        '^.+\\.(ts)$': 'ts-jest',
        '^.+\\.(js)$': 'babel-jest',
    },
    transformIgnorePatterns: [],
    testTimeout: 43200,
    moduleFileExtensions: ['json', 'ts', 'js', 'node'],
    coveragePathIgnorePatterns: ['node_modules', 'src/scrapper/geocode.ts'],
};

export default config;
