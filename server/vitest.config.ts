import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    coverage: {
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      lines: 60,
      functions: 60,
      branches: 60,
      statements: 60
    }
  }
});
