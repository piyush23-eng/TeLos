const puppeteer = require('puppeteer');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const tempDir = "/tmp/telos_master_video";
const audioDir = "/tmp/telos_master_audio";
const bgmPath = "/tmp/bgm.wav";

if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

function getAudioDuration(filePath) {
  const res = spawnSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "csv=p=0",
    filePath
  ]);
  return parseFloat(res.stdout.toString().trim()) || 8.0;
}

(async () => {
  console.log("🚀 Launching Chrome for Premier Master Video Recording...");
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
  await page.goto('http://127.0.0.1:8787');
  await new Promise(r => setTimeout(r, 1500));

  async function ensureOverlay(targetPage) {
    await targetPage.evaluate(() => {
      if (document.getElementById('telos-master-cursor')) return;

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
      localStorage.setItem('telos-user', JSON.stringify(dummyUser));
      localStorage.setItem('telos-token', 'mock-valid-token');

      // Inject sleek ScreenStudio-like mouse pointer
      const cursor = document.createElement('div');
      cursor.id = 'telos-master-cursor';
      cursor.style.cssText = `
        position: fixed;
        top: 300px; left: 300px;
        width: 26px; height: 26px;
        background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="%230f172a" stroke="%23ffffff" stroke-width="2" stroke-linejoin="round"><path d="M5 3L19 12L12 14L9 21L5 3Z"/></svg>') no-repeat;
        pointer-events: none;
        z-index: 999999;
        filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
        transition: transform 0.16s ease-out, top 0.45s cubic-bezier(0.22, 1, 0.36, 1), left 0.45s cubic-bezier(0.22, 1, 0.36, 1);
      `;
      document.body.appendChild(cursor);

      // Ripple element for click effect
      const ripple = document.createElement('div');
      ripple.id = 'telos-click-ripple';
      ripple.style.cssText = `
        position: fixed;
        width: 44px; height: 44px;
        border-radius: 50%;
        border: 2px solid rgba(99, 102, 241, 0.85);
        background: rgba(99, 102, 241, 0.25);
        pointer-events: none;
        z-index: 999998;
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.2);
        transition: transform 0.35s ease-out, opacity 0.35s ease-out;
      `;
      document.body.appendChild(ripple);

      window.moveCursor = (x, y) => {
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
      };

      window.clickCursor = (x, y) => {
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
        cursor.style.transform = 'scale(0.85)';
        setTimeout(() => cursor.style.transform = 'scale(1)', 150);

        ripple.style.left = (x + 4) + 'px';
        ripple.style.top = (y + 4) + 'px';
        ripple.style.opacity = '1';
        ripple.style.transform = 'translate(-50%, -50%) scale(1.2)';
        setTimeout(() => {
          ripple.style.opacity = '0';
          ripple.style.transform = 'translate(-50%, -50%) scale(0.2)';
        }, 300);
      };

      // Inject Modern Glassmorphic Subtitle Capsule
      const sub = document.createElement('div');
      sub.id = 'telos-master-subtitles';
      sub.style.cssText = `
        position: fixed;
        bottom: 28px;
        left: 50%;
        transform: translateX(-50%);
        width: 1200px;
        max-width: 92%;
        background: rgba(12, 14, 24, 0.88);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 16px;
        padding: 16px 32px 18px 32px;
        backdrop-filter: blur(20px);
        box-shadow: 0 25px 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(99, 102, 241, 0.12);
        text-align: center;
        z-index: 999997;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `;
      document.body.appendChild(sub);

      // Keep Chrome compositor actively painting for 30fps screencast
      if (!window.__heartbeatStarted) {
        window.__heartbeatStarted = true;
        const tick = () => {
          const rip = document.getElementById('telos-click-ripple');
          if (rip) rip.setAttribute('data-tick', String(Date.now()));
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }

      window.setSub = (stage, title, text, accent) => {
        sub.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 6px;">
            <span style="display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 9999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); font-size: 11px; font-weight: 700; color: ${accent || '#6366f1'}; letter-spacing: 0.08em; text-transform: uppercase;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: ${accent || '#6366f1'}; box-shadow: 0 0 8px ${accent || '#6366f1'};"></span>
              ${stage}
            </span>
            <span style="font-size: 13px; font-weight: 600; color: #94a3b8; letter-spacing: 0.02em;">${title}</span>
          </div>
          <div style="font-size: 22px; line-height: 1.38; font-weight: 600; color: #ffffff; letter-spacing: -0.01em; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">
            "${text}"
          </div>
        `;
      };
    });
  }

  await ensureOverlay(page);
  await new Promise(r => setTimeout(r, 600));

  const client = await page.target().createCDPSession();

  // Helper to record each scene with frame-accurate video and mixed voice/BGM
  async function recordScene(sceneId, stage, title, text, accent, actionFn) {
    console.log(`🎬 Recording: ${stage} (${title})...`);
    await ensureOverlay(page);
    const audioFile = path.join(audioDir, `${sceneId}.mp3`);
    const targetDuration = getAudioDuration(audioFile);
    const videoOnlyMp4 = path.join(tempDir, `${sceneId}_video.mp4`);
    const mixedAudio = path.join(tempDir, `${sceneId}_audio.m4a`);
    const finalStepMp4 = path.join(tempDir, `${sceneId}.mp4`);

    // Mix Narration Voice + Subtle BGM
    spawnSync("ffmpeg", [
      "-y",
      "-i", audioFile,
      "-i", bgmPath,
      "-filter_complex", "[0:a]volume=1.0[v];[1:a]volume=0.06[m];[v][m]amix=inputs=2:duration=first:dropout_transition=2[a]",
      "-map", "[a]",
      "-c:a", "aac",
      "-b:a", "192k",
      mixedAudio
    ]);

    // Update Glassmorphic Subtitles
    await page.evaluate((stg, ttl, txt, acc) => window.setSub(stg, ttl, txt, acc), stage, title, text, accent);

    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-f', 'image2pipe',
      '-vcodec', 'mjpeg',
      '-r', '30',
      '-i', '-',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
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
    await client.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });

    const startTime = Date.now();
    try {
      await actionFn();
    } catch (err) {
      console.error(`Action error in ${sceneId}:`, err.message);
    }

    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = Math.max(0, targetDuration - elapsed);
    if (remaining > 0) {
      await new Promise(r => setTimeout(r, remaining * 1000));
    }

    await client.send('Page.stopScreencast');
    client.off('Page.screencastFrame', frameHandler);
    ffmpeg.stdin.end();
    await new Promise(r => ffmpeg.on('close', r));

    // Combine video with mixed audio track, padding video with last frame to guarantee 100% audio completion
    const padDuration = Math.ceil(targetDuration) + 2;
    spawnSync("ffmpeg", [
      "-y",
      "-i", videoOnlyMp4,
      "-i", mixedAudio,
      "-vf", `tpad=stop_mode=clone:stop_duration=${padDuration}`,
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "18",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "192k",
      "-shortest",
      finalStepMp4
    ]);

    console.log(`   ✓ Done: ${sceneId} (${frames} frames, synced to ${targetDuration.toFixed(2)}s).`);
    return finalStepMp4;
  }

  const clips = [];

  // =========================================================================
  // SCENE 1: CALIBRATION GREEN ROOM (Target Role & CV Grounding)
  // =========================================================================
  clips.push(await recordScene(
    "scene01_calibration",
    "01 // CALIBRATION GREEN ROOM",
    "Target Role Calibration & CV Grounding",
    "Welcome to TeLos: the autonomous AI technical interview platform. We begin in the Calibration Green Room, configuring a targeted Staff Systems Architect round for Google, and grounding the session directly against our distributed systems resume.",
    "#6366f1",
    async () => {
      // Move to Interview tab
      await page.evaluate(() => window.moveCursor(390, 35));
      await new Promise(r => setTimeout(r, 600));
      await page.evaluate(() => window.clickCursor(390, 35));
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('interview'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 800));

      // Fill in Google, Staff Role, Focus
      await page.evaluate(() => window.moveCursor(320, 540));
      await new Promise(r => setTimeout(r, 400));
      await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input.brutalist-text-input'));
        if (inputs[0]) { inputs[0].value = 'Google'; inputs[0].dispatchEvent(new Event('input', { bubbles: true })); }
        if (inputs[1]) { inputs[1].value = 'Staff Systems Architect (L6)'; inputs[1].dispatchEvent(new Event('input', { bubbles: true })); }
        if (inputs[2]) { inputs[2].value = 'Distributed Consensus & Kafka Partitioning'; inputs[2].dispatchEvent(new Event('input', { bubbles: true })); }
      });
      await new Promise(r => setTimeout(r, 1200));

      // Click + Systems CV button
      await page.evaluate(() => window.moveCursor(520, 675));
      await new Promise(r => setTimeout(r, 600));
      await page.evaluate(() => window.clickCursor(520, 675));
      await page.evaluate(() => {
        const cvBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Systems CV'));
        if (cvBtn) cvBtn.click();
      });
      await new Promise(r => setTimeout(r, 1500));

      // Click Continue to Verification
      await page.evaluate(() => window.moveCursor(660, 735));
      await new Promise(r => setTimeout(r, 800));
      await page.evaluate(() => window.clickCursor(660, 735));
      await page.evaluate(() => {
        const contBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('CONTINUE TO CAMERA'));
        if (contBtn) contBtn.click();
      });
    }
  ));

  // =========================================================================
  // SCENE 2: LIVE CONVERSATIONAL STUDIO (Alex AI + Telemetry HUD)
  // =========================================================================
  clips.push(await recordScene(
    "scene02_studio",
    "02 // LIVE CONVERSATIONAL STUDIO",
    "Real-Time AI Voice Interviewer & Telemetry",
    "Stepping into the live studio, meet Alex Rivera, our autonomous interviewer. Powered by sub-second voice streaming, Alex conducts a live conversational screen while the telemetry HUD tracks speech cadence, pacing, and candidate focus in real time.",
    "#10b981",
    async () => {
      // Click Join Call
      await page.evaluate(() => window.moveCursor(1150, 480));
      await new Promise(r => setTimeout(r, 600));
      await page.evaluate(() => window.clickCursor(1150, 480));
      await page.evaluate(() => {
        const joinBtn = document.querySelector('.join-call-btn-refined, button[class*="join-call"]');
        if (joinBtn) joinBtn.click();
      });
      await new Promise(r => setTimeout(r, 2000));

      // Hover over Alex video & conversational dialogue
      await page.evaluate(() => window.moveCursor(320, 420));
      await new Promise(r => setTimeout(r, 2500));

      // Move cursor to speech cadence and proctoring HUD
      await page.evaluate(() => window.moveCursor(560, 310));
      await new Promise(r => setTimeout(r, 2200));

      // Move cursor to active audio waveform
      await page.evaluate(() => window.moveCursor(800, 310));
      await new Promise(r => setTimeout(r, 2200));
    }
  ));

  // =========================================================================
  // SCENE 3: COLLABORATIVE SCRATCHPAD & ISOLATED CLOUD RUNNER
  // =========================================================================
  clips.push(await recordScene(
    "scene03_scratchpad",
    "03 // COLLABORATIVE SCRATCHPAD",
    "Multi-Language Runner & Architecture Topology",
    "Mid-interview, candidates can open the interactive scratchpad. Switch languages to Python, Java, C++, or Go, sketch system architecture nodes, and execute code live inside our secure isolated runner with instant output.",
    "#38bdf8",
    async () => {
      // Open scratchpad
      await page.evaluate(() => {
        const padBtn = Array.from(document.querySelectorAll('button')).find(b =>
          b.innerText.toLowerCase().includes('scratchpad') ||
          b.innerText.toLowerCase().includes('code')
        );
        if (padBtn) padBtn.click();
      });
      await page.evaluate(() => window.moveCursor(240, 820));
      await new Promise(r => setTimeout(r, 1200));

      // Add architecture blocks: + API Gateway, + Kafka Queue, + Redis Cache
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('.architecture-node-adder button, button[class*="arch-add"], button'));
        const gwBtn = btns.find(b => b.innerText.includes('API Gateway'));
        if (gwBtn) gwBtn.click();
        const kfBtn = btns.find(b => b.innerText.includes('Kafka'));
        if (kfBtn) kfBtn.click();
        const rdBtn = btns.find(b => b.innerText.includes('Redis'));
        if (rdBtn) rdBtn.click();
      });
      await page.evaluate(() => window.moveCursor(380, 820));
      await new Promise(r => setTimeout(r, 1500));

      // Populate Python consensus algorithm
      await page.evaluate(() => {
        const txt = document.querySelector('textarea.code-editor-area, textarea');
        if (txt) {
          txt.value = `# Raft Quorum Consensus & Network Partition Recovery
def verify_quorum(cluster_size: int, active_peers: list) -> dict:
    quorum_threshold = (cluster_size // 2) + 1
    healthy_peers = [p for p in active_peers if p.get('term') == 4 and p.get('status') == 'OK']
    return {
        "status": "QUORUM_ESTABLISHED" if len(healthy_peers) >= quorum_threshold else "LEADER_STEP_DOWN",
        "healthy_count": len(healthy_peers),
        "majority_met": len(healthy_peers) >= quorum_threshold,
        "latency_ms": 11.4
    }

print("TeLos Cloud Execution:", verify_quorum(5, [
    {"node": "raft-1", "term": 4, "status": "OK"},
    {"node": "raft-2", "term": 4, "status": "OK"},
    {"node": "raft-3", "term": 4, "status": "OK"}
]))`;
          txt.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      await page.evaluate(() => window.moveCursor(500, 920));
      await new Promise(r => setTimeout(r, 1500));

      // Click Run Code
      await page.evaluate(() => {
        const runBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.toLowerCase().includes('run'));
        if (runBtn) runBtn.click();
      });
      await page.evaluate(() => window.moveCursor(815, 775));
      await new Promise(r => setTimeout(r, 2000));
    }
  ));

  // =========================================================================
  // SCENE 4: BARGE-IN CAPABILITY & ADAPTIVE TURN-TAKING
  // =========================================================================
  clips.push(await recordScene(
    "scene04_bargein",
    "04 // BARGE-IN CAPABILITY",
    "Real-Time Turn Taking & Adaptive Probing",
    "Unlike rigid question banks, communication is fluid. With one-click barge-in capability, candidates can interrupt mid-sentence to clarify constraints, and Alex immediately adapts the technical follow-up without awkward speech collision.",
    "#f43f5e",
    async () => {
      // Move to Interrupt Alex button
      await page.evaluate(() => window.moveCursor(320, 670));
      await new Promise(r => setTimeout(r, 1200));
      await page.evaluate(() => window.clickCursor(320, 670));
      await page.evaluate(() => {
        const intBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.toLowerCase().includes('interrupt'));
        if (intBtn) intBtn.click();
      });
      await new Promise(r => setTimeout(r, 2000));

      // Move cursor to dialogue card showing candidate speech
      await page.evaluate(() => window.moveCursor(320, 620));
      await new Promise(r => setTimeout(r, 3000));

      // Move cursor back to active waveform
      await page.evaluate(() => window.moveCursor(650, 520));
      await new Promise(r => setTimeout(r, 2500));
    }
  ));

  // =========================================================================
  // SCENE 5: 6-DIMENSION ASSESSMENT DEBRIEF SCORECARD
  // =========================================================================
  clips.push(await recordScene(
    "scene05_debrief",
    "05 // 6-DIMENSION DEBRIEF",
    "Granular Bar Raiser Radar & Action Roadmap",
    "When the interview wraps, TeLos synthesizes the full session into an exhaustive Bar Raiser debrief: rating technical depth, system design, and communication, paired with transcript-grounded coaching.",
    "#f59e0b",
    async () => {
      // Click End Call
      await page.evaluate(() => {
        const endBtn = document.querySelector('.end-call-btn-refined, button[class*="end-call"]');
        if (endBtn) endBtn.click();
      });
      await new Promise(r => setTimeout(r, 500));
      await page.evaluate(() => {
        const confirmBtn = document.querySelector('.end-call-confirm-actions .btn-confirm');
        if (confirmBtn) confirmBtn.click();
      });
      await new Promise(r => setTimeout(r, 2000));

      // Move cursor across radial score gauges
      await page.evaluate(() => window.moveCursor(300, 440));
      await new Promise(r => setTimeout(r, 1200));
      await page.evaluate(() => window.moveCursor(460, 440));
      await new Promise(r => setTimeout(r, 1200));
      await page.evaluate(() => window.moveCursor(620, 440));
      await new Promise(r => setTimeout(r, 1200));

      // Hover over Bar Raiser Notes
      await page.evaluate(() => window.moveCursor(500, 680));
      await new Promise(r => setTimeout(r, 2000));

      // Close modal
      await page.evaluate(() => {
        const closeBtn = document.querySelector('.report-modal .close-modal, .close-report');
        if (closeBtn) closeBtn.click();
      });
    }
  ));

  // =========================================================================
  // SCENE 6: 47+ CURATED COMPANY PLAYBOOKS
  // =========================================================================
  clips.push(await recordScene(
    "scene06_companies",
    "06 // COMPANY PLAYBOOKS",
    "47 Tailored 6-Week Blueprints & Rubrics",
    "Beyond live simulation, TeLos features over forty-seven company playbooks — covering Google, Meta, Amazon, and Stripe to Razorpay and Flipkart — with round-by-round rubrics and six-week master blueprints.",
    "#a855f7",
    async () => {
      // Navigate to Company prep
      await page.evaluate(() => window.moveCursor(440, 35));
      await new Promise(r => setTimeout(r, 600));
      await page.evaluate(() => window.clickCursor(440, 35));
      await page.evaluate(() => {
        const prepBtn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('company'));
        if (prepBtn) prepBtn.click();
      });
      await new Promise(r => setTimeout(r, 1500));

      // Move cursor to Google card
      await page.evaluate(() => window.moveCursor(260, 630));
      await new Promise(r => setTimeout(r, 1500));
      await page.evaluate(() => window.clickCursor(260, 630));

      // Move cursor to Google 6-week blueprint
      await page.evaluate(() => window.moveCursor(600, 650));
      await new Promise(r => setTimeout(r, 2000));

      // Hover Amazon and Microsoft
      await page.evaluate(() => window.moveCursor(260, 720));
      await new Promise(r => setTimeout(r, 1500));
    }
  ));

  // =========================================================================
  // SCENE 7: PROCTORED ASSESSMENT ARENA
  // =========================================================================
  clips.push(await recordScene(
    "scene07_assessment",
    "07 // PROCTORED ASSESSMENTS",
    "Lockdown Online Assessment & Test Harness",
    "Need to simulate strict online assessment conditions? The Proctored Assessment Arena provides timed coding challenges, automated test execution, and camera attention monitoring under genuine exam constraints.",
    "#ec4899",
    async () => {
      // Navigate to Assessment
      await page.evaluate(() => window.moveCursor(495, 35));
      await new Promise(r => setTimeout(r, 600));
      await page.evaluate(() => window.clickCursor(495, 35));
      await page.evaluate(() => {
        const assessBtn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('assessment'));
        if (assessBtn) assessBtn.click();
      });
      await new Promise(r => setTimeout(r, 1200));

      // Click Start Assessment (preflight)
      await page.evaluate(() => {
        const startBtn = document.querySelector('.assessment-launch .black-button, button');
        if (startBtn && startBtn.innerText.includes('Start')) startBtn.click();
      });
      await new Promise(r => setTimeout(r, 1000));

      // Allow camera/mic preflight
      await page.evaluate(() => {
        const allowBtn = document.querySelector('.preflight-permission');
        if (allowBtn) allowBtn.click();
      });
      await new Promise(r => setTimeout(r, 1000));

      // Enter exam environment
      await page.evaluate(() => {
        const enterBtn = document.querySelector('.preflight-enter');
        if (enterBtn) enterBtn.click();
      });
      await new Promise(r => setTimeout(r, 1500));

      // Move cursor across problem editor and test cases
      await page.evaluate(() => window.moveCursor(320, 380));
      await new Promise(r => setTimeout(r, 1800));
      await page.evaluate(() => window.moveCursor(950, 480));
      await new Promise(r => setTimeout(r, 1800));
    }
  ));

  // =========================================================================
  // SCENE 8: ALGORITHMIC DRILLS WORKBENCH
  // =========================================================================
  clips.push(await recordScene(
    "scene08_drills",
    "08 // PRACTICE DRILLS",
    "Rapid-Fire DSA & Architecture Drills",
    "For targeted practice, the Drills Workbench offers rapid-fire algorithmic and system design challenges, allowing you to test edge cases with instant compiler feedback across multiple runtimes.",
    "#22c55e",
    async () => {
      // Navigate to Drills
      await page.evaluate(() => window.moveCursor(615, 35));
      await new Promise(r => setTimeout(r, 600));
      await page.evaluate(() => window.clickCursor(615, 35));
      await page.evaluate(() => {
        const drillsBtn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('drills'));
        if (drillsBtn) drillsBtn.click();
      });
      await new Promise(r => setTimeout(r, 1500));

      // Click on first drill
      await page.evaluate(() => window.moveCursor(320, 350));
      await new Promise(r => setTimeout(r, 1200));
      await page.evaluate(() => window.clickCursor(320, 350));
      await page.evaluate(() => {
        const drillCard = document.querySelector('.drill-item, .drill-row, .card');
        if (drillCard) drillCard.click();
      });
      await new Promise(r => setTimeout(r, 1500));

      // Hover over Run Test Cases button
      await page.evaluate(() => window.moveCursor(850, 380));
      await new Promise(r => setTimeout(r, 2000));
    }
  ));

  // =========================================================================
  // SCENE 9: COMMUNITY DISCUSS & PEER INTEL
  // =========================================================================
  clips.push(await recordScene(
    "scene09_discuss",
    "09 // COMMUNITY DISCUSS",
    "Interview Debriefs & Verified Offers",
    "The Discuss hub connects you with candidates sharing recent interview questions, system design trade-offs, and verified compensation breakdowns across major engineering hubs.",
    "#06b6d4",
    async () => {
      // Navigate to Discuss
      await page.evaluate(() => window.moveCursor(535, 35));
      await new Promise(r => setTimeout(r, 600));
      await page.evaluate(() => window.clickCursor(535, 35));
      await page.evaluate(() => {
        const discussBtn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('discuss'));
        if (discussBtn) discussBtn.click();
      });
      await new Promise(r => setTimeout(r, 1500));

      // Move cursor across discussion threads
      await page.evaluate(() => window.moveCursor(500, 380));
      await new Promise(r => setTimeout(r, 1500));
      await page.evaluate(() => window.moveCursor(500, 520));
      await new Promise(r => setTimeout(r, 1800));
    }
  ));

  // =========================================================================
  // SCENE 10: CANDIDATE DASHBOARD & HISTORICAL READINESS
  // =========================================================================
  clips.push(await recordScene(
    "scene10_dashboard",
    "10 // CANDIDATE DASHBOARD",
    "Quantifiable Readiness Index & Skill Growth",
    "Finally, the Candidate Dashboard treats your preparation as a quantifiable dataset — unifying your readiness index, practice streaks, and filler word decay curves into a single command center.",
    "#8b5cf6",
    async () => {
      // Open account dropdown
      await page.evaluate(() => window.moveCursor(925, 35));
      await new Promise(r => setTimeout(r, 600));
      await page.evaluate(() => window.clickCursor(925, 35));
      await page.evaluate(() => {
        const acctBtn = document.querySelector('.account-cta');
        if (acctBtn) acctBtn.click();
      });
      await new Promise(r => setTimeout(r, 500));

      // Click My dashboard
      await page.evaluate(() => {
        const dashBtn = Array.from(document.querySelectorAll('.account-popover button, button')).find(b => b.innerText.toLowerCase().includes('dashboard'));
        if (dashBtn) dashBtn.click();
      });
      await new Promise(r => setTimeout(r, 1500));

      // Hover over 84 Readiness Index badge
      await page.evaluate(() => window.moveCursor(780, 310));
      await new Promise(r => setTimeout(r, 2000));

      // Hover over 7-day streak & verified portfolio
      await page.evaluate(() => window.moveCursor(500, 600));
      await new Promise(r => setTimeout(r, 2000));
    }
  ));

  // =========================================================================
  // SCENE 11: CALL TO ACTION & OPEN-SOURCE LAUNCH
  // =========================================================================
  clips.push(await recordScene(
    "scene11_cta",
    "11 // PRODUCTION LAUNCH",
    "TeLos • Open Source Interview Intelligence",
    "TeLos is production-ready, open source, and built to help you land your dream role. Star the repo on GitHub and start practicing today!",
    "#f43f5e",
    async () => {
      // Navigate to Interview screen
      await page.evaluate(() => {
        const ivBtn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('interview'));
        if (ivBtn) ivBtn.click();
      });
      await page.evaluate(() => window.moveCursor(960, 400));
      await new Promise(r => setTimeout(r, 2500));
      await page.evaluate(() => window.moveCursor(960, 520));
      await new Promise(r => setTimeout(r, 2500));
    }
  ));

  // =========================================================================
  // MERGE ALL 11 RECORDED SCENES INTO FINAL 1080P MP4
  // =========================================================================
  console.log("🎞️ Merging all 11 scenes into the master production demo...");
  const mergeTxt = path.join(tempDir, "merge.txt");
  fs.writeFileSync(mergeTxt, clips.map(f => `file '${f}'`).join("\n"), "utf8");

  const finalMp4 = path.resolve(process.cwd(), "telos-product-demo.mp4");
  const mergeRes = spawnSync("ffmpeg", [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", mergeTxt,
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    finalMp4
  ]);

  if (mergeRes.status === 0 && fs.existsSync(finalMp4)) {
    const sizeMb = (fs.statSync(finalMp4).size / (1024 * 1024)).toFixed(2);
    console.log(`🎉 SUCCESS: Master video produced at ${finalMp4} (${sizeMb} MB)!`);

    const artifactDir = "/Users/baleshwarpandit/.gemini/antigravity/brain/001d66b6-feec-409a-b8e0-8fe36f62e987";
    const artifactMp4 = path.join(artifactDir, "telos-product-demo.mp4");
    fs.copyFileSync(finalMp4, artifactMp4);
    console.log(`📦 Synced master video to artifact: ${artifactMp4}`);
  } else {
    console.error("❌ Merge failed:", mergeRes.stderr?.toString());
  }

  await browser.close();
  console.log("✨ MASTER VIDEO GENERATION COMPLETED!");
})();
