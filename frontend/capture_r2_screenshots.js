import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUTPUT_DIR = path.resolve(__dirname, "../docs/screenshots-r2");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "tablet", width: 820, height: 1180, isMobile: true },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

const THEMES = ["light", "dark"];

const TARGETS = [
  { path: "/workspace", name: "workspace_home" },
  { path: "/workspace/documents", name: "document_library" },
];

async function run() {
  console.log("Starting Phase R2 screenshot capture with Google Chrome...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();

  for (const theme of THEMES) {
    for (const vp of VIEWPORTS) {
      await page.setViewport({
        width: vp.width,
        height: vp.height,
        isMobile: vp.isMobile,
        deviceScaleFactor: 2,
      });

      for (const target of TARGETS) {
        const url = `http://localhost:5173${target.path}`;
        console.log(`Navigating to ${url} at ${vp.name} (${theme})...`);
        await page.goto(url, { waitUntil: "networkidle0", timeout: 15000 });

        await page.evaluate((th) => {
          localStorage.setItem("dm_theme", th);
          document.documentElement.setAttribute("data-theme", th);
          if (th === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }, theme);

        await new Promise((r) => setTimeout(r, 600));

        const filename = `r2_${target.name}_${vp.name}_${theme}.png`;
        await page.screenshot({ path: path.join(OUTPUT_DIR, filename), fullPage: false });
        console.log(`Captured: ${filename}`);
      }
    }
  }

  await browser.close();
  console.log("Phase R2 screenshot capture completed successfully.");
}

run().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});

