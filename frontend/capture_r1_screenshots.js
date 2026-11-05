import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUTPUT_DIR = path.resolve(__dirname, "../docs/screenshots-r1");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "tablet", width: 820, height: 1180, isMobile: true },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

const THEMES = ["light", "dark"];

async function run() {
  console.log("Starting Phase R1 screenshot capture with Google Chrome...");
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

      // Capture Design System Foundations
      const dsUrl = "http://localhost:5173/design-system";
      console.log(`Navigating to ${dsUrl} at ${vp.name} (${theme})...`);
      await page.goto(dsUrl, { waitUntil: "networkidle0", timeout: 15000 });

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

      const dsFile = `r1_design_system_${vp.name}_${theme}.png`;
      await page.screenshot({ path: path.join(OUTPUT_DIR, dsFile), fullPage: false });
      console.log(`Captured: ${dsFile}`);

      // Capture Command Palette on Desktop
      if (vp.name === "desktop") {
        await page.keyboard.down("Meta");
        await page.keyboard.press("KeyK");
        await page.keyboard.up("Meta");
        await new Promise((r) => setTimeout(r, 400));

        const cmdFile = `r1_command_palette_${theme}.png`;
        await page.screenshot({ path: path.join(OUTPUT_DIR, cmdFile), fullPage: false });
        console.log(`Captured: ${cmdFile}`);
      }
    }
  }

  await browser.close();
  console.log("Phase R1 screenshot capture completed successfully.");
}

run().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});

