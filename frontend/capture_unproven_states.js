import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUTPUT_DIR = path.resolve(__dirname, "../docs/screenshots-evidence");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, isMobile: false },
  { name: "tablet", width: 820, height: 1180, isMobile: true },
  { name: "mobile", width: 390, height: 844, isMobile: true }
];

const THEMES = ["light", "dark"];
const SAMPLE_WS_ID = "dd8f1de2-dd2b-457f-9f2b-e53c287b9cc2";
const SAMPLE_DOC_ID = "225b6842-471d-494f-9558-83b9df536fae";
const BASE_URL = "http://localhost:5173";

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log("Starting Capture of Unproven Evidence States across 3 viewports and 2 themes...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    protocolTimeout: 60000,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  for (const theme of THEMES) {
    for (const vp of VIEWPORTS) {
      console.log(`\nCapturing for Viewport: ${vp.name} (${vp.width}x${vp.height}) | Theme: ${theme}`);

      const page = await browser.newPage();
      await page.setViewport({
        width: vp.width,
        height: vp.height,
        isMobile: vp.isMobile,
        deviceScaleFactor: 2
      });

      await page.setCookie(
        { name: "dm_session", value: "demo_researcher_session", domain: "localhost", path: "/" },
        { name: "dm_session", value: "demo_researcher_session", domain: "127.0.0.1", path: "/" }
      );

      await page.evaluateOnNewDocument((th, wsId) => {
        localStorage.setItem("dm_theme", th);
        localStorage.setItem("dm_session_token", "demo_researcher_session");
        localStorage.setItem("dm_active_workspace", wsId);
      }, theme, SAMPLE_WS_ID);

      const applyTheme = async () => {
        await page.evaluate((th) => {
          document.documentElement.setAttribute("data-theme", th);
          if (th === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }, theme);
      };

      // 1. Library with real document statuses (Ready, Failed)
      try {
        await page.goto(`${BASE_URL}/workspace/documents`, { waitUntil: "networkidle0" });
        await applyTheme();
        await sleep(500);
        await page.screenshot({
          path: path.join(OUTPUT_DIR, `library_statuses_${vp.name}_${theme}.png`),
          fullPage: false
        });
        console.log(`  Captured: library_statuses_${vp.name}_${theme}.png`);
      } catch (e) {
        console.error("  Error capturing library statuses:", e.message);
      }

      // 2. Upload Failure with error reason (Scanned document failure reason)
      try {
        const failedDot = await page.$('.bg-semantic-error-text');
        if (failedDot) {
          await failedDot.hover();
          await sleep(300);
        }
        await page.screenshot({
          path: path.join(OUTPUT_DIR, `upload_failure_${vp.name}_${theme}.png`),
          fullPage: false
        });
        console.log(`  Captured: upload_failure_${vp.name}_${theme}.png`);
      } catch (e) {
        console.error("  Error capturing upload failure:", e.message);
      }

      // 3. Streamed Answer with Citations
      try {
        await page.goto(`${BASE_URL}/workspace/research`, { waitUntil: "networkidle0" });
        await applyTheme();
        await sleep(500);

        await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll("button"));
          const btn = btns.find((b) => b.innerText.includes("Transformer Architecture Inquiry"));
          if (btn) btn.click();
        });
        await sleep(600);

        await page.screenshot({
          path: path.join(OUTPUT_DIR, `streamed_answer_citations_${vp.name}_${theme}.png`),
          fullPage: false
        });
        console.log(`  Captured: streamed_answer_citations_${vp.name}_${theme}.png`);
      } catch (e) {
        console.error("  Error capturing answer with citations:", e.message);
      }

      // 4. Citation Opened on Exact Page (Evidence Drawer Open)
      try {
        await page.evaluate(() => {
          const marker = document.querySelector('button[title*="Inspect citation"], .font-mono.text-accent');
          if (marker) marker.click();
        });
        await sleep(600);

        await page.screenshot({
          path: path.join(OUTPUT_DIR, `citation_opened_drawer_${vp.name}_${theme}.png`),
          fullPage: false
        });
        console.log(`  Captured: citation_opened_drawer_${vp.name}_${theme}.png`);
      } catch (e) {
        console.error("  Error capturing opened citation drawer:", e.message);
      }

      // 5. Insufficient Evidence State (Truthful Refusal)
      try {
        await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll("button"));
          const btn = btns.find((b) => b.innerText.includes("Out-of-Scope Refusal Inquiry"));
          if (btn) btn.click();
        });
        await sleep(600);

        await page.screenshot({
          path: path.join(OUTPUT_DIR, `insufficient_evidence_refusal_${vp.name}_${theme}.png`),
          fullPage: false
        });
        console.log(`  Captured: insufficient_evidence_refusal_${vp.name}_${theme}.png`);
      } catch (e) {
        console.error("  Error capturing refusal state:", e.message);
      }

      // 6. Multi-Document Answer
      try {
        await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll("button"));
          const btn = btns.find((b) => b.innerText.includes("Multi-Document Architecture Synthesis"));
          if (btn) btn.click();
        });
        await sleep(600);

        await page.screenshot({
          path: path.join(OUTPUT_DIR, `multi_document_answer_${vp.name}_${theme}.png`),
          fullPage: false
        });
        console.log(`  Captured: multi_document_answer_${vp.name}_${theme}.png`);
      } catch (e) {
        console.error("  Error capturing multi document answer:", e.message);
      }

      // 7. Dedicated Document Viewer
      try {
        await page.goto(`${BASE_URL}/documents/${SAMPLE_DOC_ID}`, { waitUntil: "networkidle0" });
        await applyTheme();
        await sleep(500);
        await page.screenshot({
          path: path.join(OUTPUT_DIR, `document_viewer_${vp.name}_${theme}.png`),
          fullPage: false
        });
        console.log(`  Captured: document_viewer_${vp.name}_${theme}.png`);
      } catch (e) {
        console.error("  Error capturing document viewer:", e.message);
      }

      // 8. Command Palette Open
      try {
        await page.goto(`${BASE_URL}/workspace`, { waitUntil: "networkidle0" });
        await applyTheme();
        await sleep(400);

        await page.keyboard.down("Meta");
        await page.keyboard.press("k");
        await page.keyboard.up("Meta");
        await sleep(400);

        await page.screenshot({
          path: path.join(OUTPUT_DIR, `command_palette_${vp.name}_${theme}.png`),
          fullPage: false
        });
        console.log(`  Captured: command_palette_${vp.name}_${theme}.png`);
      } catch (e) {
        console.error("  Error capturing command palette:", e.message);
      }

      // 9. Delete All Data Confirmation Modal
      try {
        await page.goto(`${BASE_URL}/workspace/settings`, { waitUntil: "networkidle0" });
        await applyTheme();
        await sleep(400);

        await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll("button"));
          const btn = btns.find((b) => b.innerText.includes("Delete All Data"));
          if (btn) btn.click();
        });
        await sleep(400);

        await page.screenshot({
          path: path.join(OUTPUT_DIR, `delete_confirmation_modal_${vp.name}_${theme}.png`),
          fullPage: false
        });
        console.log(`  Captured: delete_confirmation_modal_${vp.name}_${theme}.png`);
      } catch (e) {
        console.error("  Error capturing delete modal:", e.message);
      }

      await page.close();
    }
  }

  // 10. Degraded / Offline State
  console.log("\nCapturing Offline / Degraded State...");
  const offlinePage = await browser.newPage();
  await offlinePage.setViewport({ width: 1440, height: 900 });
  await offlinePage.setRequestInterception(true);
  offlinePage.on("request", (req) => {
    if (req.url().includes("/api/")) {
      req.abort("failed");
    } else {
      req.continue();
    }
  });

  try {
    await offlinePage.goto(`${BASE_URL}/workspace`, { waitUntil: "networkidle0", timeout: 10000 });
    await sleep(800);
    await offlinePage.screenshot({
      path: path.join(OUTPUT_DIR, `backend_offline_degraded_desktop_light.png`),
      fullPage: false
    });
    console.log("  Captured: backend_offline_degraded_desktop_light.png");
  } catch (e) {
    console.log("  Handled offline render:", e.message);
    await offlinePage.screenshot({
      path: path.join(OUTPUT_DIR, `backend_offline_degraded_desktop_light.png`),
      fullPage: false
    });
  }
  await offlinePage.close();

  await browser.close();
  console.log("\nFinished capturing all 10 unproven evidence states!");
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
