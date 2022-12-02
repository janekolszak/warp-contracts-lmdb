module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  moduleFileExtensions: ['ts', 'js'],

  testPathIgnorePatterns: [
    "/.yalc/",
    "/data/",
    "/_helpers",
    "src/__tests__/utils.ts",
  ],

  testEnvironment: 'node',

  "transformIgnorePatterns": [
    "<rootDir>/node_modules/(?!@assemblyscript/.*)"
  ],


  transform: {
    '^.+\\.(ts|js)$': 'ts-jest'
  }
};
