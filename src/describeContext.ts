import { query } from "@anthropic-ai/claude-code";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.CDP_URL) {
  throw new Error("CDP_URL is not set");
}

export const describeContext = async (cdpUrl: string) => {
  const configJson = {
    browser: {
      isolated: false,
      browserName: "chromium",
      launchOptions: {
        channel: "chrome",
        headless: false,
      },
      cdpEndpoint: cdpUrl,
      contextOptions: {
        permissions: ["clipboard-read", "clipboard-write"],
      },
    },
    capabilities: ["core", "tabs", "install", "pdf", "vision"],
    imageResponses: "allow",
    saveTrace: true,
  };

  const absolutePathToConfig = path.join(__dirname, "config.json");
  fs.writeFileSync(absolutePathToConfig, JSON.stringify(configJson, null, 2));

  console.log("Writing config to", absolutePathToConfig);
  // Pass to Claude Code to describe the page
  const abortController = new AbortController();
  const response = await query({
    prompt: `Describe the page that is open. Do not open any new tabs, only read the existing tabs.`,
    options: {
      model: "opus",
      customSystemPrompt:
        "Look at the browser page that is open with Playwright MCP and describe what you see. What domain is the page on?",
      abortController,
      permissionMode: "bypassPermissions",
      mcpServers: {
        playwright: {
          type: "stdio",
          command: "npx",
          args: ["@playwright/mcp@latest", "--config", absolutePathToConfig],
        },
      },
    },
  });

  // Collect Claude's analysis
  let suggestion = "";
  messageLoop: for await (const message of response) {
    switch (message.type) {
      case "assistant":
        if (
          "content" in message.message &&
          Array.isArray(message.message.content)
        ) {
          console.log(message.message.content);
          const textContent = message.message.content.find(
            (c: any) => c.type === "text"
          );
          if (textContent && "text" in textContent) {
            suggestion = textContent.text;
          }
        }

        break;
      case "result":
        if ("is_error" in message && message.is_error) {
          console.log("⚠️ Claude Code encountered an error during analysis");
          break messageLoop;
        }
        break;
    }
  }
};

describeContext(process.env.CDP_URL);
