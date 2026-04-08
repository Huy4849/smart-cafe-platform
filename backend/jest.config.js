module.exports = {
    testEnvironment: 'node',
    collectCoverageFrom: ['src/**/*.js'],
    testMatch: ['**/tests/**/*.js', '**/?(*.)+(spec|test).js'],
    coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
};
