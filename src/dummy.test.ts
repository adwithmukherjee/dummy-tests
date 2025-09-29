import { test } from "./baseTest";
import { expect } from "@playwright/test";

test.describe("Dummy Test Suite", () => {
  test("successful dummy test using baseTest context", async ({ page }) => {
    // Navigate to example.com
    await page.goto("https://www.google.com");

    await expect(page).toHaveTitle(/Google/);
  });
});
