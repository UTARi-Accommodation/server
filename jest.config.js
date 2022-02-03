const config = {
    verbose: true,
    transform: {
        '^.+\\.(ts)$': 'ts-jest',
        '^.+\\.(js)$': 'babel-jest',
    },
    transformIgnorePatterns: [],
    testTimeout: 43200,
};

export default config;
