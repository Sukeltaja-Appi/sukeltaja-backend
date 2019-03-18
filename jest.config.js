const { defaults } = require('jest-config')

module.exports = {
  setupFilesAfterEnv: ['jest.testSetup.js'],
  "testEnvironment": "node",
  "coveragePathIgnorePatterns": [
    ...defaults.coveragePathIgnorePatterns,
    ".config.js",
    "middleware.js"
  ]
}
