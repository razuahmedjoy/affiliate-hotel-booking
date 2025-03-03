module.exports = {
    env: {
        node: true,
        es6: true,
        jest: true,
    },
    extends: [
        'airbnb-base',
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    rules: {
        'no-console': 'warn',
        'import/prefer-default-export': 'off',
        'no-unused-vars': ['warn', { argsIgnorePattern: 'next' }],
    },
};