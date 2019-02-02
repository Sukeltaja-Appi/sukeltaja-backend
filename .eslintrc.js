module.exports = {
  "env": {
    "node": true,
    "jest": true
  },
  "extends": "eslint:recommended",
  "parser": "babel-eslint",
  "rules": {
    "no-console": "off",
    "indent": [
      "error", 2, { "SwitchCase": 1 }
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
      "error", "single", { "avoidEscape": true }
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
    ],
    "no-multi-spaces": "error",
    "comma-spacing": [
      "error", { "before": false, "after": true }
    ],
    "no-multiple-empty-lines": [
      "error", { "max": 1 }
    ],
    "padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: "*", next: "return" },
      { blankLine: "always", prev: ["const", "let", "var"], next: "*"},
      { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"]}
    ],
    "operator-linebreak": [
      "error",
      "before"
    ],
    "max-len": [
      "error", { "code": 120 }
    ],
  }
}
