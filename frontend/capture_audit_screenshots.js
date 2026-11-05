import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUTPUT_DIR = path.resolve(__dirname, "../docs/audit-screenshots");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "tablet", width: 820, height: 1180, isMobile: true },
  { name: "mobile", width: 390, height: 844, isMobile: true }
];

const THEMES = ["light", "dark"];

const ROUTES = [
  { path: "/", id: "landing", label: "Landing Page" },
  { path: "/workspace", id: "workspace_overview", label: "Workspace Overview" },
  { path: "/workspace/documents", id: "workspace_library", label: "Document Library" },
  { path: "/workspace/research", id: "workspace_research", label: "Research Workspace" },
  { path: "/docs", id: "documentation", label: "Documentation" },
  { path: "/privacy", id: "privacy", label: "Privacy Policy" },
  { path: "/terms", id: "terms", label: "Terms of Service" }
];

async function capture() {
  console.log("Starting audit screenshot capture with Google Chrome...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();

  for (const theme of THEMES) {
    for (const vp of VIEWPORTS) {
      await page.setViewport({
        width: vp.width,
        height: vp.height,
        isMobile: vp.isMobile,
        deviceScaleFactor: 2
      });

      for (const route of ROUTES) {
        const url = `http://localhost:5173${route.path}`;
        try {
          await page.goto(url, { waitUntil: "networkidle0", timeout: 15000 });
          // Set theme in localStorage and DOM
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

          const filename = `${route.id}_${vp.name}_${theme}.png`;
          const filePath = path.join(OUTPUT_DIR, filename);
          await page.screenshot({ path: filePath, fullPage: false });
          console.log(`Captured: ${filename}`);
        } catch (err) {
          console.error(`Failed ${route.label} at ${vp.name} (${theme}):`, err.message);
        }
      }
    }
  }

  await browser.close();
  console.log("Audit capture completed.");
}

capture().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
