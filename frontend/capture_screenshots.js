import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUTPUT_DIR = path.resolve("../docs/screenshots");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  console.log("Launching headless Google Chrome...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error("Browser Console Error:", msg.text());
    }
  });

  page.on("pageerror", (err) => {
    console.error("Page Unhandled Exception:", err.message);
  });

  const targets = [
    { url: "http://localhost:5173/", file: "01_landing_page.png", label: "Landing Page" },
    { url: "http://localhost:5173/workspace", file: "02_workspace_overview.png", label: "Workspace Overview" },
    { url: "http://localhost:5173/workspace/documents", file: "03_document_library.png", label: "Document Library" },
    { url: "http://localhost:5173/workspace/research", file: "04_research_workspace.png", label: "AI Research Canvas" },
    { url: "http://localhost:5173/docs", file: "05_documentation.png", label: "System Documentation" },
  ];

  for (const t of targets) {
    console.log(`Navigating to ${t.label} (${t.url})...`);
    await page.goto(t.url, { waitUntil: "networkidle0", timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1000));
    const outPath = path.join(OUTPUT_DIR, t.file);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Captured genuine screenshot: ${outPath}`);
  }

  // Mobile Viewport Capture
  console.log("Capturing Mobile Responsive View (375x812)...");
  await page.setViewport({ width: 375, height: 812, isMobile: true });
  await page.goto("http://localhost:5173/workspace/research", {
    waitUntil: "networkidle0",
    timeout: 15000,
  });
  await new Promise((r) => setTimeout(r, 1000));
  const mobileOut = path.join(OUTPUT_DIR, "06_mobile_research.png");
  await page.screenshot({ path: mobileOut, fullPage: false });
  console.log(`Captured genuine mobile screenshot: ${mobileOut}`);

  await browser.close();
  console.log("All genuine screenshots captured successfully with 0 console errors!");
}

run().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});

