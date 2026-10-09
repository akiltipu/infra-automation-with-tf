import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./browser-tests",
  timeout: 120000,
  workers: 2,
  use: {
    actionTimeout: 10000,
    baseURL: "http://127.0.0.1:4173/infra-automation-with-tf/",
    launchOptions: process.env.CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.CHROMIUM_EXECUTABLE }
      : {},
  },
  webServer: {
    command: "node scripts/serve-export.mjs",
    url: "http://127.0.0.1:4173/infra-automation-with-tf/",
    reuseExistingServer: false,
  },
  reporter: "list",
});
