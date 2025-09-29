import { test as base, BrowserContext, Page } from "@playwright/test";
import { chromium } from "@playwright/test";

// Extend base test with custom fixtures
const test = base.extend<{
  context: BrowserContext;
}>({
  context: async ({}, use) => {
    const cdpUrl = process.env.CDP_URL;
    let context: BrowserContext;

    if (cdpUrl) {
      // Connect to existing Chrome instance
      console.log("Connecting to Chrome via CDP:", cdpUrl);
      const browser = await chromium.connectOverCDP(cdpUrl);

      const cdpClient = await browser.newBrowserCDPSession();
      const targets = await cdpClient.send("Target.getTargets");
      console.log("Targets:", targets);

      if (browser.contexts().length > 0) {
        console.log("Using existing browser context");
        context = browser.contexts()[0];
      } else {
        console.log("Creating new browser context");
        context = await browser.newContext();
      }

      if (!context) {
        throw new Error("No browser context found");
      }
    } else {
      throw new Error("CDP_URL is not set");
    }

    // Use the context in tests
    await use(context);

    // Do not close the context
  },
  page: async ({ context }, use) => {
    let page: Page;
    if (context.pages().length > 0) {
      console.log("Using existing page");
      page = context.pages()[0];
    } else {
      console.log("Creating new page");
      page = await context.newPage();
    }

    await use(page);
    // Do not close the page
  },
});

export { test };
