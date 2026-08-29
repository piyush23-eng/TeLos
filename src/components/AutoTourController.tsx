import { useEffect, useRef, useState } from "react";
import { Play, Square, Volume2, Sparkles, CheckCircle2, ChevronRight, Video } from "lucide-react";

type Page = "dashboard" | "studio" | "prep" | "community" | "analytics" | "bank" | "assessment";

type TourStep = {
  page: Page;
  duration: number; // in seconds
  title: string;
  subtitle: string;
  narration: string;
};

const TOUR_STEPS: TourStep[] = [
  {
    page: "dashboard",
    duration: 6,
    title: "STAGE 1 • CANDIDATE DASHBOARD",
    subtitle: "Quantifiable preparation momentum & STAR trajectory",
    narration: "Welcome to TeLos. Everything starts on the Candidate Dashboard, which treats interview preparation as a quantifiable engineering dataset with 30-day readiness momentum."
  },
  {
    page: "studio",
    duration: 10,
    title: "STAGE 2 • LIVE INTERVIEW STUDIO",
    subtitle: "Conversational video screen with Alex AI & live telemetry",
    narration: "In the Live Interview Studio, you are paired with Alex, an AI technical interviewer. Alex challenges your architectural trade-offs and scaling bottlenecks in real-time."
  },
  {
    page: "prep",
    duration: 7,
    title: "STAGE 3 • 47 COMPANY PREP BLUEPRINTS",
    subtitle: "6-Week roadmaps, hiring pipelines & authentic PYQs",
    narration: "Under Company Prep, explore 47 company blueprints from Google and Amazon to Razorpay, complete with 6-week milestones and past interview questions."
  },
  {
    page: "bank",
    duration: 8,
    title: "STAGE 4 • PRACTICE DRILLS WORKBENCH",
    subtitle: "24 Curated DSA drills in Python, Java, C++, and JavaScript",
    narration: "The Drills Workbench features 24 company drills running Python, Java 21, C++17, and JavaScript in a zero-latency cloud execution sandbox."
  },
  {
    page: "community",
    duration: 5,
    title: "STAGE 5 • DISCUSS & COMMUNITY HUB",
    subtitle: "Candidate debriefs, offer insights, and system design patterns",
    narration: "In the Community Hub, engineers share real post-interview debriefs, offer breakdowns, and system design discussions."
  },
  {
    page: "analytics",
    duration: 6,
    title: "STAGE 6 • PERFORMANCE ANALYTICS",
    subtitle: "Filler decay tracking (-65%) & speaking cadence insights",
    narration: "Finally, the Results tab tracks filler word decay, answer clarity, and speaking cadence over time so you know when you are calibrated to pass."
  }
];

type Props = {
  onNavigate: (page: Page) => void;
  currentPage: Page;
};

export function AutoTourController({ onNavigate, currentPage }: Props) {
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => 
      v.name.includes("Natural") || 
      v.name.includes("Google") || 
      v.name.includes("Samantha") || 
      v.name.includes("Daniel") || 
      v.lang.startsWith("en")
    );
    if (naturalVoice) utterance.voice = naturalVoice;
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const startTour = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => (c !== null ? c - 1 : null)), 1000);
      return () => clearTimeout(timer);
    }
    setCountdown(null);
    setRunning(true);
    setStepIndex(0);
    setProgress(0);
  }, [countdown]);

  const stopTour = () => {
    setRunning(false);
    setCountdown(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  useEffect(() => {
    if (!running) return;
    const currentStep = TOUR_STEPS[stepIndex];
    if (!currentStep) {
      stopTour();
      return;
    }

    onNavigate(currentStep.page);
    speak(currentStep.narration);

    const startTime = Date.now();
    const totalMs = currentStep.duration * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / totalMs) * 100);
      setProgress(pct);
      if (elapsed >= totalMs) {
        clearInterval(interval);
        if (stepIndex < TOUR_STEPS.length - 1) {
          setStepIndex(i => i + 1);
        } else {
          stopTour();
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [running, stepIndex]);

  if (countdown !== null) {
    return (
      <div className="tour-countdown-overlay">
        <div className="tour-countdown-card">
          <p className="kicker">PREPARING AUTO-DEMO</p>
          <h2>Get ready to record screen!</h2>
          <div className="countdown-number">{countdown || "GO!"}</div>
          <small>Press <b>Cmd + Shift + 5</b> on Mac to start recording now</small>
        </div>
      </div>
    );
  }

  if (running) {
    const currentStep = TOUR_STEPS[stepIndex];
    return (
      <div className="tour-caption-bar">
        <div className="tour-caption-content">
          <div className="tour-status-pill">
            <span className="live-dot" />
            <b>RECORDING MODE • STEP {stepIndex + 1} / {TOUR_STEPS.length}</b>
          </div>
          <div className="tour-text">
            <h3>{currentStep.title}</h3>
            <p>{currentStep.narration}</p>
          </div>
          <div className="tour-controls">
            <div className="tour-progress-track">
              <div className="tour-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <button className="tour-stop-btn" onClick={stopTour}>
              <Square size={14} /> STOP DEMO
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button 
      className="auto-demo-trigger-btn"
      onClick={startTour}
      title="Launch automated self-running video demo with voice narration"
    >
      <Video size={14} />
      <span>🎬 AUTO-DEMO MODE</span>
    </button>
  );
}
