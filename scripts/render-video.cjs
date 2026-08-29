const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const tempDir = "/tmp/telos_video";
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const scenes = [
  {
    id: "scene1",
    stage: "STAGE 1 • CANDIDATE DASHBOARD",
    title: "Treat Interview Prep as a Quantifiable Dataset",
    badge: "01 / CANDIDATE MOMENTUM",
    color: "#6e54f6",
    bullets: [
      "30-Day Readiness Index & STAR Score Trajectory",
      "Target Role Focus: Google, Amazon, Meta, Microsoft",
      "Curated Weekly Milestones & Pattern Mastery"
    ],
    statNum: "82 / 100",
    statLabel: "Readiness Index",
    narration: "Welcome to TeLos. Everything starts on the Candidate Dashboard, which treats interview preparation as a quantifiable engineering dataset with thirty-day readiness momentum."
  },
  {
    id: "scene2",
    stage: "STAGE 2 • LIVE INTERVIEW STUDIO",
    title: "Real-Time Conversational Video Screen with Alex AI",
    badge: "02 / ADAPTIVE VOICE INTELLIGENCE",
    color: "#ff4f19",
    bullets: [
      "Sub-second streaming turns via Deepgram Nova-3 speech intelligence",
      "Challenges architectural trade-offs, concurrency and failure modes",
      "Live candidate telemetry: WPM cadence, filler decay and answer directness"
    ],
    statNum: "148 WPM",
    statLabel: "Optimal Cadence",
    narration: "In the Live Interview Studio, you are paired with Alex, an AI technical interviewer who challenges your architectural trade-offs and scaling bottlenecks in real time."
  },
  {
    id: "scene3",
    stage: "STAGE 3 • 6-DIMENSION CALIBRATION DEBRIEF",
    title: "Instant Post-Interview Scoring & 48-Hour Action Roadmap",
    badge: "03 / GRANULAR RADAR METRICS",
    color: "#ecff00",
    bullets: [
      "Hiring Verdict: Strong Hire (84% Overall Signal Score)",
      "Granular breakdown: Technical Depth, Systems Design and Communication",
      "Anti-pattern traps to avoid and one-click Markdown report export"
    ],
    statNum: "84% Score",
    statLabel: "Hiring Verdict",
    narration: "The moment your session ends, TeLos generates a comprehensive six-dimension debrief with hiring recommendations, cadence telemetry, and a prioritized forty-eight hour action roadmap."
  },
  {
    id: "scene4",
    stage: "STAGE 4 • 47 COMPANY PREP BLUEPRINTS",
    title: "Tailored 6-Week Roadmaps & Authentic Past Questions",
    badge: "04 / TARGET PREPARATION",
    color: "#00e5ff",
    bullets: [
      "47 Global & Indian tech giants: Google, Amazon, Uber, Stripe, Razorpay",
      "End-to-end hiring process breakdowns (OA, Machine Coding, Bar Raiser)",
      "High-priority topic mastery and company-specific past year questions"
    ],
    statNum: "47 Companies",
    statLabel: "Calibrated Blueprints",
    narration: "Explore forty-seven company preparation blueprints from Google and Amazon to Razorpay, complete with six-week milestones and authentic past interview questions."
  },
  {
    id: "scene5",
    stage: "STAGE 5 • PRACTICE DRILLS WORKBENCH",
    title: "24 Curated DSA Drills with Zero-Latency Cloud Execution",
    badge: "05 / MULTI-LANGUAGE SANDBOX",
    color: "#a855f7",
    bullets: [
      "Multi-language execution: Python 3, Java 21, C++17, and JavaScript",
      "Input/output schemas, test constraints and interview hints",
      "Instant test sandbox with stdout, stderr and compiler diagnostics"
    ],
    statNum: "24 Drills",
    statLabel: "Curated Challenges",
    narration: "The Drills Workbench features twenty-four company drills running Python, Java twenty-one, C plus plus seventeen, and JavaScript in a zero-latency cloud execution sandbox."
  },
  {
    id: "scene6",
    stage: "STAGE 6 • PERFORMANCE & COMMUNITY",
    title: "Historical Filler Word Decay & Candidate Discussions",
    badge: "06 / VERIFIED SIGNAL",
    color: "#10b981",
    bullets: [
      "Filler word decay tracking: minus 65% drop from baseline",
      "Active community feed with post-interview debriefs and offer breakdowns",
      "Verified proctored assessment screens with facial attention monitoring"
    ],
    statNum: "-65% Fillers",
    statLabel: "Cognitive Clarity",
    narration: "Finally, track filler word decay, answer clarity, and speaking cadence over time so you know exactly when you are calibrated to pass. Try TeLos today!"
  }
];

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    frame: false,
    webPreferences: { offscreen: true }
  });

  const clipFiles = [];

  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    console.log("🎬 Rendering Scene " + (i + 1) + "/" + scenes.length + ": " + s.stage + "...");

    // 1. Generate Voice Audio
    const aiffPath = path.join(tempDir, s.id + ".aiff");
    const m4aPath = path.join(tempDir, s.id + ".m4a");
    spawnSync("say", ["-v", "Daniel", "-o", aiffPath, s.narration]);
    spawnSync("ffmpeg", ["-y", "-i", aiffPath, "-c:a", "aac", "-b:a", "192k", m4aPath]);

    // 2. Render 1080p HTML Slide
    const html = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><style>* { box-sizing: border-box; } body { margin: 0; padding: 70px 90px; width: 1920px; height: 1080px; background: #0b0a10; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; position: relative; } .bg-glow { position: absolute; width: 800px; height: 800px; border-radius: 50%; background: radial-gradient(circle, " + s.color + "22 0%, transparent 70%); top: -200px; right: -200px; filter: blur(80px); z-index: 0; } .top-bar { display: flex; justify-content: space-between; align-items: center; z-index: 1; border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 24px; } .logo { font-size: 36px; font-weight: 900; letter-spacing: -0.03em; color: #fff; display: flex; align-items: center; gap: 12px; } .logo span { color: " + s.color + "; } .badge { background: rgba(255, 255, 255, 0.08); border: 1px solid " + s.color + "66; color: " + s.color + "; padding: 8px 18px; border-radius: 24px; font-size: 15px; font-weight: 700; letter-spacing: 0.08em; } .main-grid { display: grid; grid-template-columns: 1.35fr 0.65fr; gap: 60px; align-items: center; z-index: 1; margin: auto 0; } .kicker { font-size: 16px; font-weight: 800; letter-spacing: 0.12em; color: " + s.color + "; margin: 0 0 14px 0; } h1 { font-size: 54px; line-height: 1.15; font-weight: 800; margin: 0 0 32px 0; letter-spacing: -0.02em; } .bullet-list { display: flex; flex-direction: column; gap: 20px; } .bullet-item { display: flex; align-items: center; gap: 16px; font-size: 23px; color: rgba(255, 255, 255, 0.88); line-height: 1.4; } .bullet-dot { width: 12px; height: 12px; border-radius: 50%; background: " + s.color + "; flex-shrink: 0; box-shadow: 0 0 14px " + s.color + "; } .stat-card { background: rgba(26, 25, 38, 0.85); border: 2px solid " + s.color + "55; border-radius: 24px; padding: 48px; text-align: center; backdrop-filter: blur(20px); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), inset 0 0 30px " + s.color + "15; } .stat-number { font-size: 72px; font-weight: 900; color: " + s.color + "; margin: 0 0 8px 0; letter-spacing: -0.03em; } .stat-label { font-size: 18px; font-weight: 700; letter-spacing: 0.06em; color: rgba(255, 255, 255, 0.75); text-transform: uppercase; } .bottom-bar { display: flex; justify-content: space-between; align-items: center; z-index: 1; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.12); font-size: 15px; color: rgba(255, 255, 255, 0.55); font-weight: 600; letter-spacing: 0.04em; }</style></head><body><div class=\"bg-glow\"></div><div class=\"top-bar\"><div class=\"logo\">TeLos<span>®</span> • Official Product Tour</div><div class=\"badge\">" + s.stage + "</div></div><div class=\"main-grid\"><div><p class=\"kicker\">" + s.badge + "</p><h1>" + s.title + "</h1><div class=\"bullet-list\">" + s.bullets.map(b => "<div class=\"bullet-item\"><div class=\"bullet-dot\"></div><div>" + b + "</div></div>").join("") + "</div></div><div><div class=\"stat-card\"><div class=\"stat-number\">" + s.statNum + "</div><div class=\"stat-label\">" + s.statLabel + "</div></div></div></div><div class=\"bottom-bar\"><div>AI TECHNICAL INTERVIEW &amp; ASSESSMENT PLATFORM</div><div>WWW.TELOS.AI • VERIFIED REPUTATION LAYER</div></div></body></html>";

    const htmlPath = path.join(tempDir, s.id + ".html");
    const pngPath = path.join(tempDir, s.id + ".png");
    const clipPath = path.join(tempDir, s.id + ".mp4");

    fs.writeFileSync(htmlPath, html, "utf8");
    await win.loadURL("file://" + htmlPath);
    await new Promise(r => setTimeout(r, 400));
    const img = await win.webContents.capturePage();
    fs.writeFileSync(pngPath, img.toPNG());

    // 3. Encode Scene Video with Audio Sync
    spawnSync("ffmpeg", [
      "-y",
      "-loop", "1",
      "-i", pngPath,
      "-i", m4aPath,
      "-c:v", "libx264",
      "-tune", "stillimage",
      "-c:a", "aac",
      "-b:a", "192k",
      "-pix_fmt", "yuv420p",
      "-shortest",
      clipPath
    ]);

    clipFiles.push(clipPath);
  }

  // 4. Merge All Clips into Final MP4
  console.log("🎞️ Merging clips into telos-product-demo.mp4...");
  const listFile = path.join(tempDir, "clips.txt");
  fs.writeFileSync(listFile, clipFiles.map(f => "file  + f + ").join("\n"), "utf8");

  const finalMp4 = path.resolve(process.cwd(), "telos-product-demo.mp4");
  const mergeRes = spawnSync("ffmpeg", [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", listFile,
    "-c", "copy",
    finalMp4
  ]);

  if (mergeRes.status === 0 && fs.existsSync(finalMp4)) {
    const sizeMb = (fs.statSync(finalMp4).size / (1024 * 1024)).toFixed(2);
    console.log("✅ SUCCESS: Generated " + finalMp4 + " (" + sizeMb + " MB)!");
  } else {
    console.error("❌ Merge failed:", mergeRes.stderr?.toString());
  }

  app.quit();
});
