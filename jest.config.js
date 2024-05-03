const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  rootDir: compilerOptions.rootDir,
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
