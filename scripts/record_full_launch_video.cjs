const puppeteer = require('puppeteer');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const tempDir = "/tmp/telos_live_production";
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const bgmPath = "/tmp/bgm.wav";

function getAudioDuration(filePath) {
  const res = spawnSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "csv=p=0",
    filePath
  ]);
  return parseFloat(res.stdout.toString().trim()) || 5.0;
}

(async () => {
  console.log("🚀 Launching Chrome for real live screen recording...");
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--window-size=1920,1080', '--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:8787');
  await new Promise(r => setTimeout(r, 2000));

  // Inject Custom Realistic Mouse Pointer and Lower-Third Subtitle HUD
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();

    const cursor = document.createElement('div');
    cursor.id = 'telos-live-cursor';
    cursor.style.cssText = `
      position: fixed;
      top: 300px; left: 300px;
      width: 28px; height: 28px;
      background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="%23ffffff" stroke="%23000000" stroke-width="2" stroke-linejoin="round"><path d="M5 3L19 12L12 14L9 21L5 3Z"/></svg>') no-repeat;
      pointer-events: none;
      z-index: 999999;
      transition: transform 0.15s ease-out, top 0.4s cubic-bezier(0.25, 1, 0.5, 1), left 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    `;
    document.body.appendChild(cursor);

    window.moveCursor = (x, y) => {
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
    };
    window.clickCursor = (x, y) => {
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
      cursor.style.transform = 'scale(0.8)';
      setTimeout(() => cursor.style.transform = 'scale(1)', 160);
    };

    const sub = document.createElement('div');
    sub.id = 'telos-subtitles-bar';
    sub.style.cssText = `
      position: fixed;
      bottom: 36px;
      left: 50%;
      transform: translateX(-50%);
      width: 1420px;
      background: rgba(10, 9, 16, 0.90);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 18px;
      padding: 16px 36px 18px 36px;
      backdrop-filter: blur(24px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.85);
      text-align: center;
      z-index: 999998;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    document.body.appendChild(sub);

    window.setSub = (stage, text, accent) => {
      sub.innerHTML = `
        <div style="display:inline-block; color: ${accent || '#6e54f6'}; font-size: 13px; font-weight: 800; letter-spacing: 0.08em; margin-bottom: 8px;">${stage}</div>
        <div style="font-size: 26px; line-height: 1.36; font-weight: 600; color: #ffffff; letter-spacing: -0.01em;">"${text}"</div>
      `;
    };
  });

  const client = await page.target().createCDPSession();

  // Helper to record a live interaction step to MP4
  async function recordStep(stepId, audioFile, stage, text, accent, actionFn) {
    console.log(`🎬 Recording live step: ${stage}...`);
    const targetDuration = getAudioDuration(audioFile);
    const videoOnlyMp4 = path.join(tempDir, `${stepId}_video.mp4`);
    const mixedAudio = path.join(tempDir, `${stepId}_audio.m4a`);
    const finalStepMp4 = path.join(tempDir, `${stepId}.mp4`);

    // Mix Voice Audio + Subtle BGM
    spawnSync("ffmpeg", [
      "-y",
      "-i", audioFile,
      "-i", bgmPath,
      "-filter_complex", "[0:a]volume=1.0[v];[1:a]volume=0.08[m];[v][m]amix=inputs=2:duration=first:dropout_transition=2[a]",
      "-map", "[a]",
      "-c:a", "aac",
      "-b:a", "192k",
      mixedAudio
    ]);

    // Update Subtitle Bar
    await page.evaluate((stg, txt, acc) => window.setSub(stg, txt, acc), stage, text, accent);

    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-f', 'image2pipe',
      '-vcodec', 'mjpeg',
      '-r', '30',
      '-i', '-',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-r', '30',
      videoOnlyMp4
    ]);

    let frames = 0;
    const frameHandler = async ({ data, sessionId }) => {
      frames++;
      ffmpeg.stdin.write(Buffer.from(data, 'base64'));
      try { await client.send('Page.screencastFrameAck', { sessionId }); } catch (e) {}
    };

    client.on('Page.screencastFrame', frameHandler);
    await client.send('Page.startScreencast', { format: 'jpeg', quality: 85, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });

    const startTime = Date.now();
    try {
      await actionFn();
    } catch (err) {
      console.error(`Action error in ${stepId}:`, err.message);
    }

    // Pad remaining time to match audio duration
    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = Math.max(0, targetDuration - elapsed);
    if (remaining > 0) {
      await new Promise(r => setTimeout(r, remaining * 1000));
    }

    await client.send('Page.stopScreencast');
    client.off('Page.screencastFrame', frameHandler);
    ffmpeg.stdin.end();
    await new Promise(r => ffmpeg.on('close', r));

    // Combine Video + Mixed Audio
    spawnSync("ffmpeg", [
      "-y",
      "-i", videoOnlyMp4,
      "-i", mixedAudio,
      "-c:v", "copy",
      "-c:a", "aac",
      "-shortest",
      finalStepMp4
    ]);

    console.log(`   ✓ Completed ${stepId}: ${frames} frames recorded, synced to audio.`);
    return finalStepMp4;
  }

  const clips = [];

  // ==========================================
  // STEP 1: SIGNUP
  // ==========================================
  clips.push(await recordStep(
    "step01_signup",
    "/tmp/telos_strict_audio/step01_signup.mp3",
    "01 // SIGNUP",
    "First, let's sign up. We open the registration window, enter a name, dummy email, and password, and create our account.",
    "#6e54f6",
    async () => {
      await page.evaluate(() => window.moveCursor(1820, 35));
      await new Promise(r => setTimeout(r, 600));
      await page.evaluate(() => window.clickCursor(1820, 35));
      await page.click('.account-cta');
      await new Promise(r => setTimeout(r, 600));

      // Switch to signup
      await page.evaluate(() => window.moveCursor(1020, 680));
      await new Promise(r => setTimeout(r, 400));
      await page.evaluate(() => {
        const b = document.querySelector('.auth-switch button');
        if (b && b.innerText.includes('Create an account')) b.click();
      });
      await new Promise(r => setTimeout(r, 600));

      // Type name, email, password
      const nameInput = await page.$('.auth-card input[placeholder*="Aarav"]') || await page.$('.auth-card input');
      if (nameInput) await nameInput.type('Aarav Sharma', { delay: 35 });
      const emailInput = await page.$('.auth-card input[type="email"]');
      if (emailInput) await emailInput.type('aarav.sharma@gmail.com', { delay: 35 });
      const passInput = await page.$('.auth-card input[type="password"]');
      if (passInput) await passInput.type('SuperSecure123!', { delay: 35 });

      await page.evaluate(() => window.moveCursor(960, 630));
      await page.evaluate(() => window.clickCursor(960, 630));
    }
  ));

  // ==========================================
  // STEP 2: LOGIN
  // ==========================================
  clips.push(await recordStep(
    "step02_login",
    "/tmp/telos_strict_audio/step02_login.mp3",
    "02 // LOGIN",
    "Next, we switch over to login, enter our credentials, and sign in.",
    "#00e5ff",
    async () => {
      // Switch back to login
      await page.evaluate(() => window.moveCursor(1020, 680));
      await new Promise(r => setTimeout(r, 400));
      await page.evaluate(() => {
        const b = document.querySelector('.auth-switch button');
        if (b && b.innerText.includes('Sign in')) b.click();
      });
      await new Promise(r => setTimeout(r, 500));

      // Type email and password
      const emailInput = await page.$('.auth-card input[type="email"]');
      if (emailInput) {
        await emailInput.click({ clickCount: 3 });
        await emailInput.type('aarav.sharma@gmail.com', { delay: 30 });
      }
      const passInput = await page.$('.auth-card input[type="password"]');
      if (passInput) {
        await passInput.click({ clickCount: 3 });
        await passInput.type('SuperSecure123!', { delay: 30 });
      }

      await page.evaluate(() => window.moveCursor(960, 630));
      await page.evaluate(() => window.clickCursor(960, 630));
    }
  ));

  // ==========================================
  // STEP 3: CLOSE SIGNUP/LOGIN WINDOW
  // ==========================================
  clips.push(await recordStep(
    "step03_close_modal",
    "/tmp/telos_strict_audio/step03_close_modal.mp3",
    "03 // CLOSE WINDOW — CLEAN VIEW",
    "Notice the login modal closes completely, leaving a clean, unobstructed view of the platform.",
    "#10b981",
    async () => {
      await page.evaluate(() => window.moveCursor(1180, 290));
      await new Promise(r => setTimeout(r, 600));
      await page.evaluate(() => window.clickCursor(1180, 290));
      await page.evaluate(() => {
        const closeBtn = document.querySelector('.close-modal') || document.querySelector('button[aria-label*="Close"]');
        if (closeBtn) closeBtn.click();
      });
      await new Promise(r => setTimeout(r, 800));
      await page.evaluate(() => window.moveCursor(960, 450));
    }
  ));

  // ==========================================
  // STEP 4A: INTERVIEW SETUP & CV GROUNDING
  // ==========================================
  clips.push(await recordStep(
    "step04a_setup",
    "/tmp/telos_strict_audio/step04a_setup.mp3",
    "04A // INTERVIEW SETUP & CV",
    "Now, let's navigate to the interview section. We fill in the required setup details: targeting Google for a Staff Systems Architect role, and upload a resume to ground the questions in our real background.",
    "#ff4f19",
    async () => {
      await page.evaluate(() => window.moveCursor(320, 35));
      await new Promise(r => setTimeout(r, 400));
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('interview'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 500));

      // Fill in Google, Staff Role, Focus
      await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input.brutalist-text-input'));
        if (inputs[0]) { inputs[0].value = 'Google'; inputs[0].dispatchEvent(new Event('input', { bubbles: true })); }
        if (inputs[1]) { inputs[1].value = 'Staff Systems Architect (L6)'; inputs[1].dispatchEvent(new Event('input', { bubbles: true })); }
        if (inputs[2]) { inputs[2].value = 'Distributed Consensus & Kafka'; inputs[2].dispatchEvent(new Event('input', { bubbles: true })); }
      });
      await page.evaluate(() => window.moveCursor(960, 360));
      await new Promise(r => setTimeout(r, 600));

      // Click + Systems CV
      await page.evaluate(() => window.moveCursor(1200, 470));
      await new Promise(r => setTimeout(r, 400));
      await page.evaluate(() => window.clickCursor(1200, 470));
      await page.evaluate(() => {
        const cvBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Systems CV'));
        if (cvBtn) cvBtn.click();
      });
      await new Promise(r => setTimeout(r, 800));

      // Click Continue to Verification
      await page.evaluate(() => window.moveCursor(960, 680));
      await new Promise(r => setTimeout(r, 400));
      await page.evaluate(() => window.clickCursor(960, 680));
      await page.evaluate(() => {
        const contBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('CONTINUE TO CAMERA'));
        if (contBtn) contBtn.click();
      });
    }
  ));

  // ==========================================
  // STEP 4B: LIVE 20-SECOND INTERVIEW SESSION
  // ==========================================
  clips.push(await recordStep(
    "step04b_live_20s",
    "/tmp/telos_strict_audio/step04b_live_20s.mp3",
    "04B // LIVE INTERVIEW WITH ALEX (20 SECONDS)",
    "Here is the live interview in action. Alex Rivera, our AI interviewer, asks a deep architecture question on distributed consensus and partition failure. We respond in real time through the mic, with live proctoring and focus telemetry active. We can even open the collaborative scratchpad to write code and diagram topologies mid-session.",
    "#10b981",
    async () => {
      // Enter call
      await page.evaluate(() => window.moveCursor(1150, 470));
      await new Promise(r => setTimeout(r, 400));
      await page.evaluate(() => window.clickCursor(1150, 470));
      await page.evaluate(() => {
        const joinBtn = document.querySelector('.join-call-btn-refined, button[class*="join-call"]');
        if (joinBtn) joinBtn.click();
      });
      await new Promise(r => setTimeout(r, 1200));

      // Move cursor across Alex video and speech waves
      await page.evaluate(() => window.moveCursor(650, 400));
      await new Promise(r => setTimeout(r, 3000));

      // Move cursor to live proctoring badge and countdown HUD
      await page.evaluate(() => window.moveCursor(960, 40));
      await new Promise(r => setTimeout(r, 3000));

      // Move cursor to Barge-In Interrupt button
      await page.evaluate(() => window.moveCursor(960, 720));
      await page.evaluate(() => window.clickCursor(960, 720));
      await new Promise(r => setTimeout(r, 3000));

      // Open scratchpad / Coderpad
      await page.evaluate(() => {
        const padBtn = Array.from(document.querySelectorAll('button')).find(b => 
          b.innerText.toLowerCase().includes('scratchpad') || 
          b.innerText.toLowerCase().includes('code') || 
          b.innerText.toLowerCase().includes('canvas')
        );
        if (padBtn) padBtn.click();
      });
      await page.evaluate(() => window.moveCursor(1300, 360));
    }
  ));

  // ==========================================
  // STEP 4C: POST-INTERVIEW DEBRIEF SCORECARD
  // ==========================================
  clips.push(await recordStep(
    "step04c_scorecard",
    "/tmp/telos_strict_audio/step04c_scorecard.mp3",
    "04C // DUMMY REPORT & SCORECARD",
    "And right as the interview wraps, TeLos generates this comprehensive debrief report and scorecard, rating technical depth, concurrency, and comparing our exact phrasing against model answers.",
    "#f59e0b",
    async () => {
      await page.evaluate(() => {
        const resBtn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('results'));
        if (resBtn) resBtn.click();
      });
      await page.evaluate(() => window.moveCursor(960, 280));
      await new Promise(r => setTimeout(r, 1500));
      await page.evaluate(() => window.moveCursor(1100, 450));
      await new Promise(r => setTimeout(r, 1500));
      await page.evaluate(() => window.moveCursor(600, 600));
    }
  ));

  // ==========================================
  // STEP 5: COMPANY PREP SECTION
  // ==========================================
  clips.push(await recordStep(
    "step05_company_prep",
    "/tmp/telos_strict_audio/step05_company_prep.mp3",
    "05 // COMPANY PREP SECTION",
    "Next, we head over to Company Prep. This section gives you tailored six-week blueprints for 47 companies like Google, Amazon, and Razorpay, complete with authentic past interview patterns and Bar Raiser rubrics.",
    "#ecff00",
    async () => {
      await page.evaluate(() => window.moveCursor(420, 35));
      await page.evaluate(() => window.clickCursor(420, 35));
      await page.evaluate(() => {
        const prepBtn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('company'));
        if (prepBtn) prepBtn.click();
      });
      await new Promise(r => setTimeout(r, 1000));
      // Hover over Google card
      await page.evaluate(() => window.moveCursor(450, 440));
      await new Promise(r => setTimeout(r, 1500));
      // Hover over Amazon / Razorpay card
      await page.evaluate(() => window.moveCursor(850, 440));
    }
  ));

  // ==========================================
  // STEP 6: ASSESSMENT SECTION
  // ==========================================
  clips.push(await recordStep(
    "step06_assessment",
    "/tmp/telos_strict_audio/step06_assessment.mp3",
    "06 // ASSESSMENT SECTION",
    "Moving to the Assessment section, candidates can take proctored Online Assessments under real exam constraints. We pick a question, work through the solution, test the code, and submit the assessment.",
    "#a855f7",
    async () => {
      await page.evaluate(() => window.moveCursor(550, 35));
      await page.evaluate(() => window.clickCursor(550, 35));
      await page.evaluate(() => {
        const assessBtn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('assessment'));
        if (assessBtn) assessBtn.click();
      });
      await new Promise(r => setTimeout(r, 1000));
      await page.evaluate(() => window.moveCursor(450, 350));
      await new Promise(r => setTimeout(r, 1500));
      await page.evaluate(() => window.moveCursor(960, 520));
    }
  ));

  // ==========================================
  // STEP 7: DISCUSS SECTION
  // ==========================================
  clips.push(await recordStep(
    "step07_discuss",
    "/tmp/telos_strict_audio/step07_discuss.mp3",
    "07 // DISCUSS SECTION",
    "Next is the Discuss section. This is our community hub where engineers share recent interview experiences, discuss architecture trade-offs, and break down verified compensation offers.",
    "#ec4899",
    async () => {
      await page.evaluate(() => window.moveCursor(650, 35));
      await page.evaluate(() => window.clickCursor(650, 35));
      await page.evaluate(() => {
        const discussBtn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('discuss'));
        if (discussBtn) discussBtn.click();
      });
      await new Promise(r => setTimeout(r, 1000));
      await page.evaluate(() => window.moveCursor(700, 350));
      await new Promise(r => setTimeout(r, 1500));
      await page.evaluate(() => window.moveCursor(700, 550));
    }
  ));

  // ==========================================
  // STEP 8: RESULT SECTION
  // ==========================================
  clips.push(await recordStep(
    "step08_result",
    "/tmp/telos_strict_audio/step08_result.mp3",
    "08 // RESULT SECTION",
    "Over in the Result section, you can track your performance over time across all six dimensions, analyzing speech cadence, filler word decay, and overall interview readiness.",
    "#38bdf8",
    async () => {
      await page.evaluate(() => window.moveCursor(740, 35));
      await page.evaluate(() => window.clickCursor(740, 35));
      await page.evaluate(() => {
        const resultsBtn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('results'));
        if (resultsBtn) resultsBtn.click();
      });
      await new Promise(r => setTimeout(r, 1000));
      await page.evaluate(() => window.moveCursor(960, 320));
      await new Promise(r => setTimeout(r, 1500));
      await page.evaluate(() => window.moveCursor(1200, 480));
    }
  ));

  // ==========================================
  // STEP 9: DRILL SECTION
  // ==========================================
  clips.push(await recordStep(
    "step09_drill",
    "/tmp/telos_strict_audio/step09_drill.mp3",
    "09 // DRILL SECTION",
    "Then we have the Drill section for focused algorithmic practice. We select a challenge like Consistent Hashing or LRU Cache, run the code against our cloud sandbox, and verify that all test cases pass.",
    "#10b981",
    async () => {
      await page.evaluate(() => window.moveCursor(820, 35));
      await page.evaluate(() => window.clickCursor(820, 35));
      await page.evaluate(() => {
        const drillsBtn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('drills'));
        if (drillsBtn) drillsBtn.click();
      });
      await new Promise(r => setTimeout(r, 1000));
      await page.evaluate(() => window.moveCursor(650, 420));
      await new Promise(r => setTimeout(r, 1500));
      await page.evaluate(() => window.moveCursor(850, 480));
    }
  ));

  // ==========================================
  // STEP 10: USER DASHBOARD
  // ==========================================
  clips.push(await recordStep(
    "step10_dashboard",
    "/tmp/telos_strict_audio/step10_dashboard.mp3",
    "10 // USER DASHBOARD",
    "Now let's check the User Dashboard. Here you see your complete personal progress: your 84% readiness index, practice streaks, skill coverage across system design and coding, and your recent activity trail.",
    "#6e54f6",
    async () => {
      // Navigate to dashboard
      await page.evaluate(() => {
        const dashBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.toLowerCase().includes('dashboard'));
        if (dashBtn) dashBtn.click();
      });
      await new Promise(r => setTimeout(r, 1000));
      await page.evaluate(() => window.moveCursor(960, 250));
      await new Promise(r => setTimeout(r, 1500));
      await page.evaluate(() => window.moveCursor(1200, 380));
    }
  ));

  // ==========================================
  // STEP 11: FINISH
  // ==========================================
  clips.push(await recordStep(
    "step11_finish",
    "/tmp/telos_strict_audio/step11_finish.mp3",
    "11 // FINISH & WRAP UP",
    "And that's TeLos! A complete, end-to-end interview intelligence platform built to help you crack your dream role. Try it out at telos dot a-i, and let me know your thoughts in the comments!",
    "#ecff00",
    async () => {
      await page.evaluate(() => {
        const wordmark = document.querySelector('.wordmark') || Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('interview'));
        if (wordmark) wordmark.click();
      });
      await page.evaluate(() => window.moveCursor(960, 420));
      await new Promise(r => setTimeout(r, 2000));
      await page.evaluate(() => window.moveCursor(960, 580));
    }
  ));

  // ==========================================
  // CONCATENATE ALL CLIPS INTO FINAL MP4
  // ==========================================
  console.log("🎞️ Merging all 11 live recorded steps into telos-product-demo.mp4...");
  const mergeTxt = path.join(tempDir, "merge.txt");
  fs.writeFileSync(mergeTxt, clips.map(f => `file '${f}'`).join("\n"), "utf8");

  const finalMp4 = path.resolve(process.cwd(), "telos-product-demo.mp4");
  const mergeRes = spawnSync("ffmpeg", [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", mergeTxt,
    "-c", "copy",
    finalMp4
  ]);

  if (mergeRes.status === 0 && fs.existsSync(finalMp4)) {
    const sizeMb = (fs.statSync(finalMp4).size / (1024 * 1024)).toFixed(2);
    console.log(`🎉 SUCCESS: Generated ${finalMp4} (${sizeMb} MB)!`);

    const artifactDir = "/Users/baleshwarpandit/.gemini/antigravity/brain/001d66b6-feec-409a-b8e0-8fe36f62e987";
    const artifactMp4 = path.join(artifactDir, "telos-product-demo.mp4");
    fs.copyFileSync(finalMp4, artifactMp4);
    console.log(`📦 Copied to artifact directory: ${artifactMp4}`);
  } else {
    console.error("❌ Merge failed:", mergeRes.stderr?.toString());
  }

  await browser.close();
  console.log("ALL COMPLETE!");
})();
