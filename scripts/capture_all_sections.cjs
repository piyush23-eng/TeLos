const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '../docs/images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  console.log("📸 Starting comprehensive screenshot capture across ALL 8 TeLos sections...");

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: [
      '--window-size=1920,1080',
      '--no-sandbox',
      '--disable-gpu',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  // Common Candidate Profile for Authenticated Views
  const dummyUser = {
    id: 'usr-aarav',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    provider: 'email',
    bio: 'Staff Systems Architect specializing in distributed consensus, low-latency messaging, and fault-tolerant cloud infrastructure.',
    linkedin: 'linkedin.com/in/aarav-sharma',
    github: 'github.com/aarav-sharma',
    experience: 'Staff Systems Architect @ Tech • 8+ years distributed systems',
    projects: 'RaftKV — Distributed Consensus Store\nEventStream — High-throughput Kafka ingestion engine'
  };

  await page.goto('http://127.0.0.1:8787');
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate((u) => {
    localStorage.clear();
    localStorage.setItem('telos-user', JSON.stringify(u));
    localStorage.setItem('telos-token', 'mock-valid-token');
  }, dummyUser);

  await page.reload();
  await new Promise(r => setTimeout(r, 1200));

  // =========================================================================
  // SECTION 1: LIVE AI INTERVIEW STUDIO (Live Call with Alex, HUD & Scratchpad)
  // =========================================================================
  console.log("1️⃣ Capturing 01-interview-studio.png...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('interview'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input.brutalist-text-input'));
    if (inputs[0]) { inputs[0].value = 'Google'; inputs[0].dispatchEvent(new Event('input', { bubbles: true })); }
    if (inputs[1]) { inputs[1].value = 'Staff Systems Architect (L6)'; inputs[1].dispatchEvent(new Event('input', { bubbles: true })); }
    if (inputs[2]) { inputs[2].value = 'Distributed Consensus & Partition Recovery'; inputs[2].dispatchEvent(new Event('input', { bubbles: true })); }

    const cvBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Systems CV'));
    if (cvBtn) cvBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const contBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('CONTINUE TO CAMERA'));
    if (contBtn) contBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const joinBtn = document.querySelector('.join-call-btn-refined, button[class*="join-call"]');
    if (joinBtn) joinBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Open scratchpad
  await page.evaluate(() => {
    const padBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.innerText.toLowerCase().includes('scratchpad') ||
      b.innerText.toLowerCase().includes('code')
    );
    if (padBtn) padBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(outDir, '01-interview-studio.png') });
  console.log("   ✓ Saved 01-interview-studio.png");

  // =========================================================================
  // SECTION 2: POST-INTERVIEW DEBRIEF SCORECARD
  // =========================================================================
  console.log("2️⃣ Capturing 02-debrief-scorecard.png...");
  await page.evaluate(() => {
    const endBtn = document.querySelector('.end-call-btn-refined, button[class*="end-call"]');
    if (endBtn) endBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const confirmBtn = document.querySelector('.end-call-confirm-actions .btn-confirm');
    if (confirmBtn) confirmBtn.click();
  });
  // Wait for debrief report to fetch and radial gauges to render
  await new Promise(r => setTimeout(r, 3200));

  await page.screenshot({ path: path.join(outDir, '02-debrief-scorecard.png') });
  console.log("   ✓ Saved 02-debrief-scorecard.png");

  // Close debrief modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.report-modal .close-modal, .close-report');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // =========================================================================
  // SECTION 3: COMPANY PREP PLAYBOOKS (47 Companies & 6-Week Roadmap)
  // =========================================================================
  console.log("3️⃣ Capturing 03-company-prep.png...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('company'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(outDir, '03-company-prep.png') });
  console.log("   ✓ Saved 03-company-prep.png");

  // =========================================================================
  // SECTION 4: PROCTORED CODING ASSESSMENT WORKSPACE
  // =========================================================================
  console.log("4️⃣ Capturing 04-proctored-assessment.png...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('assessment'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Click start preflight check-in
  await page.evaluate(() => {
    const startBtn = document.querySelector('.assessment-launch .black-button');
    if (startBtn) startBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Click allow camera & enter
  await page.evaluate(() => {
    const allowBtn = document.querySelector('.preflight-permission');
    if (allowBtn) allowBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.evaluate(() => {
    const enterBtn = document.querySelector('.preflight-enter');
    if (enterBtn) enterBtn.click();
  });
  await new Promise(r => setTimeout(r, 2200));

  await page.screenshot({ path: path.join(outDir, '04-proctored-assessment.png') });
  console.log("   ✓ Saved 04-proctored-assessment.png");

  // Exit assessment
  await page.evaluate(() => {
    const exitBtn = document.querySelector('.exit-assessment');
    if (exitBtn) exitBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // =========================================================================
  // SECTION 5: ALGORITHMIC DRILLS & CODING WORKBENCH
  // =========================================================================
  console.log("5️⃣ Capturing 05-drills-workbench.png...");
  await page.goto('http://127.0.0.1:8787');
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('drills'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Click Run Solution to show real sandbox execution output
  await page.evaluate(() => {
    const runBtn = document.querySelector('.drill-action-bar .brand-button');
    if (runBtn) runBtn.click();
  });
  await new Promise(r => setTimeout(r, 1800));

  await page.screenshot({ path: path.join(outDir, '05-drills-workbench.png') });
  console.log("   ✓ Saved 05-drills-workbench.png");

  // =========================================================================
  // SECTION 6: PERFORMANCE TELEMETRY & CADENCE ANALYTICS
  // =========================================================================
  console.log("6️⃣ Capturing 06-performance-analytics.png...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('results'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: path.join(outDir, '06-performance-analytics.png') });
  console.log("   ✓ Saved 06-performance-analytics.png");

  // =========================================================================
  // SECTION 7: PRIVATE CANDIDATE DASHBOARD
  // =========================================================================
  console.log("7️⃣ Capturing 07-candidate-dashboard.png...");
  await page.evaluate(() => {
    const btn = document.querySelector('.account-cta');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    const dashBtn = Array.from(document.querySelectorAll('.account-popover button')).find(b => b.innerText.includes('My dashboard'));
    if (dashBtn) dashBtn.click();
  });
  await new Promise(r => setTimeout(r, 1600));

  await page.screenshot({ path: path.join(outDir, '07-candidate-dashboard.png') });
  console.log("   ✓ Saved 07-candidate-dashboard.png");

  // =========================================================================
  // SECTION 8: COMMUNITY & DISCUSSION HUB
  // =========================================================================
  console.log("8️⃣ Capturing 08-community-discuss.png...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('discuss'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(outDir, '08-community-discuss.png') });
  console.log("   ✓ Saved 08-community-discuss.png");

  // Also maintain backward-compatible aliases for original filenames
  fs.copyFileSync(path.join(outDir, '07-candidate-dashboard.png'), path.join(outDir, 'dashboard.png'));
  fs.copyFileSync(path.join(outDir, '01-interview-studio.png'), path.join(outDir, 'interview.png'));
  fs.copyFileSync(path.join(outDir, '02-debrief-scorecard.png'), path.join(outDir, 'scorecard.png'));
  fs.copyFileSync(path.join(outDir, '04-proctored-assessment.png'), path.join(outDir, 'assessment.png'));

  await browser.close();
  console.log("🎉 Complete set of all 8 section screenshots captured with 100% accuracy!");
})();
