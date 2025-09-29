# Setup Instructions

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install Playwright browsers:

   ```bash
   npx playwright install
   ```

3. Start Chromium with remote debugging:

   ```bash
   chromium --remote-debugging-port=9222
   ```

4. Add CDP_URL to .env file

5. Run `npm run testAndDescribe` - this will run the Playwright test then kick off a Claude Code session that describes the browser state.
