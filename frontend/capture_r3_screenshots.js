import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUTPUT_DIR = path.resolve(__dirname, "../docs/screenshots-r3");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "tablet", width: 820, height: 1180, isMobile: true },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

const THEMES = ["light", "dark"];
const SAMPLE_DOC_ID = "225b6842-471d-494f-9558-83b9df536fae";
const SAMPLE_WS_ID = "dd8f1de2-dd2b-457f-9f2b-e53c287b9cc2";

const TARGETS = [
  { path: "/workspace/research", name: "research_desk" },
  { path: `/documents/${SAMPLE_DOC_ID}`, name: "document_viewer" },
];

async function run() {
  console.log("Starting Phase R3 screenshot capture with Google Chrome...");
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

        // Set storage before page initialization
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
        console.log(`Navigating to ${url} at ${vp.name} (${theme})...`);
        await page.goto(url, { waitUntil: "networkidle0", timeout: 15000 });

        await page.evaluate((th) => {
          document.documentElement.setAttribute("data-theme", th);
          if (th === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }, theme);

        if (target.name === "research_desk") {
          // Wait for sessions or suggested questions to populate
          await page.waitForSelector('[data-testid="session-item"]', { timeout: 4000 }).catch(() => {});
        } else {
          await new Promise((r) => setTimeout(r, 1000));
        }

        const filename = `r3_${target.name}_${vp.name}_${theme}.png`;
        await page.screenshot({ path: path.join(OUTPUT_DIR, filename), fullPage: false });
        console.log(`Captured: ${filename}`);

        // Capture active conversation thread & right panel reader on research desk (desktop)
        if (target.name === "research_desk" && vp.name === "desktop") {
          try {
            const sessionBtn = await page.$('[data-testid="session-item"]');
            if (sessionBtn) {
              await sessionBtn.click();
              await new Promise((r) => setTimeout(r, 1200));

              const threadFilename = `r3_research_thread_${vp.name}_${theme}.png`;
              await page.screenshot({ path: path.join(OUTPUT_DIR, threadFilename), fullPage: false });
              console.log(`Captured: ${threadFilename}`);

              // Switch right tab to "Document Page" to capture split reader view
              await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll("button"));
                const docPageBtn = buttons.find((b) => b.textContent.includes("Document Page"));
                if (docPageBtn) docPageBtn.click();
              });
              await new Promise((r) => setTimeout(r, 1000));

              const splitReaderFilename = `r3_research_split_reader_${vp.name}_${theme}.png`;
              await page.screenshot({ path: path.join(OUTPUT_DIR, splitReaderFilename), fullPage: false });
              console.log(`Captured: ${splitReaderFilename}`);
            }
          } catch (e) {
            console.warn("Could not capture active thread screenshot:", e);
          }
        }

        await page.close();
      }
    }
  }

  await browser.close();
  console.log("Phase R3 screenshot capture completed successfully.");
}

run().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
