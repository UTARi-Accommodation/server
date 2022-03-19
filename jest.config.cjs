module.exports = {
    verbose: true,
    transform: {
        '^.+\\.(ts)$': 'ts-jest',
        '^.+\\.(js)$': 'babel-jest',
    },
    transformIgnorePatterns: [],
    testTimeout: 43200,
    moduleFileExtensions: ['json', 'ts', 'js', 'node'],
    coveragePathIgnorePatterns: ['node_modules'],
};