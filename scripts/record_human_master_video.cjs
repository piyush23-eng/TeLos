const puppeteer = require('puppeteer');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const tempDir = "/tmp/telos_master_video_v2";
const audioDir = "/tmp/telos_human_audio";
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

let currentPos = { x: 960, y: 540 };

(async () => {
  console.log("🚀 Launching Chrome for Premier Master Video with REAL HUMAN VOICEOVER...");
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

  await page.evaluateOnNewDocument(() => {
    const dummyUser = {
      id: 'usr-piyush',
      name: 'Piyush',
      email: 'piyush@telos.ai',
      provider: 'github',
      bio: 'Full-Stack Systems Architect & AI Engineer specializing in distributed consensus, low-latency audio pipelines, and high-performance infrastructure.',
      linkedin: 'linkedin.com/in/piyush',
      github: 'github.com/piyush23-eng',
      experience: 'Staff Systems Architect • 8+ years distributed systems & real-time AI',
      projects: 'TeLos — Autonomous Technical Interview Platform\nRaftKV — Distributed Consensus Store'
    };
    localStorage.setItem('telos-user', JSON.stringify(dummyUser));
    localStorage.setItem('telos-token', 'mock-valid-token');
  });

  await page.goto('http://127.0.0.1:8787');
  await new Promise(r => setTimeout(r, 1200));

  async function ensureOverlay(targetPage) {
    await targetPage.evaluate(() => {
      if (document.getElementById('telos-master-cursor')) return;

      const dummyUser = {
        id: 'usr-piyush',
        name: 'Piyush',
        email: 'piyush@telos.ai',
        provider: 'github',
        bio: 'Full-Stack Systems Architect & AI Engineer specializing in distributed consensus, low-latency audio pipelines, and high-performance infrastructure.',
        linkedin: 'linkedin.com/in/piyush',
        github: 'github.com/piyush23-eng',
        experience: 'Staff Systems Architect • 8+ years distributed systems & real-time AI',
        projects: 'TeLos — Autonomous Technical Interview Platform\nRaftKV — Distributed Consensus Store'
      };
      localStorage.setItem('telos-user', JSON.stringify(dummyUser));
      localStorage.setItem('telos-token', 'mock-valid-token');

      // Realistic macOS cursor with shadow
      const cursor = document.createElement('div');
      cursor.id = 'telos-master-cursor';
      cursor.style.cssText = `
        position: fixed;
        top: 540px; left: 960px;
        width: 24px; height: 24px;
        background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%230f172a" stroke="%23ffffff" stroke-width="2" stroke-linejoin="round"><path d="M5 3L19 12L12 14L9 21L5 3Z"/></svg>') no-repeat;
        pointer-events: none;
        z-index: 999999;
        filter: drop-shadow(0 4px 10px rgba(0,0,0,0.45));
        transition: transform 0.12s ease-out;
      `;
      document.body.appendChild(cursor);

      // Smooth click ripple
      const ripple = document.createElement('div');
      ripple.id = 'telos-click-ripple';
      ripple.style.cssText = `
        position: fixed;
        width: 40px; height: 40px;
        border-radius: 50%;
        border: 2px solid rgba(99, 102, 241, 0.9);
        background: rgba(99, 102, 241, 0.2);
        pointer-events: none;
        z-index: 999998;
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.2);
        transition: transform 0.3s ease-out, opacity 0.3s ease-out;
      `;
      document.body.appendChild(ripple);

      // Heartbeat pulse to keep Chrome compositor pushing frames at 30fps
      if (!window.__heartbeatStarted) {
        window.__heartbeatStarted = true;
        const tick = () => {
          const rip = document.getElementById('telos-click-ripple');
          if (rip) rip.setAttribute('data-tick', String(Date.now()));
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }

      // Glassmorphic Subtitle Capsule
      const sub = document.createElement('div');
      sub.id = 'telos-master-subtitles';
      sub.style.cssText = `
        position: fixed;
        bottom: 28px;
        left: 50%;
        transform: translateX(-50%);
        width: 1240px;
        max-width: 92%;
        background: rgba(10, 12, 22, 0.88);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 16px;
        padding: 16px 36px 18px 36px;
        backdrop-filter: blur(24px);
        box-shadow: 0 25px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(99, 102, 241, 0.12);
        text-align: center;
        z-index: 999997;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `;
      document.body.appendChild(sub);

      window.setSub = (stage, title, text, accent) => {
        sub.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 6px;">
            <span style="display: inline-flex; align-items: center; gap: 6px; padding: 3px 12px; border-radius: 9999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); font-size: 11px; font-weight: 700; color: ${accent || '#6366f1'}; letter-spacing: 0.08em; text-transform: uppercase;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: ${accent || '#6366f1'}; box-shadow: 0 0 8px ${accent || '#6366f1'};"></span>
              ${stage}
            </span>
            <span style="font-size: 13px; font-weight: 600; color: #94a3b8; letter-spacing: 0.02em;">${title}</span>
          </div>
          <div style="font-size: 21px; line-height: 1.4; font-weight: 600; color: #ffffff; letter-spacing: -0.01em; text-shadow: 0 2px 10px rgba(0,0,0,0.6);">
            "${text}"
          </div>
        `;
      };
    });
  }

  // Smooth Bezier Curve Mouse Movement
  async function humanMove(toX, toY, durationMs = 500) {
    const fromX = currentPos.x;
    const fromY = currentPos.y;
    const steps = Math.max(12, Math.floor(durationMs / 25));
    // Midpoint with natural curve bias
    const midX = (fromX + toX) / 2 + (Math.random() * 30 - 15);
    const midY = (fromY + toY) / 2 + (Math.random() * 30 - 15);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Cubic ease-out
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const x = (1 - ease) * (1 - ease) * fromX + 2 * (1 - ease) * ease * midX + ease * ease * toX;
      const y = (1 - ease) * (1 - ease) * fromY + 2 * (1 - ease) * ease * midY + ease * ease * toY;

      await page.evaluate((px, py) => {
        const cursor = document.getElementById('telos-master-cursor');
        if (cursor) {
          cursor.style.left = px + 'px';
          cursor.style.top = py + 'px';
        }
      }, Math.round(x), Math.round(y));

      await new Promise(r => setTimeout(r, Math.floor(durationMs / steps)));
    }
    currentPos = { x: toX, y: toY };
  }

  // Smooth Human Click with natural hold and ripple effect
  async function humanClick(x, y) {
    await humanMove(x, y, 450);
    await new Promise(r => setTimeout(r, 100));

    await page.evaluate((cx, cy) => {
      const cursor = document.getElementById('telos-master-cursor');
      const ripple = document.getElementById('telos-click-ripple');
      if (cursor) cursor.style.transform = 'scale(0.82)';
      if (ripple) {
        ripple.style.left = (cx + 3) + 'px';
        ripple.style.top = (cy + 3) + 'px';
        ripple.style.opacity = '1';
        ripple.style.transform = 'translate(-50%, -50%) scale(1.2)';
      }
    }, x, y);

    await new Promise(r => setTimeout(r, 140));

    await page.evaluate(() => {
      const cursor = document.getElementById('telos-master-cursor');
      const ripple = document.getElementById('telos-click-ripple');
      if (cursor) cursor.style.transform = 'scale(1)';
      if (ripple) {
        ripple.style.opacity = '0';
        ripple.style.transform = 'translate(-50%, -50%) scale(0.2)';
      }
    });

    await new Promise(r => setTimeout(r, 120));
  }

  // Get true bounding box center of any element
  async function clickElementCenter(selectorFn, fallbackX, fallbackY) {
    const coords = await page.evaluate(selectorFn);
    if (coords && coords.x && coords.y) {
      await humanClick(Math.round(coords.x + coords.w / 2), Math.round(coords.y + coords.h / 2));
    } else if (fallbackX && fallbackY) {
      await humanClick(fallbackX, fallbackY);
    }
  }

  await ensureOverlay(page);
  await new Promise(r => setTimeout(r, 500));

  const client = await page.target().createCDPSession();

  // Record scene with frame-accurate video and mixed real human voice/ambient track
  async function recordScene(sceneId, stage, title, text, accent, actionFn) {
    console.log(`🎬 Recording: ${stage} (${title})...`);
    await ensureOverlay(page);
    const audioFile = path.join(audioDir, `${sceneId}.mp3`);
    const targetDuration = getAudioDuration(audioFile);
    const videoOnlyMp4 = path.join(tempDir, `${sceneId}_video.mp4`);
    const mixedAudio = path.join(tempDir, `${sceneId}_audio.m4a`);
    const finalStepMp4 = path.join(tempDir, `${sceneId}.mp4`);

    // Mix Human Narration Voice + Low-Volume Ambient Track
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

    // Update Subtitles
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

    // Combine video with mixed human audio track, padding video with last frame to ensure 100% audio completion
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
  // SCENE 1: CALIBRATION GREEN ROOM (Target Role & CV Grounding) ~23.5s
  // =========================================================================
  clips.push(await recordScene(
    "scene01_calibration",
    "01 // CALIBRATION GREEN ROOM",
    "Target Role Calibration & CV Grounding",
    "Preparing for senior engineering interviews has always been broken. Grinding hundreds of LeetCode problems doesn't teach you how to defend architectural trade-offs under pressure. Today, we are launching TeLos: the autonomous AI technical interview platform. We begin in the Calibration Green Room, targeting an L6 Staff Systems Architect round at Google, and grounding the session directly in our distributed systems resume.",
    "#6366f1",
    async () => {
      // Move to Interview tab
      await clickElementCenter(() => {
        const b = Array.from(document.querySelectorAll('header nav button')).find(x => x.innerText.toLowerCase().includes('interview'));
        if (b) {
          const r = b.getBoundingClientRect();
          b.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 390, 35);
      await new Promise(r => setTimeout(r, 1000));

      // Click and fill Company Input
      await clickElementCenter(() => {
        const inputs = Array.from(document.querySelectorAll('input.brutalist-text-input'));
        if (inputs[0]) {
          const r = inputs[0].getBoundingClientRect();
          inputs[0].focus();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 320, 540);
      await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input.brutalist-text-input'));
        if (inputs[0]) { inputs[0].value = 'Google'; inputs[0].dispatchEvent(new Event('input', { bubbles: true })); }
      });
      await new Promise(r => setTimeout(r, 800));

      // Click and fill Seniority Input
      await clickElementCenter(() => {
        const inputs = Array.from(document.querySelectorAll('input.brutalist-text-input'));
        if (inputs[1]) {
          const r = inputs[1].getBoundingClientRect();
          inputs[1].focus();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 320, 600);
      await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input.brutalist-text-input'));
        if (inputs[1]) { inputs[1].value = 'Staff Systems Architect (L6)'; inputs[1].dispatchEvent(new Event('input', { bubbles: true })); }
      });
      await new Promise(r => setTimeout(r, 800));

      // Click and fill Focus Input
      await clickElementCenter(() => {
        const inputs = Array.from(document.querySelectorAll('input.brutalist-text-input'));
        if (inputs[2]) {
          const r = inputs[2].getBoundingClientRect();
          inputs[2].focus();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 320, 660);
      await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input.brutalist-text-input'));
        if (inputs[2]) { inputs[2].value = 'Distributed Consensus & Kafka Partitioning'; inputs[2].dispatchEvent(new Event('input', { bubbles: true })); }
      });
      await new Promise(r => setTimeout(r, 1200));

      // Click + Systems CV button
      await clickElementCenter(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(x => x.innerText.includes('Systems CV'));
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 520, 675);
      await new Promise(r => setTimeout(r, 1500));

      // Click Continue to Verification
      await clickElementCenter(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(x => x.innerText.includes('CONTINUE TO CAMERA'));
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 660, 735);
      await new Promise(r => setTimeout(r, 1000));
    }
  ));

  // =========================================================================
  // SCENE 2: LIVE CONVERSATIONAL STUDIO (Alex AI + Telemetry HUD) ~15.0s
  // =========================================================================
  clips.push(await recordScene(
    "scene02_studio",
    "02 // LIVE CONVERSATIONAL STUDIO",
    "Real-Time AI Voice Interviewer & Telemetry",
    "Entering the live studio, meet Alex, our autonomous AI interviewer. Alex conducts an authentic conversational technical screen with low-latency audio streaming, while our live HUD continuously tracks your speaking pace, cognitive clarity, and focus integrity in real time.",
    "#10b981",
    async () => {
      // Click Join Call
      await clickElementCenter(() => {
        const btn = document.querySelector('.join-call-btn-refined, button[class*="join-call"]');
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 1150, 480);
      await new Promise(r => setTimeout(r, 2200));

      // Glide smoothly to Alex video
      await humanMove(330, 420, 600);
      await new Promise(r => setTimeout(r, 2200));

      // Glide to speech telemetry HUD (140 WPM, optimal)
      await humanMove(560, 310, 600);
      await new Promise(r => setTimeout(r, 2000));

      // Glide to audio live waveform
      await humanMove(800, 310, 500);
      await new Promise(r => setTimeout(r, 2000));
    }
  ));

  // =========================================================================
  // SCENE 3: COLLABORATIVE SCRATCHPAD & ISOLATED CLOUD RUNNER ~15.0s
  // =========================================================================
  clips.push(await recordScene(
    "scene03_scratchpad",
    "03 // COLLABORATIVE SCRATCHPAD",
    "Multi-Language Runner & Architecture Topology",
    "Mid-interview, candidates can open the interactive scratchpad. Diagram system topologies with real-time latency indicators, write algorithms in Python, Java, Go, or C++, and execute code inside our secure cloud sandbox with zero latency.",
    "#38bdf8",
    async () => {
      // Click open Scratchpad
      await clickElementCenter(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(x =>
          x.innerText.toLowerCase().includes('scratchpad') ||
          x.innerText.toLowerCase().includes('code')
        );
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 240, 820);
      await new Promise(r => setTimeout(r, 1200));

      // Click + API Gateway
      await clickElementCenter(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(x => x.innerText.includes('API Gateway'));
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 200, 820);
      await new Promise(r => setTimeout(r, 800));

      // Click + Redis Cache
      await clickElementCenter(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(x => x.innerText.includes('Redis'));
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 360, 820);
      await new Promise(r => setTimeout(r, 800));

      // Populate Python algorithm in scratchpad
      await page.evaluate(() => {
        const txt = document.querySelector('textarea.code-editor-area, textarea');
        if (txt) {
          txt.value = `# Raft Quorum Consensus & Partition Recovery
def verify_quorum(cluster_size: int, active_peers: list) -> dict:
    quorum_threshold = (cluster_size // 2) + 1
    healthy = [p for p in active_peers if p.get('term') == 4 and p.get('status') == 'OK']
    return {
        "status": "QUORUM_ESTABLISHED" if len(healthy) >= quorum_threshold else "LEADER_STEP_DOWN",
        "healthy_count": len(healthy),
        "majority_met": len(healthy) >= quorum_threshold,
        "latency_ms": 11.4
    }

print("TeLos Cloud Sandbox:", verify_quorum(5, [
    {"node": "raft-1", "term": 4, "status": "OK"},
    {"node": "raft-2", "term": 4, "status": "OK"},
    {"node": "raft-3", "term": 4, "status": "OK"}
]))`;
          txt.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      await humanMove(500, 920, 500);
      await new Promise(r => setTimeout(r, 1000));

      // Click Run Code
      await clickElementCenter(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(x => x.innerText.toLowerCase().includes('run'));
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 815, 775);
      await new Promise(r => setTimeout(r, 2000));
    }
  ));

  // =========================================================================
  // SCENE 4: BARGE-IN CAPABILITY & ADAPTIVE TURN-TAKING ~11.6s
  // =========================================================================
  clips.push(await recordScene(
    "scene04_bargein",
    "04 // BARGE-IN CAPABILITY",
    "Real-Time Turn Taking & Adaptive Probing",
    "Communication isn't scripted — it's fluid. With instant barge-in capability, you can interrupt mid-sentence to clarify constraints, and Alex immediately adapts the technical follow-up without awkward speech collision.",
    "#f43f5e",
    async () => {
      // Smoothly move to Interrupt Alex button and click
      await clickElementCenter(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(x => x.innerText.toLowerCase().includes('interrupt'));
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 320, 670);
      await new Promise(r => setTimeout(r, 1500));

      // Hover over candidate speech response
      await humanMove(320, 620, 500);
      await new Promise(r => setTimeout(r, 2500));

      // Glide over live audio visualizer
      await humanMove(650, 520, 500);
      await new Promise(r => setTimeout(r, 2000));
    }
  ));

  // =========================================================================
  // SCENE 5: 6-DIMENSION ASSESSMENT DEBRIEF SCORECARD ~13.0s
  // =========================================================================
  clips.push(await recordScene(
    "scene05_debrief",
    "05 // 6-DIMENSION DEBRIEF",
    "Granular Bar Raiser Radar & Action Roadmap",
    "The second your session wraps, TeLos synthesizes the full transcript into an exhaustive Bar Raiser debrief: rating technical depth, system design, and communication, backed by concrete evidence and a 48-hour improvement roadmap.",
    "#f59e0b",
    async () => {
      // Click End Call
      await clickElementCenter(() => {
        const btn = document.querySelector('.end-call-btn-refined, button[class*="end-call"]');
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 370, 715);
      await new Promise(r => setTimeout(r, 500));

      // Confirm End Call
      await clickElementCenter(() => {
        const btn = document.querySelector('.end-call-confirm-actions .btn-confirm');
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 960, 550);
      await new Promise(r => setTimeout(r, 2200));

      // Glide smoothly across gauges
      await humanMove(300, 440, 500);
      await new Promise(r => setTimeout(r, 1200));
      await humanMove(460, 440, 500);
      await new Promise(r => setTimeout(r, 1200));
      await humanMove(620, 440, 500);
      await new Promise(r => setTimeout(r, 1200));

      // Hover over Bar Raiser Notes
      await humanMove(500, 680, 500);
      await new Promise(r => setTimeout(r, 1800));

      // Close debrief modal
      await page.evaluate(() => {
        const btn = document.querySelector('.report-modal .close-modal, .close-report');
        if (btn) btn.click();
      });
    }
  ));

  // =========================================================================
  // SCENE 6: 47+ CURATED COMPANY PLAYBOOKS ~13.6s
  // =========================================================================
  clips.push(await recordScene(
    "scene06_companies",
    "06 // COMPANY PLAYBOOKS",
    "47 Tailored 6-Week Blueprints & Rubrics",
    "Beyond live simulation, TeLos includes over forty-seven company playbooks — from Google and Stripe to Amazon, Swiggy, and Razorpay — complete with round-by-round rubrics and six-week master blueprints.",
    "#a855f7",
    async () => {
      // Navigate to Company prep
      await clickElementCenter(() => {
        const btn = Array.from(document.querySelectorAll('header nav button')).find(x => x.innerText.toLowerCase().includes('company'));
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 440, 35);
      await new Promise(r => setTimeout(r, 1500));

      // Glide to Google playbook card and click
      await clickElementCenter(() => {
        const card = Array.from(document.querySelectorAll('div, button')).find(x => x.innerText && x.innerText.includes('Google') && x.innerText.includes('Round 01'));
        if (card) {
          const r = card.getBoundingClientRect();
          card.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 260, 630);
      await new Promise(r => setTimeout(r, 1500));

      // Glide down into 6-week blueprint
      await humanMove(600, 650, 600);
      await new Promise(r => setTimeout(r, 2200));

      // Hover Amazon card
      await humanMove(260, 740, 500);
      await new Promise(r => setTimeout(r, 1800));
    }
  ));

  // =========================================================================
  // SCENE 7: PROCTORED ASSESSMENT ARENA ~10.9s
  // =========================================================================
  clips.push(await recordScene(
    "scene07_assessment",
    "07 // PROCTORED ASSESSMENTS",
    "Lockdown Online Assessment & Test Harness",
    "Need to simulate rigorous online assessments? The Assessment Arena provides timed coding challenges, automated test execution, and camera attention monitoring under genuine exam constraints.",
    "#ec4899",
    async () => {
      // Navigate to Assessment
      await clickElementCenter(() => {
        const btn = Array.from(document.querySelectorAll('header nav button')).find(x => x.innerText.toLowerCase().includes('assessment'));
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 495, 35);
      await new Promise(r => setTimeout(r, 1200));

      // Click Start Assessment (preflight)
      await clickElementCenter(() => {
        const btn = document.querySelector('.assessment-launch .black-button, button');
        if (btn && btn.innerText.includes('Start')) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 960, 520);
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
      await new Promise(r => setTimeout(r, 1200));

      // Glide over question statement & editor
      await humanMove(350, 380, 500);
      await new Promise(r => setTimeout(r, 1500));
      await humanMove(950, 480, 500);
      await new Promise(r => setTimeout(r, 1500));
    }
  ));

  // =========================================================================
  // SCENE 8: ALGORITHMIC DRILLS WORKBENCH ~10.9s
  // =========================================================================
  clips.push(await recordScene(
    "scene08_drills",
    "08 // PRACTICE DRILLS",
    "Rapid-Fire DSA & Architecture Drills",
    "Sharpen specific algorithmic patterns in the Drills Workbench. Pick any high-yield challenge, test your code against strict edge cases, and get immediate compiler feedback across multiple runtimes.",
    "#22c55e",
    async () => {
      // Navigate to Drills
      await clickElementCenter(() => {
        const btn = Array.from(document.querySelectorAll('header nav button')).find(x => x.innerText.toLowerCase().includes('drills'));
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 615, 35);
      await new Promise(r => setTimeout(r, 1500));

      // Click on drill challenge
      await clickElementCenter(() => {
        const drill = document.querySelector('.drill-item, .drill-row, .card');
        if (drill) {
          const r = drill.getBoundingClientRect();
          drill.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 320, 350);
      await new Promise(r => setTimeout(r, 1500));

      // Glide over Run Test Cases button
      await humanMove(850, 380, 500);
      await new Promise(r => setTimeout(r, 2000));
    }
  ));

  // =========================================================================
  // SCENE 9: COMMUNITY DISCUSS & PEER INTEL ~9.6s
  // =========================================================================
  clips.push(await recordScene(
    "scene09_discuss",
    "09 // COMMUNITY DISCUSS",
    "Interview Debriefs & Verified Offers",
    "The Discuss hub connects you with candidates sharing recent interview questions, system design post-mortems, and verified compensation breakdowns across top engineering teams.",
    "#06b6d4",
    async () => {
      // Navigate to Discuss
      await clickElementCenter(() => {
        const btn = Array.from(document.querySelectorAll('header nav button')).find(x => x.innerText.toLowerCase().includes('discuss'));
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 535, 35);
      await new Promise(r => setTimeout(r, 1500));

      // Glide across discussion threads
      await humanMove(500, 380, 500);
      await new Promise(r => setTimeout(r, 1500));
      await humanMove(500, 520, 500);
      await new Promise(r => setTimeout(r, 1800));
    }
  ));

  // =========================================================================
  // SCENE 10: CANDIDATE DASHBOARD & MOMENTUM ~11.4s
  // =========================================================================
  clips.push(await recordScene(
    "scene10_dashboard",
    "10 // CANDIDATE DASHBOARD",
    "Quantifiable Readiness Index & Skill Growth",
    "Across all your practice, the Candidate Dashboard treats your preparation as a quantifiable dataset — unifying your readiness index, practice streaks, and filler word decay into a single command center.",
    "#8b5cf6",
    async () => {
      // 1. Click user account button in top-right nav
      await clickElementCenter(() => {
        const btn = document.querySelector('.account-cta');
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 1840, 35);
      await new Promise(r => setTimeout(r, 800));

      // 2. Click My dashboard in popover menu
      await clickElementCenter(() => {
        const btn = Array.from(document.querySelectorAll('.account-popover button')).find(x => x.innerText.toLowerCase().includes('dashboard'));
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.click();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 1800, 95);
      await new Promise(r => setTimeout(r, 1200));

      // Fallback safeguard to guarantee dashboard shell is mounted
      await page.evaluate(() => {
        const shell = document.querySelector('.dashboard-shell');
        if (!shell) {
          const dBtn = Array.from(document.querySelectorAll('button')).find(x => x.innerText.toLowerCase().includes('dashboard'));
          if (dBtn) dBtn.click();
        }
      });
      await new Promise(r => setTimeout(r, 800));

      // 3. Hover over the large 84 READINESS INDEX card with purple glow
      await clickElementCenter(() => {
        const card = document.querySelector('.dashboard-readiness');
        if (card) {
          const r = card.getBoundingClientRect();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }, 1600, 310);
      await new Promise(r => setTimeout(r, 2000));

      // 4. Glide over Candidate Profile & 7-day streak
      await humanMove(500, 580, 600);
      await new Promise(r => setTimeout(r, 1800));

      // 5. Smoothly scroll down to showcase Readiness Trajectory AreaChart & Skill Map
      await page.evaluate(() => {
        window.scrollBy({ top: 400, behavior: 'smooth' });
      });
      await humanMove(680, 520, 500);
      await new Promise(r => setTimeout(r, 2200));
    }
  ));

  // =========================================================================
  // SCENE 11: CALL TO ACTION & OPEN LAUNCH ~7.4s
  // =========================================================================
  clips.push(await recordScene(
    "scene11_cta",
    "11 // PRODUCTION LAUNCH",
    "TeLos • Open Source Interview Intelligence",
    "TeLos is production-ready, open source, and built to help you land your dream role. Star the repo on GitHub and start practicing today!",
    "#f43f5e",
    async () => {
      // Scroll back up and navigate to main studio
      await page.evaluate(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const ivBtn = Array.from(document.querySelectorAll('header nav button')).find(x => x.innerText.toLowerCase().includes('interview'));
        if (ivBtn) ivBtn.click();
      });
      await new Promise(r => setTimeout(r, 800));
      await humanMove(960, 420, 600);
      await new Promise(r => setTimeout(r, 2200));
      await humanMove(960, 540, 500);
      await new Promise(r => setTimeout(r, 1800));
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

    const packMp4 = path.resolve(process.cwd(), "docs/images/linkedin_pack/telos-master-product-demo.mp4");
    fs.copyFileSync(finalMp4, packMp4);
    console.log(`📦 Synced master video to launch pack: ${packMp4}`);
  } else {
    console.error("❌ Merge failed:", mergeRes.stderr?.toString());
  }

  await browser.close();
  console.log("✨ ALL PRODUCTION RECORDINGS COMPLETED WITH REAL HUMAN VOICE!");
})();
