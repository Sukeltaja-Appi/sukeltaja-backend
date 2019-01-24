module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true,
        "amd": true,
        "commonjs":true,
        "jest":true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2017
    },
    "rules": {
        'no-console': 'off',
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ],
        "eqeqeq": "error",
        "no-trailing-spaces": "error",
        "object-curly-spacing": [
            "error",
            "always"
        ],
        "arrow-spacing": [
        "error", { "before": true, "after": true }
  ]
    }
};