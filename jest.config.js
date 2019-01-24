const { defaults } = require('jest-config')

module.exports = {
  "testEnvironment": "node",
  "coveragePathIgnorePatterns": [
    ...defaults.coveragePathIgnorePatterns,
    ".config.js",
    "middleware.js"
  ]
}
