module.exports = {
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "amd": true,
    "commonjs": true,
    "jest": true
  },
  "extends": "eslint:recommended",
  "parser": "babel-eslint",
  "rules": {
    "no-console": "off",
    "indent": [
      "error",
      2
    ],
    "globals": {
      "test": true,
      "expect": true,
      "describe": true
    },
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
}