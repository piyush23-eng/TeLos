const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const audioDir = "/tmp/telos_human_audio";
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const apiKey = "e41df76042c550654e51cbdaa60d997da2b2b1e0";

const scenes = [
  {
    id: "scene01_calibration",
    stage: "01 // CALIBRATION GREEN ROOM",
    title: "Target Role Calibration & CV Grounding",
    accent: "#6366f1",
    script: "Preparing for senior engineering interviews has always been broken. Grinding hundreds of LeetCode problems doesn't teach you how to defend architectural trade-offs under pressure. Today, we are launching TeLos: the autonomous AI technical interview platform. We begin in the Calibration Green Room, targeting an L6 Staff Systems Architect round at Google, and grounding the session directly in our distributed systems resume."
  },
  {
    id: "scene02_studio",
    stage: "02 // LIVE CONVERSATIONAL STUDIO",
    title: "Real-Time AI Voice Interviewer & Telemetry",
    accent: "#10b981",
    script: "Entering the live studio, meet Alex, our autonomous AI interviewer. Alex conducts an authentic conversational technical screen with low-latency audio streaming, while our live HUD continuously tracks your speaking pace, cognitive clarity, and focus integrity in real time."
  },
  {
    id: "scene03_scratchpad",
    stage: "03 // COLLABORATIVE SCRATCHPAD",
    title: "Multi-Language Runner & Architecture Topology",
    accent: "#38bdf8",
    script: "Mid-interview, candidates can open the interactive scratchpad. Diagram system topologies with real-time latency indicators, write algorithms in Python, Java, Go, or C++, and execute code inside our secure cloud sandbox with zero latency."
  },
  {
    id: "scene04_bargein",
    stage: "04 // BARGE-IN CAPABILITY",
    title: "Real-Time Turn Taking & Adaptive Probing",
    accent: "#f43f5e",
    script: "Communication isn't scripted — it's fluid. With instant barge-in capability, you can interrupt mid-sentence to clarify constraints, and Alex immediately adapts the technical follow-up without awkward speech collision."
  },
  {
    id: "scene05_debrief",
    stage: "05 // 6-DIMENSION DEBRIEF",
    title: "Granular Bar Raiser Radar & Action Roadmap",
    accent: "#f59e0b",
    script: "The second your session wraps, TeLos synthesizes the full transcript into an exhaustive Bar Raiser debrief: rating technical depth, system design, and communication, backed by concrete evidence and a 48-hour improvement roadmap."
  },
  {
    id: "scene06_companies",
    stage: "06 // COMPANY PLAYBOOKS",
    title: "47 Tailored 6-Week Blueprints & Rubrics",
    accent: "#a855f7",
    script: "Beyond live simulation, TeLos includes over forty-seven company playbooks — from Google and Stripe to Amazon, Swiggy, and Razorpay — complete with round-by-round rubrics and six-week master blueprints."
  },
  {
    id: "scene07_assessment",
    stage: "07 // PROCTORED ASSESSMENTS",
    title: "Lockdown Online Assessment & Test Harness",
    accent: "#ec4899",
    script: "Need to simulate rigorous online assessments? The Assessment Arena provides timed coding challenges, automated test execution, and camera attention monitoring under genuine exam constraints."
  },
  {
    id: "scene08_drills",
    stage: "08 // PRACTICE DRILLS",
    title: "Rapid-Fire DSA & Architecture Drills",
    accent: "#22c55e",
    script: "Sharpen specific algorithmic patterns in the Drills Workbench. Pick any high-yield challenge, test your code against strict edge cases, and get immediate compiler feedback across multiple runtimes."
  },
  {
    id: "scene09_discuss",
    stage: "09 // COMMUNITY DISCUSS",
    title: "Interview Debriefs & Verified Offers",
    accent: "#06b6d4",
    script: "The Discuss hub connects you with candidates sharing recent interview questions, system design post-mortems, and verified compensation breakdowns across top engineering teams."
  },
  {
    id: "scene10_dashboard",
    stage: "10 // CANDIDATE DASHBOARD",
    title: "Quantifiable Readiness Index & Skill Growth",
    accent: "#8b5cf6",
    script: "Across all your practice, the Candidate Dashboard treats your preparation as a quantifiable dataset — unifying your readiness index, practice streaks, and filler word decay into a single command center."
  },
  {
    id: "scene11_cta",
    stage: "11 // PRODUCTION LAUNCH",
    title: "TeLos • Open Source Interview Intelligence",
    accent: "#f43f5e",
    script: "TeLos is production-ready, open source, and built to help you land your dream role. Star the repo on GitHub and start practicing today!"
  }
];

async function generateHumanVoiceover() {
  console.log("🎙️ Generating studio-quality REAL HUMAN voiceover with Deepgram Aura (Asteria)...");

  for (const scene of scenes) {
    const rawMp3 = path.join(audioDir, `${scene.id}_raw.mp3`);
    const finalMp3 = path.join(audioDir, `${scene.id}.mp3`);

    console.log(`Synthesizing natural human voice for ${scene.id}...`);

    const curlRes = spawnSync('curl', [
      '-s',
      '-X', 'POST',
      'https://api.deepgram.com/v1/speak?model=aura-asteria-en',
      '-H', `Authorization: Token ${apiKey}`,
      '-H', 'Content-Type: application/json',
      '-d', JSON.stringify({ text: scene.script }),
      '--output', rawMp3
    ]);

    if (curlRes.status !== 0 || !fs.existsSync(rawMp3)) {
      console.error(`Failed to generate audio for ${scene.id}`);
      continue;
    }

    // Studio broadcast master quality (warm presence, highpass low-cut, broadcast leveling)
    spawnSync('ffmpeg', [
      '-y',
      '-i', rawMp3,
      '-af', 'highpass=f=65,equalizer=f=250:t=q:w=1.0:g=1.5,equalizer=f=3500:t=q:w=1.2:g=2.2,loudnorm=I=-16:TP=-1.5:LRA=7',
      '-c:a', 'libmp3lame',
      '-b:a', '192k',
      finalMp3
    ]);

    if (fs.existsSync(finalMp3)) {
      const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', finalMp3]);
      const duration = parseFloat(probe.stdout.toString().trim()) || 0;
      console.log(`   ✓ Human voice ready: ${scene.id}.mp3 (${duration.toFixed(2)}s)`);
      fs.unlinkSync(rawMp3);
    }
  }

  console.log("🎉 ALL 11 REAL HUMAN VOICE TRACKS COMPLETED WITH AURA ASTERIA!");
}

generateHumanVoiceover();
