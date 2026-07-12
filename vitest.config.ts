import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["lib/measurement/__tests__/**/*.test.ts"],
    environment: "node",
  },
});
