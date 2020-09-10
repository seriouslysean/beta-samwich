module.exports = {
    env: {
        browser: false,
        node: true,
    },
    parserOptions: {
        ecmaVersion: 6,
    },
    extends: [
        'airbnb-base',
        'plugin:jsdoc/recommended',
    ],
    plugins: [
        'jsdoc',
    ],
    rules: {
        indent: ['error', 4],
    },
};
