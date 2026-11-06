import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const AXE_PATH = path.resolve(__dirname, "../node_modules/axe-core/axe.min.js");
const axeSource = fs.readFileSync(AXE_PATH, "utf8");

const SAMPLE_DOC_ID = "225b6842-471d-494f-9558-83b9df536fae";
const SAMPLE_WS_ID = "dd8f1de2-dd2b-457f-9f2b-e53c287b9cc2";

const ROUTES = [
  { path: "/", name: "Landing Page" },
  { path: "/workspace", name: "Workspace Home" },
  { path: "/workspace/documents", name: "Document Library" },
  { path: "/workspace/research", name: "Research Workspace" },
  { path: `/documents/${SAMPLE_DOC_ID}`, name: "Document Viewer" },
  { path: "/workspace/settings", name: "Settings & Diagnostics" },
  { path: "/docs", name: "Documentation" },
  { path: "/privacy", name: "Privacy Policy" },
  { path: "/terms", name: "Terms of Service" },
];

const THEMES = ["light", "dark"];

async function runA11yAudit() {
  console.log("=================================================");
  console.log("Starting WCAG 2.1 AA Accessibility Audit (axe-core)");
  console.log("=================================================\n");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const allViolations = [];
  let totalChecks = 0;

  for (const theme of THEMES) {
    console.log(`\n--- Auditing Theme: ${theme.toUpperCase()} ---`);

    for (const route of ROUTES) {
      totalChecks++;
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });

      // Initialize session and theme
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

      const url = `http://localhost:5173${route.path}`;
      try {
        await page.goto(url, { waitUntil: "networkidle0", timeout: 15000 });
      } catch (e) {
        console.warn(`Timeout waiting for network idle on ${route.path}, continuing.`);
      }

      // Ensure theme attribute is present
      await page.evaluate((th) => {
        document.documentElement.setAttribute("data-theme", th);
        if (th === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }, theme);

      await new Promise((r) => setTimeout(r, 600));

      // Inject axe-core
      await page.evaluate(axeSource);

      // Run axe evaluation
      const results = await page.evaluate(async () => {
        return await window.axe.run({
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
          },
        });
      });

      const routeViolations = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );

      const minorViolations = results.violations.filter(
        (v) => v.impact !== "critical" && v.impact !== "serious"
      );

      if (results.violations.length === 0) {
        console.log(`PASS: ${route.name} (${theme}) - 0 violations (${results.passes.length} rules checked)`);
      } else {
        console.log(`ALERT: ${route.name} (${theme}) - ${results.violations.length} violations (${routeViolations.length} critical/serious, ${minorViolations.length} minor/moderate)`);
        for (const v of results.violations) {
          allViolations.push({
            route: route.name,
            path: route.path,
            theme,
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodesCount: v.nodes.length,
            helpUrl: v.helpUrl,
            targets: v.nodes.slice(0, 3).map((n) => n.target.join(", ")),
          });
        }
      }

      await page.close();
    }
  }

  await browser.close();

  console.log("\n=================================================");
  console.log("Accessibility Audit Summary:");
  console.log(`Total Audits Executed: ${totalChecks}`);
  console.log(`Total Critical/Serious Violations: ${allViolations.filter((v) => v.impact === "critical" || v.impact === "serious").length}`);
  console.log(`Total Minor/Moderate Violations: ${allViolations.filter((v) => v.impact !== "critical" && v.impact !== "serious").length}`);
  console.log("=================================================\n");

  if (allViolations.length > 0) {
    console.log("Violation Breakdown:");
    allViolations.forEach((v, idx) => {
      console.log(
        `${idx + 1}. [${v.impact ? v.impact.toUpperCase() : "UNKNOWN"}] ${v.id} on ${v.route} (${v.theme}): ${v.description}`
      );
      console.log(`   Selectors: ${v.targets.join(" | ")}`);
    });
  }

  // Write detailed report to json
  const reportPath = path.resolve(__dirname, "../../docs/a11y-audit-report.json");
  fs.writeFileSync(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), allViolations }, null, 2));
  console.log(`Audit report written to ${reportPath}`);

  return allViolations;
}

runA11yAudit()
  .then((violations) => {
    const serious = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    if (serious.length > 0) {
      console.log(`\nCompleted with ${serious.length} serious/critical violations to fix.`);
    } else {
      console.log("\nZero critical or serious violations. Excellent!");
    }
  })
  .catch((err) => {
    console.error("Accessibility audit error:", err);
    process.exit(1);
  });

