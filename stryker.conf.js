/**
 * Stryker mutation testing configuration.
 */
module.exports = {
  mutate: [
    "client/src/**/*.ts",
    "client/src/**/*.tsx",
    "server/src/**/*.ts"
  ],
  testRunner: "vitest",
  coverageAnalysis: "off",
  vitest: {
    configFile: "vitest.config.ts",
    configFileDir: "."
  },
  reporters: ["progress", "clear-text"],
  thresholds: { high: 80, low: 60, break: 50 }
};
