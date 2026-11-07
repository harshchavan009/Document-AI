import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUTPUT_DIR = path.resolve(__dirname, "../docs/screenshots-polish");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "tablet", width: 820, height: 1180, isMobile: true },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

const THEMES = ["light", "dark"];
const SAMPLE_WS_ID = "dd8f1de2-dd2b-457f-9f2b-e53c287b9cc2";
const SAMPLE_DOC_ID = "225b6842-471d-494f-9558-83b9df536fae";

const TARGETS = [
  { path: "/", name: "landing" },
  { path: "/workspace", name: "workspace_home" },
  { path: "/workspace/documents", name: "document_library" },
  { path: "/workspace/research", name: "research_desk" },
  { path: `/documents/${SAMPLE_DOC_ID}`, name: "document_viewer" },
  { path: "/workspace/settings", name: "settings" },
  { path: "/docs", name: "docs" },
  { path: "/privacy", name: "privacy" },
  { path: "/terms", name: "terms" },
];

async function run() {
  console.log("Starting Polish Audit Screenshot Capture (9 routes x 3 viewports x 2 themes = 54 screenshots)...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  for (const theme of THEMES) {
    for (const vp of VIEWPORTS) {
      for (const target of TARGETS) {
        const page = await browser.newPage();
        await page.setViewport({
          width: vp.width,
          height: vp.height,
          isMobile: vp.isMobile,
          deviceScaleFactor: 2,
        });

        await page.evaluateOnNewDocument((th, wsId) => {
          localStorage.setItem("dm_theme", th);
          localStorage.setItem("dm_session_token", "demo_researcher_session");
          localStorage.setItem("dm_active_workspace", wsId);
          document.documentElement.setAttribute("data-theme", th);
          if (th === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }, theme, SAMPLE_WS_ID);

        const url = `http://localhost:5173${target.path}`;
        try {
          await page.goto(url, { waitUntil: "networkidle0", timeout: 15000 });
        } catch (e) {
          // Timeout acceptable on heavy assets
        }

        await page.evaluate((th) => {
          document.documentElement.setAttribute("data-theme", th);
          if (th === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }, theme);

        await new Promise((r) => setTimeout(r, 600));

        const filename = `polish_${target.name}_${vp.name}_${theme}.png`;
        await page.screenshot({ path: path.join(OUTPUT_DIR, filename), fullPage: false });
        console.log(`Captured: ${filename}`);

        await page.close();
      }
    }
  }

  await browser.close();
  console.log("Polish audit screenshot capture completed successfully.");
}

run().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
