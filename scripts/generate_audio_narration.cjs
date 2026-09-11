const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const audioDir = "/tmp/telos_master_audio";
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const scenes = [
  {
    id: "scene01_calibration",
    stage: "01 // CALIBRATION GREEN ROOM",
    title: "Target Role Calibration & CV Grounding",
    accent: "#6366f1",
    script: "Welcome to TeLos: the autonomous AI technical interview platform. We begin in the Calibration Green Room, configuring a targeted Staff Systems Architect round for Google, and grounding the session directly against our distributed systems resume."
  },
  {
    id: "scene02_studio",
    stage: "02 // LIVE INTERVIEW STUDIO",
    title: "Real-Time AI Voice Interviewer & Telemetry",
    accent: "#10b981",
    script: "Stepping into the live studio, meet Alex Rivera, our autonomous interviewer. Powered by sub-second voice streaming, Alex conducts a live conversational screen while the telemetry HUD tracks speech cadence, pacing, and candidate focus in real time."
  },
  {
    id: "scene03_scratchpad",
    stage: "03 // COLLABORATIVE SCRATCHPAD",
    title: "Multi-Language Runner & Architecture Topology",
    accent: "#38bdf8",
    script: "Mid-interview, candidates can open the interactive scratchpad. Switch languages to Python, Java, C++, or Go, sketch system architecture nodes, and execute code live inside our secure isolated runner with instant output."
  },
  {
    id: "scene04_bargein",
    stage: "04 // BARGE-IN CAPABILITY",
    title: "Real-Time Turn Taking & Adaptive Probing",
    accent: "#f43f5e",
    script: "Unlike rigid question banks, communication is fluid. With one-click barge-in capability, candidates can interrupt mid-sentence to clarify constraints, and Alex immediately adapts the technical follow-up without awkward speech collision."
  },
  {
    id: "scene05_debrief",
    stage: "05 // 6-DIMENSION DEBRIEF",
    title: "Granular Bar Raiser Radar & Action Roadmap",
    accent: "#f59e0b",
    script: "When the interview wraps, TeLos synthesizes the full session into an exhaustive Bar Raiser debrief: rating technical depth, system design, and communication, paired with transcript-grounded coaching."
  },
  {
    id: "scene06_companies",
    stage: "06 // COMPANY PLAYBOOKS",
    title: "47 Tailored 6-Week Blueprints & Rubrics",
    accent: "#a855f7",
    script: "Beyond live simulation, TeLos features over forty-seven company playbooks — covering Google, Meta, Amazon, and Stripe to Razorpay and Flipkart — with round-by-round rubrics and six-week master blueprints."
  },
  {
    id: "scene07_assessment",
    stage: "07 // PROCTORED ASSESSMENTS",
    title: "Lockdown Online Assessment & Test Harness",
    accent: "#ec4899",
    script: "Need to simulate strict online assessment conditions? The Proctored Assessment Arena provides timed coding challenges, automated test execution, and camera attention monitoring under genuine exam constraints."
  },
  {
    id: "scene08_drills",
    stage: "08 // PRACTICE DRILLS",
    title: "Rapid-Fire DSA & Architecture Drills",
    accent: "#22c55e",
    script: "For targeted practice, the Drills Workbench offers rapid-fire algorithmic and system design challenges, allowing you to test edge cases with instant compiler feedback across multiple runtimes."
  },
  {
    id: "scene09_discuss",
    stage: "09 // COMMUNITY DISCUSS",
    title: "Interview Debriefs & Verified Offers",
    accent: "#06b6d4",
    script: "The Discuss hub connects you with candidates sharing recent interview questions, system design trade-offs, and verified compensation breakdowns across major engineering hubs."
  },
  {
    id: "scene10_dashboard",
    stage: "10 // CANDIDATE DASHBOARD",
    title: "Quantifiable Readiness Index & Skill Growth",
    accent: "#8b5cf6",
    script: "Finally, the Candidate Dashboard treats your preparation as a quantifiable dataset — unifying your readiness index, practice streaks, and filler word decay curves into a single command center."
  },
  {
    id: "scene11_cta",
    stage: "11 // PRODUCTION LAUNCH",
    title: "TeLos • Open Source Interview Intelligence",
    accent: "#f43f5e",
    script: "TeLos is production-ready, open source, and built to help you land your dream role. Star the repo on GitHub and start practicing today!"
  }
];

console.log("🎙️ Generating studio voice narration files...");

for (const scene of scenes) {
  const aiffPath = path.join(audioDir, `${scene.id}.aiff`);
  const mp3Path = path.join(audioDir, `${scene.id}.mp3`);

  console.log(`Generating audio for ${scene.id}...`);
  // Use Samantha at conversational rate 175
  const sayRes = spawnSync('say', ['-v', 'Samantha', '-r', '175', '-o', aiffPath, scene.script]);
  if (sayRes.status !== 0) {
    console.error(`Error with say for ${scene.id}:`, sayRes.stderr?.toString());
    continue;
  }

  // Convert AIFF to clean MP3
  const ffmpegRes = spawnSync('ffmpeg', [
    '-y',
    '-i', aiffPath,
    '-af', 'highpass=f=80,lowpass=f=12000,volume=1.2',
    '-c:a', 'libmp3lame',
    '-b:a', '192k',
    mp3Path
  ]);

  if (ffmpegRes.status === 0) {
    // Get duration
    const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3Path]);
    const duration = parseFloat(probe.stdout.toString().trim()) || 0;
    console.log(`   ✓ ${scene.id}.mp3 (${duration.toFixed(2)}s)`);
    fs.unlinkSync(aiffPath);
  } else {
    console.error(`ffmpeg conversion failed for ${scene.id}:`, ffmpegRes.stderr?.toString());
  }
}

console.log("🎉 All 11 narration tracks generated successfully!");
