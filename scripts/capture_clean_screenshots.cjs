const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '../docs/images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  console.log("📸 Launching Chrome to capture authentic, high-resolution product screenshots...");
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

  // -------------------------------------------------------------
  // 1. CANDIDATE DASHBOARD
  // -------------------------------------------------------------
  console.log("1️⃣ Capturing Dashboard View...");
  await page.goto('http://127.0.0.1:8787');
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    localStorage.clear();
    const user = {
      id: 'usr-1',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@gmail.com',
      provider: 'email',
      bio: 'Staff Systems Architect specializing in distributed consensus, low-latency messaging, and fault-tolerant cloud infrastructure.',
      linkedin: 'linkedin.com/in/aarav-sharma',
      github: 'github.com/aarav-sharma',
      experience: 'Staff Systems Architect @ Tech • 8+ years distributed systems',
      projects: 'RaftKV — Distributed Consensus Store\nEventStream — High-throughput Kafka ingestion engine'
    };
    localStorage.setItem('telos-user', JSON.stringify(user));
    localStorage.setItem('telos-token', 'valid-mock-token');
  });

  await page.reload();
  await new Promise(r => setTimeout(r, 1000));

  // Open account popover and click My Dashboard
  await page.evaluate(() => {
    const btn = document.querySelector('.account-cta');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    const dashBtn = Array.from(document.querySelectorAll('.account-popover button')).find(b => b.innerText.includes('My dashboard'));
    if (dashBtn) dashBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: path.join(outDir, 'dashboard.png'), fullPage: false });
  console.log("   ✓ Saved docs/images/dashboard.png");

  // -------------------------------------------------------------
  // 2. LIVE AI INTERVIEW SCREEN
  // -------------------------------------------------------------
  console.log("2️⃣ Capturing Live AI Interview Screen...");
  await page.evaluate(() => {
    const interviewBtn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('interview'));
    if (interviewBtn) interviewBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Fill in Google, Staff Role, Distributed Systems
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input.brutalist-text-input'));
    if (inputs[0]) { inputs[0].value = 'Google'; inputs[0].dispatchEvent(new Event('input', { bubbles: true })); }
    if (inputs[1]) { inputs[1].value = 'Staff Systems Architect (L6)'; inputs[1].dispatchEvent(new Event('input', { bubbles: true })); }
    if (inputs[2]) { inputs[2].value = 'Distributed Consensus & Partition Recovery'; inputs[2].dispatchEvent(new Event('input', { bubbles: true })); }

    const cvBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Systems CV'));
    if (cvBtn) cvBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Click continue to camera & mic verification
  await page.evaluate(() => {
    const contBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('CONTINUE TO CAMERA'));
    if (contBtn) contBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Join call
  await page.evaluate(() => {
    const joinBtn = document.querySelector('.join-call-btn-refined, button[class*="join-call"]');
    if (joinBtn) joinBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Open scratchpad and populate realistic technical code
  await page.evaluate(() => {
    const padBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.innerText.toLowerCase().includes('scratchpad') ||
      b.innerText.toLowerCase().includes('code')
    );
    if (padBtn) padBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(outDir, 'interview.png'), fullPage: false });
  console.log("   ✓ Saved docs/images/interview.png");

  // -------------------------------------------------------------
  // 3. POST-INTERVIEW DEBRIEF SCORECARD
  // -------------------------------------------------------------
  console.log("3️⃣ Capturing Debrief Scorecard...");
  // End call to trigger report
  await page.evaluate(() => {
    const endBtn = document.querySelector('.end-call-btn-refined, button[class*="end-call"]');
    if (endBtn) endBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const confirmBtn = document.querySelector('.end-call-confirm-actions .btn-confirm');
    if (confirmBtn) confirmBtn.click();
  });
  // Wait for debrief calculation and radial score gauges to render
  await new Promise(r => setTimeout(r, 3000));

  await page.screenshot({ path: path.join(outDir, 'scorecard.png'), fullPage: false });
  console.log("   ✓ Saved docs/images/scorecard.png");

  // -------------------------------------------------------------
  // 4. PROCTORED ASSESSMENT WORKSPACE
  // -------------------------------------------------------------
  console.log("4️⃣ Capturing Proctored Assessment Workspace...");
  // Close debrief if open
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.report-modal .close-modal, .close-report');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Navigate to Assessment
  await page.evaluate(() => {
    const assessBtn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('assessment'));
    if (assessBtn) assessBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Click Start Assessment (preflight)
  await page.evaluate(() => {
    const startBtn = document.querySelector('.assessment-launch .black-button');
    if (startBtn) startBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Click allow devices and enter locked assessment
  await page.evaluate(async () => {
    const allowBtn = document.querySelector('.preflight-permission');
    if (allowBtn) allowBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.evaluate(async () => {
    const enterBtn = document.querySelector('.preflight-enter');
    if (enterBtn) enterBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: path.join(outDir, 'assessment.png'), fullPage: false });
  console.log("   ✓ Saved docs/images/assessment.png");

  await browser.close();
  console.log("🎉 All accurate screenshots captured successfully!");
})();
