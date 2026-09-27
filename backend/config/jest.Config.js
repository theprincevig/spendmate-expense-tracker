/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  clearMocks: true,
  testPathIgnorePatterns: ["/node_modules/", "/frontend/"],
  collectCoverageFrom: ["controllers/**/*.js", "!**/node_modules/**"],
};
