import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUTPUT_DIR = path.resolve(__dirname, "../docs/reference-screenshots");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const REFERENCES = [
  { name: "linear", url: "https://linear.app" },
  { name: "stripe", url: "https://stripe.com" },
  { name: "resend", url: "https://resend.com" },
  { name: "vercel", url: "https://vercel.com" },
  { name: "raycast", url: "https://raycast.com" },
  { name: "perplexity", url: "https://perplexity.ai" },
];

async function studyReferences() {
  console.log("Launching headless browser to study reference products...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const metadata = {};

  for (const ref of REFERENCES) {
    console.log(`Studying ${ref.name} (${ref.url})...`);
    metadata[ref.name] = { url: ref.url };

    // Desktop
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    try {
      await page.goto(ref.url, { waitUntil: "domcontentloaded", timeout: 20000 });
      await new Promise((r) => setTimeout(r, 1000));
      
      const desktopFile = `${ref.name}_desktop.png`;
      await page.screenshot({ path: path.join(OUTPUT_DIR, desktopFile), fullPage: false });
      
      const title = await page.title();
      const headlines = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("h1, h2"))
          .slice(0, 5)
          .map((el) => el.textContent.trim().replace(/\s+/g, " "));
      });

      metadata[ref.name].title = title;
      metadata[ref.name].headlines = headlines;
      console.log(`  Captured ${desktopFile}, title: "${title}"`);
    } catch (err) {
      console.warn(`  Failed desktop capture for ${ref.name}:`, err.message);
    }
    await page.close();

    // Mobile
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true });
    try {
      await mobilePage.goto(ref.url, { waitUntil: "domcontentloaded", timeout: 20000 });
      await new Promise((r) => setTimeout(r, 1000));
      const mobileFile = `${ref.name}_mobile.png`;
      await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, mobileFile), fullPage: false });
      console.log(`  Captured ${mobileFile}`);
    } catch (err) {
      console.warn(`  Failed mobile capture for ${ref.name}:`, err.message);
    }
    await mobilePage.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUTPUT_DIR, "reference_meta.json"), JSON.stringify(metadata, null, 2));
  console.log("Reference study capture completed.");
}

studyReferences().catch((err) => {
  console.error("Reference study error:", err);
  process.exit(1);
});
