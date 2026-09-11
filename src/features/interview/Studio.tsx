import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

import {
  ArrowLeft, ArrowRight, BookOpen, Bot, Check, CheckCircle2, Clock, Code2,
  Eye, EyeOff, FileText, Hand, HelpCircle, Layers, Lightbulb, LockKeyhole,
  MessageCircle, Mic, MicOff, Play, Radio, Send, ShieldAlert, ShieldCheck,
  Sparkles, Square, Upload, Video, VideoOff, Volume2, VolumeX, X, Zap
} from 'lucide-react';

import { VoiceOrbVisualizer } from '../../components/VoiceOrbVisualizer';
import { HumanInterviewerAvatar, type InterviewerVisualState } from '../../components/HumanInterviewerAvatar';
import { LiveMeter } from './LiveMeter';
import { Report } from './Report';
import { apiUrl, safeStorage } from '../../apiConfig';
import { calculateSpeakingPace, countFillerWords, buildSessionReport } from '../../voiceMetrics';
import {
  getStoredOpenRouterKey,
  setStoredOpenRouterKey,
  getStoredOpenRouterModel,
  setStoredOpenRouterModel,
  testDirectOpenRouterCall,
  generateQuestionDirectly,
  type OpenRouterTelemetry
} from '../../openrouter';
import { defaultInterviewContext, stamp, type Message, type VoiceProfile, type CodeLanguage } from '../../types';

type Recognition = { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; onresult: ((event: any) => void) | null; onerror: ((event: any) => void) | null; onend: (() => void) | null };
declare global { interface Window { webkitSpeechRecognition?: new () => Recognition; SpeechRecognition?: new () => Recognition } }

const naturalVoiceOrder = [
  'Daniel', 'Alex', 'Ava', 'Samantha', 'Oliver', 'Serena', 'Tom',
  'Microsoft Guy Online (Natural)', 'Microsoft Jenny Online (Natural)', 'Microsoft Ryan Online (Natural)',
  'Google US English', 'Google UK English Male', 'en-US'
];

let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

function pickNaturalVoice(voices: SpeechSynthesisVoice[], requested: string) {
  const list = voices.length ? voices : cachedVoices;
  if (requested && requested !== 'coral') {
    const direct = list.find(v => v.name.toLowerCase().includes(requested.toLowerCase()));
    if (direct) return direct;
  }
  for (const name of naturalVoiceOrder) {
    const match = list.find(v => v.name.includes(name) || v.voiceURI.includes(name));
    if (match) return match;
  }
  return list.find(v => /en(-|_)US|en(-|_)GB/i.test(v.lang)) || list[0];
}

let activeHumanVoice: HTMLAudioElement | null = null;

function browserSpeechFallback(text: string, requestedVoice = '', profile: VoiceProfile = 'natural') {
  if (!('speechSynthesis' in window) || !text?.trim()) return;
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const chunks = cleanText.match(/[^.!?]+[.!?]?/g)?.map(chunk => chunk.trim()).filter(Boolean) || [cleanText];
  const voices = window.speechSynthesis.getVoices().length ? window.speechSynthesis.getVoices() : cachedVoices;
  const voice = pickNaturalVoice(voices, requestedVoice);

  window.speechSynthesis.cancel();
  const settings = {
    natural: { rate: 0.93, pitch: 1.0, volume: 1.0 },
    warm: { rate: 0.88, pitch: 1.02, volume: 0.98 },
    broadcast: { rate: 0.98, pitch: 1.04, volume: 1.0 }
  }[profile];

  const playChunk = (index: number) => {
    if (index >= chunks.length) return;
    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    utterance.lang = 'en-US';
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      // Natural 180ms conversational pause between thoughts
      setTimeout(() => playChunk(index + 1), 180);
    };
    window.speechSynthesis.speak(utterance);
  };

  playChunk(0);
}

async function speak(text: string, enabled: boolean, requestedVoice = 'coral', profile: VoiceProfile = 'natural') {
  if (!enabled || !text?.trim()) return;
  window.speechSynthesis?.cancel();
  if (activeHumanVoice) {
    activeHumanVoice.pause();
    activeHumanVoice = null;
  }
  try {
    const response = await fetch(apiUrl('/api/tts'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceId: 'pNInz6obpgDQGcFmaJgB', // ElevenLabs "Adam" - natural conversational human male
        voice: requestedVoice,
        profile
      })
    });
    if (!response.ok) throw new Error('TTS service fallback');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    activeHumanVoice = audio;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (activeHumanVoice === audio) activeHumanVoice = null;
    };
    await audio.play();
  } catch {
    browserSpeechFallback(text, requestedVoice, profile);
  }
}


export function Studio() {
  const [context, setContext] = useState(defaultInterviewContext);
  const [lobbyStep, setLobbyStep] = useState<'setup' | 'preflight'>('setup');
  const [speechStats, setSpeechStats] = useState({ words: 0, pace: 140, fillers: 0, lastUpdated: 0 });
  const [started, setStarted] = useState(false);
  const [mic, setMic] = useState(false);
  const [camera, setCamera] = useState(false);
  const [voice, setVoice] = useState(true);
  const [voiceName, setVoiceName] = useState('coral');
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile>('natural');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);
  const [report, setReport] = useState(false);
  const [subtitles, setSubtitles] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [micError, setMicError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [resumeSource, setResumeSource] = useState<'paste' | 'upload' | 'sample'>('paste');
  const [resumeFileName, setResumeFileName] = useState('No resume loaded');
  const [showScratchpad, setShowScratchpad] = useState(false);

  // Progressive 5-Phase Interview State
  const [currentPhase, setCurrentPhase] = useState<{
    key: string;
    number: number;
    label: string;
    challenge?: {
      title: string;
      problemScenario: string;
      starterCodePrompt: string;
      edgeCaseFocus: string;
    };
  }>({
    key: 'warm-intro',
    number: 1,
    label: 'Phase 1 • Warm Intro & Calibration'
  });
  const [interimTranscript, setInterimTranscript] = useState('');
  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false);
  const isSpeakingTtsRef = useRef(false);

  // Real Interview Experience State (Pillars 1-4)
  const [visualMode, setVisualMode] = useState<'avatar' | 'orb'>('avatar');
  const [secondsRemaining, setSecondsRemaining] = useState(45 * 60);
  const [interviewerBehavior, setInterviewerBehavior] = useState<'idle' | 'taking-notes' | 'reviewing-code'>('idle');
  const [archNodes, setArchNodes] = useState<Array<{ id: string; type: string; name: string; latency: string; throughput: string }>>([
    { id: 'node-gw', type: 'gateway', name: 'API Gateway (Envoy)', latency: '1.2ms', throughput: '45k RPS' },
    { id: 'node-cache', type: 'cache', name: 'Redis Cache Cluster', latency: '0.8ms', throughput: '120k QPS' }
  ]);

  useEffect(() => {
    if (!started || report) return;
    const timer = setInterval(() => setSecondsRemaining(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [started, report]);

  // Conversational Bridge & Proctoring Telemetry State
  const [conversationalFiller, setConversationalFiller] = useState('');
  const [tabSwitches, setTabSwitches] = useState(0);
  const [pasteEvents, setPasteEvents] = useState(0);
  const [proctorToast, setProctorToast] = useState<string | null>(null);

  useEffect(() => {
    if (!started || report) return;
    const onVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const next = prev + 1;
          setProctorToast(`⚠️ Focus Alert: Tab switch detected (${next} alert${next > 1 ? 's' : ''}). Please remain on the active assessment window.`);
          setTimeout(() => setProctorToast(null), 5000);
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [started, report]);

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  useEffect(() => {
    isSpeakingTtsRef.current = isSpeakingTts;
  }, [isSpeakingTts]);

  // Technical Scratchpad Workspace State
  const [language, setLanguage] = useState<CodeLanguage>('python');
  const [code, setCode] = useState<string>(`# Technical Scratchpad - Python 3
# Sketch your architecture and algorithms as you talk through your solution with Alex.

def solution(input_data):
    # Implement your logic
    return input_data

if __name__ == "__main__":
    print("Testing output:", solution({"status": "healthy", "latency_ms": 14}))
`);
  const [codeOutput, setCodeOutput] = useState('');
  const [runningCode, setRunningCode] = useState(false);

  // Model Provider selector (Free & Open Tier Models)
  const [modelProvider, setModelProvider] = useState<'auto' | 'openrouter' | 'gemini' | 'groq' | 'ollama' | 'openai' | 'heuristic'>('auto');
  const [aiModelStatus, setAiModelStatus] = useState<'online' | 'fallback' | 'checking'>('online');
  const [openRouterKeyInput, setOpenRouterKeyInput] = useState(() => getStoredOpenRouterKey());
  const [openRouterModelInput, setOpenRouterModelInput] = useState(() => getStoredOpenRouterModel());
  const [lastTelemetry, setLastTelemetry] = useState<OpenRouterTelemetry | null>(null);
  const [testingApi, setTestingApi] = useState(false);
  const [testApiResult, setTestApiResult] = useState<{ ok: boolean; message: string; latency?: number } | null>(null);
  const [showKey, setShowKey] = useState(false);

  const handleTestApi = async (keyToTest?: string, modelToTest?: string) => {
    setTestingApi(true);
    setTestApiResult(null);
    try {
      const k = keyToTest || openRouterKeyInput || getStoredOpenRouterKey();
      const m = modelToTest || openRouterModelInput || getStoredOpenRouterModel();
      const res = await testDirectOpenRouterCall(k, m);
      setLastTelemetry(res);
      if (res.ok) {
        setTestApiResult({
          ok: true,
          message: `HTTP 200 OK | Latency: ${res.latencyMs}ms | Model: ${res.model} | Response: "${res.responsePreview}"`,
          latency: res.latencyMs
        });
        setAiModelStatus('online');
      } else {
        setTestApiResult({
          ok: false,
          message: res.error || `HTTP ${res.status}: Verification failed`
        });
      }
    } catch (err: any) {
      setTestApiResult({
        ok: false,
        message: err?.message || 'Failed to connect to OpenRouter'
      });
    } finally {
      setTestingApi(false);
    }
  };

  const startRef = useRef(Date.now());
  const streamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraPreviewRef = useRef<HTMLVideoElement | null>(null);
  const lobbyCameraRef = useRef<HTMLVideoElement | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  const retryRef = useRef(false);
  const followUpLock = useRef(false);
  const speechBufferRef = useRef('');
  const speechDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesRef = useRef(messages);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  messagesRef.current = messages;
  const latestPanel = useMemo(() => [...messages].reverse().find(x => x.speaker === 'PANEL')?.text || '', [messages]);
  const activeCompany = useMemo(() => ({ id: 'manual', name: context.company || 'Google' }), [context.company]);
  const speakingPace = useMemo(() => speechStats.pace ? `${speechStats.pace} WPM` : '0 WPM', [speechStats.pace]);
  const reportMetrics = useMemo(() => buildSessionReport({ answerCount: messages.filter(m => m.speaker === 'YOU').length, pace: speechStats.pace }), [messages, speechStats.pace]);

  const starterCodeTemplates: Record<CodeLanguage, string> = {
    python: `# Technical Scratchpad - Python 3
# Sketch your architecture and algorithms as you talk through your solution with Alex.

def solution(input_data):
    # Implement your logic
    return input_data

if __name__ == "__main__":
    print("Testing output:", solution({"status": "healthy", "latency_ms": 14}))
`,
    js: `// Technical Scratchpad - JavaScript (Node.js)
// Sketch your architecture and algorithms as you talk through your solution with Alex.

function solution(input) {
  // Implement your logic
  return input;
}

console.log("Testing output:", solution({ status: "healthy", latency_ms: 14 }));
`,
    cpp: `// Technical Scratchpad - C++17
// Sketch your architecture and algorithms as you talk through your solution with Alex.

#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    cout << "Ready for execution" << endl;
    return 0;
}
`,
    java: `// Technical Scratchpad - Java 17
// Sketch your architecture and algorithms as you talk through your solution with Alex.

public class Solution {
    public static void main(String[] args) {
        System.out.println("Ready for execution");
    }
}
`
  };

  const playSpeakerTestChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // fallback
    }
  };

  const handleLanguageChange = (nextLang: CodeLanguage) => {
    setLanguage(nextLang);
    setCode(starterCodeTemplates[nextLang]);
    setCodeOutput(`Switched workspace to ${nextLang.toUpperCase()}. Click 'Run Code' to execute.`);
  };

  const runLiveCode = async () => {
    setRunningCode(true);
    setInterviewerBehavior('reviewing-code');
    setCodeOutput('Compiling & running test cases against local runtime sandbox...');
    try {
      const response = await fetch(apiUrl('/api/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      const result = await response.json();
      setCodeOutput(result.output || 'No output produced.');
    } catch {
      setCodeOutput('Execution runner unavailable.');
    } finally {
      setRunningCode(false);
      setTimeout(() => {
        setInterviewerBehavior('idle');
      }, 3500);
    }
  };

  const interviewCoach = useMemo(() => {
    const lastAnswer = [...messages].reverse().find(m => m.speaker === 'YOU')?.text || '';
    const words = lastAnswer.trim().split(/\s+/).filter(Boolean);
    const hasDecision = /\b(chose|built|implemented|designed|owned|decided|led|shipped)\b/i.test(lastAnswer);
    const hasTradeoff = /\b(trade-?off|because|instead|versus|however|latency|cost|scale|reliability)\b/i.test(lastAnswer);
    const hasProof = /\b(%|ms|p\d\d|rps|qps|users|customers|reduced|improved|increased|decreased|saved)\b/i.test(lastAnswer);
    if (!lastAnswer) return {
      headline: 'Live Technical Interview Guidance.',
      note: `Alex will probe your problem decomposition, complexity analysis (Big-O), system trade-offs, and failure edge cases.`,
      starter: '“I will solve this by [approach] with O(N) time and O(1) space, handling [edge case] first.”',
      checks: [
        { label: 'Clarify constraints', value: 'CONSTRAINTS & I/O', detail: 'State your assumptions and edge cases before coding.' },
        { label: 'Complexity & approach', value: 'BIG-O & ALGORITHM', detail: 'Explain why this algorithm is optimal.' },
        { label: 'Production correctness', value: 'FAILURE MODES', detail: 'Address race conditions, timeouts, or scale bounds.' }
      ]
    };
    const missing = !hasDecision ? 'Explain your specific algorithmic choice.' : !hasTradeoff ? 'Discuss the time vs space trade-off.' : !hasProof ? 'Quantify complexity or test results.' : 'Solid explanation. Be ready for Alex to inject a scale failure.';
    return {
      headline: words.length < 30 ? 'Good start — talk through your implementation.' : hasProof && hasTradeoff ? 'Crisp technical explanation.' : 'Clear approach — mention edge cases.',
      note: missing,
      starter: !hasDecision ? 'Explain: “I structured the algorithm this way because…”' : !hasTradeoff ? 'Explain: “The time complexity is O(...) and space is O(...)”' : 'Walk Alex through your test cases.',
      checks: [
        { label: 'Algorithm choice', value: hasDecision ? 'GOOD' : 'ADD THIS', detail: hasDecision ? 'You explained your technique.' : 'Name the data structure or algorithm.' },
        { label: 'Complexity trade-off', value: hasTradeoff ? 'GOOD' : 'ADD THIS', detail: hasTradeoff ? 'Complexity is clear.' : 'State Big-O time and memory.' },
        { label: 'Edge cases', value: hasProof ? 'GOOD' : 'ADD THIS', detail: hasProof ? 'Edge cases addressed.' : 'Test empty inputs or boundary values.' }
      ]
    };
  }, [messages, activeCompany.name]);

  const toTranscript = (msgs: Message[]) => msgs.map(m => ({ speaker: m.speaker === 'PANEL' ? 'interviewer' as const : 'candidate' as const, text: m.text }));

  useEffect(() => {
    if (!started || !mic) return;
    const allYouText = messages.filter(m => m.speaker === 'YOU').map(m => m.text).join(' ');
    const words = allYouText.trim().split(/\s+/).filter(Boolean).length;
    const elapsed = Math.max(0.2, (Date.now() - (startRef.current || Date.now())) / 60000);
    const pace = calculateSpeakingPace(words, elapsed);
    const fillerStats = countFillerWords(allYouText);
    setSpeechStats({ words, pace, fillers: fillerStats.count, lastUpdated: Date.now() });
  }, [messages, started, mic]);

  // Synchronize Camera Streams to both Lobby and Active In-Call Video Elements
  useEffect(() => {
    if (camera && cameraStreamRef.current) {
      if (cameraPreviewRef.current && cameraPreviewRef.current.srcObject !== cameraStreamRef.current) {
        cameraPreviewRef.current.srcObject = cameraStreamRef.current;
        cameraPreviewRef.current.play().catch(() => {});
      }
      if (lobbyCameraRef.current && lobbyCameraRef.current.srcObject !== cameraStreamRef.current) {
        lobbyCameraRef.current.srcObject = cameraStreamRef.current;
        lobbyCameraRef.current.play().catch(() => {});
      }
    }
  }, [started, camera]);

  useEffect(() => () => {
    if (speechDebounceRef.current) clearTimeout(speechDebounceRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    cameraStreamRef.current?.getTracks().forEach(t => t.stop());
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    activeHumanVoice?.pause();
  }, []);

  const applyResumeText = (value: string, source: 'paste' | 'upload' | 'sample', fileLabel = 'No resume loaded') => {
    setContext(c => ({ ...c, resume: value }));
    setResumeSource(source);
    setResumeFileName(fileLabel);
  };

  const handleResumeUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      let text = '';
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer), disableStream: true, disableAutoFetch: true }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const reader = page.streamTextContent().getReader();
          const items: any[] = [];
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value?.items) items.push(...value.items);
          }
          pages.push(items.map((item: any) => item.str || '').join(' '));
        }
        text = pages.join('\n');
      } else {
        text = await file.text();
      }
      if (!text.trim()) {
        alert('Could not extract text from this file.');
        return;
      }
      applyResumeText(text, 'upload', file.name);
    } catch (error) {
      console.error('Resume upload error:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert(`PDF error: ${message}`);
    } finally {
      event.target.value = '';
    }
  };

  const upsertStreamingPanel = (text: string, final = false) => {
    setMessages(prev => {
      const next = [...prev];
      let pendingIndex = -1;
      for (let i = next.length - 1; i >= 0; i--) {
        const message = next[i];
        if (message.speaker === 'PANEL' && message.pending) {
          pendingIndex = i;
          break;
        }
      }
      if (pendingIndex >= 0) {
        next[pendingIndex] = { ...next[pendingIndex], text, pending: !final };
        return next;
      }
      const q = { id: Date.now(), speaker: 'PANEL' as const, text, time: stamp(startRef.current), pending: !final };
      return [...next, q];
    });
  };

  const buildCompanySpecificQuestion = (phase: 'opening' | 'followup', msgs: Message[]) => {
    const candidateAnswers = msgs.filter(m => m.speaker === 'YOU');
    const panelQuestions = msgs.filter(m => m.speaker === 'PANEL').map(m => m.text.toLowerCase().trim());
    const latestAnswer = [...msgs].reverse().find(m => m.speaker === 'YOU')?.text || '';
    const companyName = context.company.trim() || 'Target Company';
    const resumeText = context.resume.trim();
    const count = candidateAnswers.length;

    const isAlreadyAsked = (q: string) => {
      const norm = q.toLowerCase().trim();
      return panelQuestions.some(prev => prev === norm || (prev.length > 20 && norm.length > 20 && (prev.includes(norm.slice(0, 25)) || norm.includes(prev.slice(0, 25)))));
    };

    // Phase 1: Warm Intro (Turn 1)
    if (phase === 'opening' || count === 0) {
      if (resumeText) {
        const techMatch = resumeText.match(/(?:Java|Python|Go|Golang|C\+\+|Rust|Node|React|Kubernetes|Kafka|Redis|Postgres|AWS|GCP|Distributed|Microservices|Docker|Spring)/i);
        const highlighted = techMatch ? techMatch[0] : '';
        if (highlighted) {
          return `Hey! Thanks for jumping on the call today! I'm Alex from engineering here at ${companyName}. I saw your experience with ${highlighted} and systems design. How's your day going so far? To kick things off, could you walk me through your journey and what you've been working on recently?`;
        }
      }
      return `Hey! Thanks for jumping on the call today! I'm Alex from engineering here at ${companyName}. How's your day going so far? Whenever you're ready, I'd love to just kick things off casually — could you tell me a little bit about yourself and what you've been working on recently?`;
    }

    // Phase 2: Resume & Project Deep-Dive (Turns 2-3)
    if (count <= 2) {
      const p2Pool = [
        latestAnswer.toLowerCase().includes('concurren') || latestAnswer.toLowerCase().includes('lock') || latestAnswer.toLowerCase().includes('race')
          ? 'Got it, makes sense. How did you handle edge cases where multiple concurrent requests competed for the same record or key simultaneously?' : '',
        latestAnswer.toLowerCase().includes('latency') || latestAnswer.toLowerCase().includes('scale') || latestAnswer.toLowerCase().includes('cache') || latestAnswer.toLowerCase().includes('kafka')
          ? 'Makes sense. When the pipeline saturated or memory spiked under peak traffic, what was the first bottleneck that appeared, and how did you mitigate it?' : '',
        `Got it. In that architecture, what was the most critical trade-off you personally owned, and what would you change if you had to redesign it from scratch today?`,
        `Interesting. Could you walk me through how you structured data consistency and testing across asynchronous boundaries in that project?`,
        `Fair enough. When that service operated in production, what telemetry or alerting signaled to your team that a performance regression had occurred?`
      ].filter(Boolean);
      return p2Pool.find(q => !isAlreadyAsked(q)) || p2Pool[count % p2Pool.length];
    }

    // Phase 3: Core Technical Challenge (Turns 4-6)
    if (count === 3) {
      return `Awesome, that gives me great context on your background. Let's switch gears into a technical challenge that's very relevant to what we build here at ${companyName}. Let's design a high-throughput, distributed rate limiter and task coordinator that operates across multi-region API gateways with Redis and token buckets. How would you approach designing this from a high level? Feel free to open the scratchpad if you want to write code or sketch components.`;
    }
    if (count <= 5) {
      const p3Pool = [
        `Right, that's a good direction. How would you structure the core in-memory state and data structures for that? Walk me through your API contract and eviction policy.`,
        `Interesting approach. How does your design synchronize quota counters across multiple geographical regions without paying a 150ms cross-region latency penalty on every check?`,
        `Fair point. If the primary Redis cache cluster fails or suffers a network partition, how does your rate limiter fail open or fail closed?`
      ];
      return p3Pool.find(q => !isAlreadyAsked(q)) || p3Pool[(count - 4) % p3Pool.length];
    }

    // Phase 4: Edge Cases & Stress Testing (Turns 7-8)
    if (count <= 7) {
      const p4Pool = [
        `Got it, that makes sense. Now let's stress test this: what happens if traffic spikes 10x suddenly and one of the Redis nodes drops off the network? How does your system prevent a cascading failure to the primary database?`,
        `Fair point. How do you prevent thundering herds and cache stampedes when hot keys expire simultaneously under peak load?`,
        `What specific SLO or latency percentile would trigger automated circuit breaking in this architecture?`
      ];
      return p4Pool.find(q => !isAlreadyAsked(q)) || p4Pool[(count - 6) % p4Pool.length];
    }

    // Phase 5: Candidate Q&A & Wrap-Up (Turn 9+)
    const isQuestion = /\?|what|how|could you|team|culture|deploy|stack|oncall|on-call/i.test(latestAnswer);
    if (isQuestion) {
      return `Great question! At ${companyName}, we emphasize high autonomy, blameless post-mortems, and continuous canary deployments to 1% of live traffic before promoting. Each team owns their services end-to-end. We're about at time today — thank you so much for walking through all of that with me! The recruiting team will follow up on next steps shortly. Have a wonderful day!`;
    }
    return `We've covered a lot of ground today! We have about 5 minutes left, and I want to make sure you have time for questions. What questions do you have for me about engineering at ${companyName}, our team culture, or our tech stack?`;
  };

  const playVoice = (text: string) => {
    if (!voice || !text) return;
    setIsSpeakingTts(true);
    isSpeakingTtsRef.current = true;
    void speak(text, true, voiceName, voiceProfile);
    const estDuration = Math.max(2500, text.split(/\s+/).length * 360);
    setTimeout(() => {
      setIsSpeakingTts(false);
      isSpeakingTtsRef.current = false;
    }, estDuration);
  };

  const fetchPanelQuestion = async (msgs: Message[], phase: 'opening' | 'followup') => {
    if (followUpLock.current) return;
    followUpLock.current = true;
    setThinking(true);
    if (phase === 'followup') {
      // Natural human thinking beat pause (300-600ms)
      await new Promise(r => setTimeout(r, 450));
    }
    const fallbackQuestion = buildCompanySpecificQuestion(phase, msgs);
    upsertStreamingPanel(phase === 'opening' ? 'Starting the interview…' : 'Analyzing response…', false);

    let resolvedQuestion = '';
    let success = false;

    // 1. Primary: Attempt Streaming SSE Endpoint
    try {
      const response = await fetch(apiUrl('/api/interviewer/next/stream'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...context, modelProvider, modelName: openRouterModelInput, customApiKey: openRouterKeyInput, transcript: toTranscript(msgs), phase })
      });
      if (!response.ok || !response.body) throw new Error(`Stream error: ${response.status}`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assembled = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        for (const part of parts) {
          const lines = part.split('\n');
          const eventLine = lines.find(line => line.startsWith('event:'))?.replace('event:', '').trim();
          const dataLine = lines.find(line => line.startsWith('data:'))?.replace('data:', '').trim();
          if (eventLine === 'meta' && dataLine) {
            try {
              const meta = JSON.parse(dataLine);
              if (meta.phase) {
                setCurrentPhase({
                  key: meta.phase,
                  number: meta.phaseNumber || 1,
                  label: meta.phaseLabel || 'Phase 1 • Warm Intro',
                  challenge: meta.challenge
                });
                if (meta.phaseNumber === 3 && meta.challenge) {
                  setShowScratchpad(true);
                  setCode(prev => (prev && prev.length > 60) ? prev : `# ─── ${meta.challenge.title.toUpperCase()} ───\n# ${meta.challenge.problemScenario}\n# Task: ${meta.challenge.starterCodePrompt}\n\ndef solution():\n    pass\n`);
                }
              }
            } catch { /* ignore meta parse */ }
          }
          if (eventLine === 'delta' && dataLine) {
            const payload = JSON.parse(dataLine);
            let text = payload.text || '';
            text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/^Reasoning:[\s\S]*?\n\n/i, '');
            if (text) {
              const needsSpace = assembled.length > 0 && !/\s$/.test(assembled) && !/^\s/.test(text) && !/^[.,!?;:)\]}]/.test(text);
              assembled += (needsSpace ? ' ' : '') + text;
            }
            upsertStreamingPanel(assembled, false);
          }
        }
      }
      const clean = assembled.trim();
      if (clean.length > 15) {
        resolvedQuestion = clean;
        success = true;
        setAiModelStatus('online');
      }
    } catch (streamErr) {
      console.warn('[Interview] SSE streaming failed, trying resilient JSON backup:', streamErr);
    }

    // 2. Resilient Backup: Standard JSON endpoint
    if (!success) {
      try {
        const jsonRes = await fetch(apiUrl('/api/interviewer/next'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...context, modelProvider, modelName: openRouterModelInput, customApiKey: openRouterKeyInput, transcript: toTranscript(msgs), phase })
        });
        if (jsonRes.ok) {
          const data = await jsonRes.json();
          const cleanQ = (data.question || '').trim().replace(/<think>[\s\S]*?<\/think>/gi, '');
          if (cleanQ.length > 15) {
            resolvedQuestion = cleanQ;
            success = true;
            setAiModelStatus('online');
            if (data.phase) {
              setCurrentPhase({
                key: data.phase,
                number: data.phaseNumber || 1,
                label: data.phaseLabel || 'Phase 1 • Warm Intro',
                challenge: data.challenge
              });
              if (data.phaseNumber === 3 && data.challenge) {
                setShowScratchpad(true);
                setCode(prev => (prev && prev.length > 60) ? prev : `# ─── ${data.challenge.title.toUpperCase()} ───\n# ${data.challenge.problemScenario}\n# Task: ${data.challenge.starterCodePrompt}\n\ndef solution():\n    pass\n`);
              }
            }
          }
        }
      } catch (jsonErr) {
        console.warn('[Interview] JSON endpoint backup failed:', jsonErr);
      }
    }

    // 2.5 Resilient Client-Side Direct OpenRouter Call (Guarantees Real API Call Even If Backend is Unreachable)
    if (!success) {
      try {
        const directKey = openRouterKeyInput || getStoredOpenRouterKey();
        if (directKey) {
          console.log('[Interview] Dispatching direct browser OpenRouter call with model:', openRouterModelInput);
          const candAnswers = msgs.filter(m => m.speaker === 'YOU').map(m => m.text);
          const latestCandAnswer = candAnswers[candAnswers.length - 1] || 'Hello!';
          const candTurnCount = candAnswers.length;

          // Determine current phase
          let currentPhaseLabel = 'Phase 1 • Warm Intro & Calibration';
          let phaseGuidance = 'Welcome the candidate warmly. Break the ice and invite them to share a quick overview of what they\'ve been working on recently.';
          if (candTurnCount >= 1 && candTurnCount <= 2) {
            currentPhaseLabel = 'Phase 2 • Resume & Project Deep-Dive';
            phaseGuidance = 'Acknowledge their answer naturally. Probe specific architecture decisions, tech stacks, or bottlenecks mentioned in their background or response.';
          } else if (candTurnCount >= 3 && candTurnCount <= 5) {
            currentPhaseLabel = 'Phase 3 • Core Technical Challenge';
            phaseGuidance = `Present a concrete, realistic engineering challenge relevant to ${context.company || 'the company'} (e.g. distributed rate limiting, cache stampede mitigation, geo-spatial index).`;
          } else if (candTurnCount >= 6 && candTurnCount <= 7) {
            currentPhaseLabel = 'Phase 4 • Edge Cases & Stress Testing';
            phaseGuidance = 'Stress test their proposed design. Ask about network partitions, failovers, memory pressure, or hot partition skew.';
          } else if (candTurnCount >= 8) {
            currentPhaseLabel = 'Phase 5 • Candidate Q&A & Wrap-Up';
            phaseGuidance = 'Answer any candidate questions about engineering culture and tech stack, then sign off warmly.';
          }

          const directSystem = `You are Alex Rivera, a senior software engineer conducting a live technical video interview at ${context.company || 'the company'}.
Say exactly ONE complete turn (2 to 3 natural conversational sentences).
Start with a natural conversational acknowledgment ("Got it.", "Makes sense.", "Fair enough.", "Right, interesting.").
Ask ONE focused, thoughtful technical question based on the candidate's latest answer.
Never break character. Return ONLY the spoken dialogue.`;

          const conversationHistory = msgs.map(m => `${m.speaker === 'YOU' ? 'Candidate' : 'Alex'}: ${m.text}`).join('\n');

          const directUser = `INTERVIEW CONTEXT:
Role: ${context.role || 'Software Engineer'}
Company: ${context.company || 'Tech Company'}
Candidate CV: ${(context.resume || 'No resume provided').slice(0, 1000)}
Current Phase: ${currentPhaseLabel}
Phase Objective: ${phaseGuidance}

CONVERSATION SO FAR:
${conversationHistory || '(Interview just started)'}

Candidate just said: "${latestCandAnswer}"
Ask the next authentic follow-up question.`;

          const directResult = await generateQuestionDirectly({
            systemPrompt: directSystem,
            userPrompt: directUser,
            apiKey: directKey,
            model: openRouterModelInput
          });

          if (directResult.question && directResult.question.length > 15) {
            resolvedQuestion = directResult.question;
            success = true;
            setAiModelStatus('online');
            setLastTelemetry(directResult.telemetry);
            console.log('[OpenRouter Direct Browser Call] Success:', directResult.telemetry);
          }
        }
      } catch (directErr) {
        console.warn('[Interview] Direct OpenRouter client call failed:', directErr);
      }
    }

    // 3. Client Heuristic Fallback (Zero Repetition Guarantee)
    if (!resolvedQuestion) {
      setAiModelStatus('fallback');
      const candTurns = msgs.filter(m => m.speaker === 'YOU').length;
      let phaseNum = 1;
      let phaseLabel = 'Phase 1 • Warm Intro & Calibration';
      let phaseKey = 'warm-intro';
      if (candTurns === 1 || candTurns === 2) {
        phaseNum = 2; phaseKey = 'cv-deep-dive'; phaseLabel = 'Phase 2 • Resume & Project Deep-Dive';
      } else if (candTurns >= 3 && candTurns <= 5) {
        phaseNum = 3; phaseKey = 'technical-challenge'; phaseLabel = 'Phase 3 • Core Technical Challenge';
      } else if (candTurns === 6 || candTurns === 7) {
        phaseNum = 4; phaseKey = 'edge-cases'; phaseLabel = 'Phase 4 • Edge Cases & Trade-offs';
      } else if (candTurns >= 8) {
        phaseNum = 5; phaseKey = 'candidate-qa'; phaseLabel = 'Phase 5 • Candidate Q&A & Wrap-Up';
      }
      setCurrentPhase(prev => ({ ...prev, number: phaseNum, key: phaseKey, label: phaseLabel }));
      resolvedQuestion = fallbackQuestion;
    }

    setConversationalFiller('');
    upsertStreamingPanel(resolvedQuestion, true);
    playVoice(resolvedQuestion);
    followUpLock.current = false;
    setThinking(false);
  };

  const commitAnswer = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || followUpLock.current) return;
    setInterimTranscript('');
    speechBufferRef.current = '';
    const youMsg = { id: Date.now(), speaker: 'YOU' as const, text: trimmed, time: stamp(startRef.current) };
    const next = [...messagesRef.current, youMsg];
    setMessages(next);

    // Calculate real-time candidate speech telemetry
    const allYouText = next.filter(m => m.speaker === 'YOU').map(m => m.text).join(' ');
    const wordCount = allYouText.split(/\s+/).filter(Boolean).length;
    const elapsedMinutes = Math.max(0.2, (Date.now() - (startRef.current || Date.now())) / 60000);
    const pace = calculateSpeakingPace(wordCount, elapsedMinutes);
    const fillerStats = countFillerWords(allYouText);
    setSpeechStats({ words: wordCount, pace, fillers: fillerStats.count, lastUpdated: Date.now() });

    // Instant Zero-Latency Conversational Bridge
    const CONVERSATIONAL_FILLERS = [
      "Got it. Analyzing your approach...",
      "Understood. Looking into your system architecture...",
      "Right, interesting trade-off. Let me review that...",
      "Makes sense. Evaluating your edge-case handling...",
      "Understood, let's explore that design decision..."
    ];
    const filler = CONVERSATIONAL_FILLERS[Math.floor(Math.random() * CONVERSATIONAL_FILLERS.length)];
    setConversationalFiller(filler);

    setInterviewerBehavior('taking-notes');
    setTimeout(() => {
      setInterviewerBehavior('idle');
    }, 3200);

    void fetchPanelQuestion(next, 'followup');
  };

  const interruptAlex = () => {
    window.speechSynthesis?.cancel();
    if (activeHumanVoice) {
      try { activeHumanVoice.pause(); } catch (_) {}
      activeHumanVoice = null;
    }
    setIsSpeakingTts(false);
    isSpeakingTtsRef.current = false;
    setThinking(false);
    setInterviewerBehavior('idle');
    if (!mic) {
      void startMic();
    }
  };

  const insertArchitectureBlock = (type: 'gateway' | 'queue' | 'cache' | 'database' | 'microservice' | 'loadbalancer') => {
    setShowScratchpad(true);
    let template = '';
    let nodeName = '';
    let latency = '1.0ms';
    let throughput = '50k RPS';

    switch (type) {
      case 'gateway':
        nodeName = 'API Gateway (Envoy)';
        latency = '1.2ms';
        throughput = '45k RPS';
        template = `\n// ─── ARCHITECTURE: API GATEWAY & RATE LIMITING ───\n// [Clients / Mobile / Web] \n//           │\n//           ▼\n// ┌───────────────────────────────────────┐\n// │   API Gateway (Kong / Envoy)          │\n// │   - Token Bucket Rate Limiter (Redis) │\n// │   - JWT Auth & SSL Termination        │\n// │   - Dynamic Route Dispatching         │\n// └───────────────────────────────────────┘\n`;
        break;
      case 'queue':
        nodeName = 'Kafka Event Stream';
        latency = '3.5ms';
        throughput = '150k msg/s';
        template = `\n// ─── ARCHITECTURE: ASYNC EVENT STREAM (KAFKA) ───\n// [Publisher Service] ──▶ [Kafka Topic: user-events] (Partition Key: user_id)\n//                                │\n//                    ┌───────────┴───────────┐\n//                    ▼                       ▼\n//          [Consumer Group 1]      [Consumer Group 2]\n//          (Analytics Pipeline)    (Notification Worker)\n`;
        break;
      case 'cache':
        nodeName = 'Redis Cache Cluster';
        latency = '0.6ms';
        throughput = '200k QPS';
        template = `\n// ─── ARCHITECTURE: MULTI-TIER CACHING (REDIS) ───\n// Read Path:  Client ──▶ App Server ──▶ Redis (Cache Hit ~2ms)\n//                                │ (Cache Miss)\n//                                └──▶ Primary DB ──▶ Write-Back to Redis (TTL: 300s)\n`;
        break;
      case 'database':
        nodeName = 'PostgreSQL Sharded DB';
        latency = '12ms';
        throughput = '15k QPS';
        template = `\n// ─── ARCHITECTURE: DISTRIBUTED STORAGE / SHARDING ───\n// [App Layer] ──▶ Consistent Hashing Router\n//                      ├──▶ Shard 0 (PostgreSQL Master + Read Replicas)\n//                      ├──▶ Shard 1 (PostgreSQL Master + Read Replicas)\n//                      └──▶ Shard 2 (PostgreSQL Master + Read Replicas)\n`;
        break;
      case 'microservice':
        nodeName = 'Worker Pool Service';
        latency = '25ms';
        throughput = '8k RPS';
        template = `\n// ─── ARCHITECTURE: CORE MICROSERVICE WORKER ───\nclass TransactionWorker {\n  async processOrder(orderId: string, payload: any) {\n    // 1. Idempotency Check using Redis SETNX\n    // 2. Distributed Lock / Saga Coordinator\n    // 3. Database ACID Transaction\n    // 4. Emit Audit Event to Message Bus\n  }\n}\n`;
        break;
      case 'loadbalancer':
        nodeName = 'L4/L7 Load Balancer';
        latency = '0.4ms';
        throughput = '80k RPS';
        template = `\n// ─── ARCHITECTURE: LOAD BALANCER & FAILOVER ───\n// [Internet Traffic]\n//         │\n//         ▼\n// ┌───────────────────────────────────┐\n// │ L4/L7 Load Balancer (Round Robin) │\n// └───────────────────────────────────┘\n//        ├──▶ Instance A (Healthy - 15% CPU)\n//        ├──▶ Instance B (Healthy - 18% CPU)\n//        └──▶ Instance C (Healthy - 12% CPU)\n`;
        break;
    }
    setCode(c => (c ? c + '\n' + template : template));
    setArchNodes(nodes => [
      ...nodes,
      {
        id: 'node-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        type,
        name: nodeName,
        latency,
        throughput
      }
    ]);
  };

  const stopMic = () => {
    retryRef.current = false;
    recognitionRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setMic(false);
    if (speechDebounceRef.current) clearTimeout(speechDebounceRef.current);
    const pending = speechBufferRef.current.trim();
    speechBufferRef.current = '';
    if (pending.length > 8) commitAnswer(pending);
  };

  const stopCamera = () => {
    cameraStreamRef.current?.getTracks().forEach(track => track.stop());
    cameraStreamRef.current = null;
    if (cameraPreviewRef.current) cameraPreviewRef.current.srcObject = null;
    if (lobbyCameraRef.current) lobbyCameraRef.current.srcObject = null;
    setCamera(false);
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 540 } }, audio: false });
      cameraStreamRef.current = stream;
      if (cameraPreviewRef.current) {
        cameraPreviewRef.current.srcObject = stream;
        await cameraPreviewRef.current.play();
      }
      if (lobbyCameraRef.current) {
        lobbyCameraRef.current.srcObject = stream;
        await lobbyCameraRef.current.play();
      }
      setCamera(true);
      return true;
    } catch {
      setCameraError('Camera permission is required for this proctored live technical interview.');
      return false;
    }
  };

  const startMic = async () => {
    setMicError('');
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      setMic(true);
      retryRef.current = true;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setMicError('Mic is live. Type your code explanations or response below.');
        return true;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        // Acoustic Echo Cancellation: If Alex is currently speaking aloud, do not transcribe sound from speakers
        if (isSpeakingTtsRef.current) return;

        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            speechBufferRef.current += `${event.results[i][0].transcript} `;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }
        const liveText = (speechBufferRef.current + ' ' + interimText).trim();
        setInterimTranscript(liveText);

        if (speechDebounceRef.current) clearTimeout(speechDebounceRef.current);
        speechDebounceRef.current = setTimeout(() => {
          const chunk = liveText;
          speechBufferRef.current = '';
          setInterimTranscript('');
          if (chunk.length > 8) commitAnswer(chunk);
        }, 1800);
      };
      recognition.onerror = (event: any) => {
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          setMicError(`Speech recognition: ${event.error}.`);
        }
      };
      recognition.onend = () => {
        if (retryRef.current) {
          try { recognition.start(); } catch { /* already restarting */ }
        }
      };
      recognitionRef.current = recognition;
      recognition.start();
      return true;
    } catch {
      setMicError('Microphone permission is required.');
      setMic(false);
      return false;
    }
  };

  const grantAllPermissions = async () => {
    await startCamera();
    await startMic();
  };

  const startInterview = async () => {
    if (!camera || !mic) {
      const camOk = camera || (await startCamera());
      const micOk = mic || (await startMic());
      if (!camOk || !micOk) {
        setLobbyStep('preflight');
        return;
      }
    }
    setStarted(true);
    startRef.current = Date.now();
    setMessages([]);
    setCurrentPhase({
      key: 'warm-intro',
      number: 1,
      label: 'Phase 1 • Warm Intro & Calibration'
    });
    setInterimTranscript('');
    setShowEndCallConfirm(false);
    const resolvedCompany = context.company.trim() || 'General Tech Company';
    const resolvedRole = context.role.trim() || 'Software Engineer';
    const resolvedFocus = context.focus.trim() || 'Distributed systems and engineering algorithms';
    const resolvedContext = {
      ...context,
      company: resolvedCompany,
      role: resolvedRole,
      persona: 'Alex Rivera (Staff Software Engineer)',
      focus: resolvedFocus,
      resume: context.resume || '',
      jobDescription: context.jobDescription || ''
    };
    setContext(resolvedContext);
    await fetchPanelQuestion([], 'opening');
  };

  const submitText = () => {
    const t = input;
    setInput('');
    if (!started) {
      void (async () => {
        await startInterview();
        if (t.trim()) commitAnswer(t);
      })();
      return;
    }
    commitAnswer(t);
  };

  const interviewerState: InterviewerVisualState = isSpeakingTts
    ? 'speaking'
    : interviewerBehavior === 'reviewing-code'
    ? 'reviewing-code'
    : interviewerBehavior === 'taking-notes'
    ? 'taking-notes'
    : thinking
    ? 'thinking'
    : 'listening';
  const permissionsReady = camera && mic;
  const currentCompany = context.company.trim() || 'Target Company';
  const currentRole = context.role.trim() || 'Target Role';
  const currentFocus = context.focus.trim() || 'Technical Architecture & Problem Solving';

  return (
    <main className="video-room-shell">
      {/* Pre-Call Lobby / Mandatory Proctoring Green Room */}
      {!started ? (
        <section>
          {lobbyStep === 'setup' ? (
            /* STEP 1: Full Calibration & Profile Grounding */
            <div>
              <div className="studio-head" style={{ marginBottom: 20 }}>
                <div>
                  <p className="kicker">STEP 1 OF 2 / INTERVIEW CALIBRATION &amp; CV GROUNDING</p>
                  <h1>Calibrate Your<br /><span>Technical Round.</span></h1>
                </div>
                <div className="session-meta">
                  <b>SESSION PROFILE SETUP</b>
                  <span>TRACK: {context.company.trim() ? context.company.toUpperCase() : 'TYPE COMPANY BELOW'}</span>
                  <span>LEVEL: {context.role.trim() ? context.role.toUpperCase() : 'TYPE ROLE BELOW'}</span>
                  <span>Alex probes your CV &amp; target requirements</span>
                </div>
              </div>

              <div className="lobby-setup-wide-grid">
                {/* Left Column: Interviewer & Track Configuration */}
                <div className="lobby-setup-col">
                  {/* Assigned Interviewer Card */}
                  <div className="brutalist-field-box">
                    <div className="brutalist-field-header">
                      <span className="field-title">ASSIGNED INTERVIEW PANEL</span>
                      <span className="field-badge-ok">✓ READY TO SCREEN</span>
                    </div>
                    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, background: 'var(--paper)' }}>
                      <div className="interviewer-avatar-badge" style={{ margin: 0 }}>
                        <Bot size={22} />
                        <div className="verified-dot" title="Ready to interview" />
                      </div>
                      <div className="interviewer-info">
                        <div className="interviewer-name-row">
                          <strong>Alex</strong>
                          <span className="interviewer-pill">AI Technical Interviewer</span>
                        </div>
                        <p className="interviewer-desc" style={{ margin: '4px 0 0', fontSize: 12 }}>
                          Calibrated for <b>{currentCompany}</b> • Probes architecture, trade-offs &amp; CV experience.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 01 / Target Company Track (Manual Input Only) */}
                  <div className="brutalist-field-box">
                    <div className="brutalist-field-header">
                      <span className="field-title">01 / TARGET COMPANY TRACK</span>
                      <span className={context.company.trim() ? 'field-badge-ok' : 'field-tag'}>
                        {context.company.trim() ? `✓ ${context.company.toUpperCase()}` : 'REQUIRED'}
                      </span>
                    </div>
                    <div className="brutalist-input-feed-bar">
                      <input
                        type="text"
                        autoComplete="off"
                        spellCheck={false}
                        className="brutalist-text-input"
                        placeholder="e.g. Google, Flipkart, Stripe, OpenAI, Uber, Datadog, Razorpay, TCS Prime..."
                        value={context.company}
                        onChange={e => setContext(c => ({ ...c, company: e.target.value }))}
                      />
                      <button
                        type="button"
                        className={`brutalist-apply-btn ${context.company.trim() ? 'active' : ''}`}
                        title="Save target company"
                      >
                        {context.company.trim() ? '✓ SAVED' : 'SAVE'}
                      </button>
                    </div>
                  </div>

                  {/* 02 / Interview Rigor & Seniority Level (Manual Input Only) */}
                  <div className="brutalist-field-box">
                    <div className="brutalist-field-header">
                      <span className="field-title">02 / INTERVIEW RIGOR &amp; SENIORITY LEVEL</span>
                      <span className={context.role.trim() ? 'field-badge-ok' : 'field-tag'}>
                        {context.role.trim() ? `✓ ${context.role.toUpperCase()}` : 'REQUIRED'}
                      </span>
                    </div>
                    <div className="brutalist-input-feed-bar">
                      <input
                        type="text"
                        autoComplete="off"
                        spellCheck={false}
                        className="brutalist-text-input"
                        placeholder="e.g. Senior Backend Engineer (SDE-3), Staff Systems Architect, SDE-2, Lead SRE..."
                        value={context.role}
                        onChange={e => setContext(c => ({ ...c, role: e.target.value }))}
                      />
                      <button
                        type="button"
                        className={`brutalist-apply-btn ${context.role.trim() ? 'active' : ''}`}
                        title="Save target role"
                      >
                        {context.role.trim() ? '✓ SAVED' : 'SAVE'}
                      </button>
                    </div>
                  </div>

                  {/* 03 / Technical Evaluation Focus (Manual Input Only) */}
                  <div className="brutalist-field-box">
                    <div className="brutalist-field-header">
                      <span className="field-title">03 / TECHNICAL EVALUATION FOCUS</span>
                      <span className={context.focus.trim() ? 'field-badge-ok' : 'field-tag'}>
                        {context.focus.trim() ? `✓ ${context.focus.toUpperCase()}` : 'REQUIRED'}
                      </span>
                    </div>
                    <div className="brutalist-input-feed-bar">
                      <input
                        type="text"
                        autoComplete="off"
                        spellCheck={false}
                        className="brutalist-text-input"
                        placeholder="e.g. Distributed Systems, Kafka & Caching, DSA & Concurrency, Low-Latency C++..."
                        value={context.focus}
                        onChange={e => setContext(c => ({ ...c, focus: e.target.value }))}
                      />
                      <button
                        type="button"
                        className={`brutalist-apply-btn ${context.focus.trim() ? 'active' : ''}`}
                        title="Save evaluation topics"
                      >
                        {context.focus.trim() ? '✓ SAVED' : 'SAVE'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: JD, Resume Grounding & Continue Button */}
                <div className="lobby-setup-col">
                  {/* 04 / Target Job Description (Optional) */}
                  <div className="brutalist-field-box">
                    <div className="brutalist-field-header">
                      <span className="field-title">04 / JOB DESCRIPTION / TARGET REQUIREMENTS</span>
                      <span className="field-tag">OPTIONAL</span>
                    </div>
                    <textarea
                      className="brutalist-textarea-input"
                      value={context.jobDescription || ''}
                      onChange={e => setContext(c => ({ ...c, jobDescription: e.target.value }))}
                      placeholder="Paste the job description or role requirements so Alex maps interview questions to what the team is looking for..."
                      style={{ minHeight: 90 }}
                    />
                  </div>

                  {/* 05 / Candidate CV & Experience (Grounds Questions) */}
                  <div className="brutalist-field-box">
                    <div className="brutalist-field-header">
                      <span className="field-title">05 / CANDIDATE CV &amp; EXPERIENCE</span>
                      {resumeFileName !== 'No resume loaded' ? (
                        <span className="field-badge-ok">✓ {resumeFileName}</span>
                      ) : (
                        <span className="field-tag">GROUNDS QUESTIONS</span>
                      )}
                    </div>
                    <textarea
                      className="brutalist-textarea-input"
                      value={context.resume}
                      onChange={e => setContext(c => ({ ...c, resume: e.target.value }))}
                      placeholder="Paste your CV / resume or load sample CV so Alex directly calibrates technical questions to your actual projects, tech stack, and experience..."
                      style={{ minHeight: 120 }}
                    />
                    <div className="brutalist-actions-bar">
                      <button
                        type="button"
                        className="brutalist-action-btn"
                        onClick={() =>
                          applyResumeText(
                            `Name: Alex Chen (Backend / Systems Candidate)\nExperience: 4 years building distributed systems, Java/Spring Boot APIs, Kafka event streams, Redis caching, Kubernetes microservices.\nKey Project: Led migration to partitioned Kafka event queues, cutting P99 latency by 35% under 85k RPS peak load.\nTarget role: Backend Engineer`,
                            'sample',
                            'Backend Systems CV'
                          )
                        }
                      >
                        <FileText size={13} /> + Systems CV
                      </button>
                      <button
                        type="button"
                        className="brutalist-action-btn"
                        onClick={() =>
                          applyResumeText(
                            `Name: Rahul Sharma (College Senior / New Grad)\nEducation: B.Tech Computer Science & Engineering (Final Year).\nCoursework: DSA, Operating Systems, Database Management, Distributed Computing.\nProjects:\n1. Real-time Collaborative Code Editor (React, WebSockets, Redis, Docker).\n2. Distributed Key-Value Store in Go with Raft Consensus.\nSkills: C++, Java, Python, TypeScript, React, SQL, Git.`,
                            'sample',
                            'College / Grad CV'
                          )
                        }
                      >
                        <FileText size={13} /> + College CV
                      </button>
                      <button
                        type="button"
                        className="brutalist-action-btn primary"
                        onClick={() => resumeInputRef.current?.click()}
                      >
                        <Upload size={13} /> Upload PDF
                      </button>
                      {context.resume && (
                        <button
                          type="button"
                          className="brutalist-action-btn"
                          style={{ color: '#ef4444' }}
                          onClick={() => applyResumeText('', 'paste', 'No resume loaded')}
                        >
                          <X size={13} /> Clear
                        </button>
                      )}
                      <input ref={resumeInputRef} type="file" accept=".pdf,.txt,.md" onChange={handleResumeUpload} hidden />
                    </div>
                  </div>

                  {/* 06 / AI Engine & Multi-Provider Automatic Free Failover */}
                  <div className="brutalist-field-box">
                    <div className="brutalist-field-header">
                      <span className="field-title">06 / AI ENGINE &amp; MULTI-PROVIDER FAILOVER</span>
                      <span className="field-badge-ok">✓ AUTO-FAILOVER ACTIVE</span>
                    </div>
                    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type={showKey ? 'text' : 'password'}
                          className="brutalist-text-input"
                          style={{ flex: 1, fontSize: 12, padding: '7px 10px' }}
                          placeholder="API key(s) - enter comma-separated keys for instant auto-failover"
                          value={openRouterKeyInput}
                          onChange={e => {
                            setOpenRouterKeyInput(e.target.value);
                            setStoredOpenRouterKey(e.target.value);
                          }}
                        />
                        <button
                          type="button"
                          className="brutalist-action-btn"
                          onClick={() => setShowKey(s => !s)}
                          style={{ padding: '6px 10px', fontSize: 11 }}
                          title={showKey ? 'Hide key' : 'Show key'}
                        >
                          {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button
                          type="button"
                          className="brutalist-action-btn primary"
                          disabled={testingApi}
                          onClick={() => void handleTestApi()}
                          style={{ padding: '6px 12px', fontSize: 11 }}
                        >
                          {testingApi ? 'Testing...' : 'Test API'}
                        </button>
                      </div>

                      {testApiResult && (
                        <div style={{
                          padding: '6px 10px',
                          borderRadius: 4,
                          fontSize: 11,
                          background: testApiResult.ok ? 'rgba(74, 222, 128, 0.12)' : 'rgba(248, 113, 113, 0.12)',
                          color: testApiResult.ok ? '#166534' : '#991b1b',
                          border: `1px solid ${testApiResult.ok ? '#86efac' : '#fca5a5'}`
                        }}>
                          {testApiResult.message}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', fontSize: 11, color: 'var(--subtle)' }}>
                        <span style={{ fontWeight: 600 }}>Active Cascade:</span>
                        <span style={{ padding: '2px 6px', background: 'var(--paper)', borderRadius: 3, border: '1px solid var(--line)' }}>1. OpenRouter Pool</span>
                        <span>→</span>
                        <span style={{ padding: '2px 6px', background: 'var(--paper)', borderRadius: 3, border: '1px solid var(--line)' }}>2. Groq Llama 3.3</span>
                        <span>→</span>
                        <span style={{ padding: '2px 6px', background: 'var(--paper)', borderRadius: 3, border: '1px solid var(--line)' }}>3. Gemini Flash</span>
                        <span>→</span>
                        <span style={{ padding: '2px 6px', background: 'var(--paper)', borderRadius: 3, border: '1px solid var(--line)' }}>4. Local Heuristic Engine</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="join-call-btn-refined"
                    style={{ background: 'var(--ink)', width: '100%', marginTop: 'auto' }}
                    onClick={async () => {
                      await grantAllPermissions();
                      setLobbyStep('preflight');
                    }}
                  >
                    CONTINUE TO CAMERA &amp; MIC VERIFICATION <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: Pre-Flight Camera & Mic Verification Green Room */
            <div>
              <div className="studio-head" style={{ marginBottom: 20 }}>
                <div>
                  <p className="kicker">STEP 2 OF 2 / MANDATORY PROCTORING &amp; DEVICE CHECK</p>
                  <h1>Camera &amp; Audio<br /><span>Pre-Flight Verification.</span></h1>
                </div>
                <div className="session-meta">
                  <b>{permissionsReady ? 'VERIFIED & READY' : 'PERMISSION REQUIRED'}</b>
                  <span>TRACK: {currentCompany.toUpperCase()}</span>
                  <span>PROCTORING: WEBCAM + LIVE MIC</span>
                </div>
              </div>

              <div className="lobby-container">
                {/* Live Webcam & Mic Tile */}
                <div className="lobby-preview-card">
                  <div className="lobby-camera-box">
                    {camera ? (
                      <video ref={lobbyCameraRef} muted playsInline autoPlay />
                    ) : (
                      <div className="lobby-cam-placeholder">
                        <div className="avatar-circle">
                          <LockKeyhole size={36} />
                        </div>
                        <b>Mandatory Camera Verification</b>
                        <small style={{ maxWidth: 280, color: '#f87171' }}>
                          Camera &amp; microphone permissions are verified for this proctored live technical interview.
                        </small>
                        <button className="join-call-btn" style={{ width: 'auto', padding: '8px 18px', marginTop: 8 }} onClick={() => void grantAllPermissions()}>
                          <Video size={16} /> Allow Camera &amp; Mic
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="lobby-device-bar">
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className={`mandatory-check-pill ${camera ? 'ok' : 'warn'}`}>
                        {camera ? <Check size={14} /> : <X size={14} />} Camera {camera ? 'Verified' : 'Required'}
                      </span>
                      <span className={`mandatory-check-pill ${mic ? 'ok' : 'warn'}`}>
                        {mic ? <Check size={14} /> : <X size={14} />} Mic {mic ? 'Verified' : 'Required'}
                      </span>
                      <button
                        type="button"
                        className="audio-test-btn"
                        onClick={playSpeakerTestChime}
                        title="Test speaker / headphone output"
                      >
                        <Volume2 size={13} /> Test Speaker 🔊
                      </button>
                    </div>
                    <LiveMeter active={mic} />
                  </div>
                </div>

                {/* Session Confirmation & Launch Card */}
                <div className="lobby-config-card">
                  <div>
                    <p className="kicker">ASSIGNED INTERVIEWER</p>
                    <div className="interviewer-bio-card-refined">
                      <div className="interviewer-avatar-badge">
                        <Bot size={22} />
                        <div className="verified-dot" title="Ready to interview" />
                      </div>
                      <div className="interviewer-info">
                        <div className="interviewer-name-row">
                          <strong>Alex</strong>
                          <span className="interviewer-pill">AI Interviewer</span>
                        </div>
                        <p className="interviewer-desc">
                          Ready to interview for {currentCompany}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary of Calibrated Settings */}
                  <div className="lobby-summary-box">
                    <div className="lobby-summary-row">
                      <span>TARGET COMPANY</span>
                      <b>{currentCompany.toUpperCase()}</b>
                    </div>
                    <div className="lobby-summary-row">
                      <span>SENIORITY RIGOR</span>
                      <b>{currentRole}</b>
                    </div>
                    <div className="lobby-summary-row">
                      <span>TECHNICAL FOCUS</span>
                      <b>{currentFocus}</b>
                    </div>
                    <div className="lobby-summary-row" style={{ borderBottom: 'none' }}>
                      <span>CV GROUNDING</span>
                      <b>{context.resume && context.resume.trim().length > 20 ? '✓ CV LOADED (GROUNDED)' : 'GENERAL INTERVIEW'}</b>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button
                      className="join-call-btn-refined"
                      style={{ background: permissionsReady ? 'var(--ink)' : 'var(--violet)' }}
                      onClick={() => void startInterview()}
                    >
                      <Radio size={18} /> {permissionsReady ? 'ENTER LIVE INTERVIEW WITH ALEX' : 'ENABLE CAMERA & MIC TO ENTER'} <ArrowRight size={18} />
                    </button>
                    <button
                      type="button"
                      className="back-calibration-btn"
                      onClick={() => setLobbyStep('setup')}
                    >
                      <ArrowLeft size={16} /> EDIT CALIBRATION &amp; CV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      ) : (
        /* Voice-Only Conversational Video Call Stage */
        <section className="google-meet-stage">
          {/* Top Call Header */}
          <div className="call-stage-header">
            <div className="call-badge-live">
              <div className="live-pulse-dot" />
              <span>LIVE CONVERSATIONAL INTERVIEW</span>
              <span style={{ color: '#fff', marginLeft: 8 }}>{stamp(startRef.current)}</span>
            </div>
            <div className="call-room-meta">
              <span><b>{context.company || activeCompany.name}</b> • {context.role || 'SDE-1'}</span>
              <span><ShieldCheck size={14} color="#4ade80" /> Voice &amp; Proctoring Active</span>
              <span style={{ color: aiModelStatus === 'online' ? '#4ade80' : '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={13} color={aiModelStatus === 'online' ? '#4ade80' : '#f59e0b'} />
                {aiModelStatus === 'online' ? 'AI: Online' : 'AI: Heuristic'}
              </span>
            </div>
            <div className="call-header-actions">
              <button className={`header-pill-btn ${drawerOpen ? 'active' : ''}`} onClick={() => setDrawerOpen(o => !o)}>
                <BookOpen size={14} /> Transcript &amp; Coach
              </button>
              <button className={`header-pill-btn ${configOpen ? 'active' : ''}`} onClick={() => setConfigOpen(o => !o)}>
                ⚙️ Settings
              </button>
            </div>
          </div>

          {/* 5-Phase Interactive Visual Progress Bar */}
          <div className="meet-phase-timeline-bar">
            {[
              { id: 1, key: 'warm-intro', label: '1. Warm Welcome', desc: 'Icebreaker & Format' },
              { id: 2, key: 'cv-deep-dive', label: '2. CV & Projects', desc: 'Architecture Deep-Dive' },
              { id: 3, key: 'technical-challenge', label: '3. Technical Challenge', desc: 'Core Problem & Coding' },
              { id: 4, key: 'edge-cases', label: '4. Scale & Trade-Offs', desc: 'Edge Cases & Stress Tests' },
              { id: 5, key: 'candidate-qa', label: '5. Candidate Q&A', desc: 'Culture & Next Steps' }
            ].map(step => {
              const isActive = currentPhase.number === step.id;
              const isPast = currentPhase.number > step.id;
              return (
                <div key={step.id} className={`phase-step-item ${isActive ? 'active' : isPast ? 'completed' : 'upcoming'}`}>
                  <div className="phase-step-indicator">
                    {isPast ? <Check size={12} strokeWidth={3} /> : <span>0{step.id}</span>}
                  </div>
                  <div className="phase-step-details">
                    <span className="phase-step-title">{step.label}</span>
                    <span className="phase-step-sub">{step.desc}</span>
                  </div>
                  {isActive && <div className="phase-live-pulse-glow" />}
                </div>
              );
            })}
          </div>

          {/* Technical Challenge Live Banner */}
          {currentPhase.challenge && (currentPhase.number === 3 || currentPhase.number === 4) && (
            <div className="phase-challenge-banner">
              <div className="challenge-banner-info">
                <span className="challenge-badge">🎯 LIVE CHALLENGE</span>
                <strong>{currentPhase.challenge.title}</strong>
                <p>{currentPhase.challenge.problemScenario}</p>
              </div>
              <button
                type="button"
                className="challenge-open-scratchpad-btn"
                onClick={() => setShowScratchpad(true)}
              >
                <Code2 size={14} /> Open Problem Workbench
              </button>
            </div>
          )}

          {configOpen && (
            <div className="brutalist-field-box" style={{ margin: '0 0 14px', background: 'var(--paper)' }}>
              <div className="brutalist-field-header">
                <span className="field-title">LIVE SESSION CALIBRATION &amp; RIGOR</span>
                <span className="field-tag">{context.company.toUpperCase()}</span>
              </div>
              <div className="context-fields" style={{ padding: 14 }}>
                <label>
                  INTERVIEW RIGOR / SENIORITY LEVEL
                  <select
                    value={context.role}
                    onChange={e => setContext(c => ({ ...c, role: e.target.value }))}
                  >
                    <option value="Software Engineer (SDE-1 / SDE-2)">SDE-1 / SDE-2 (Core Systems &amp; Algorithmic Breadth)</option>
                    <option value="Senior Software Engineer (SDE-3 / Senior)">Senior SDE (Deep Architecture, Fault-Tolerance &amp; Trade-offs)</option>
                    <option value="Staff / Principal Systems Architect">Staff / Principal (Distributed Systems &amp; Massive Scale)</option>
                    <option value="Tech Lead / Engineering Manager">Tech Lead (Systems Architecture, Craft &amp; Impact)</option>
                  </select>
                </label>

                <label>
                  TECHNICAL EVALUATION FOCUS
                  <select
                    value={context.focus}
                    onChange={e => setContext(c => ({ ...c, focus: e.target.value }))}
                  >
                    <option value="Distributed systems, concurrency, and API performance">Distributed Systems, Concurrency &amp; API Scale</option>
                    <option value="Data structures, algorithms, and computational complexity">DSA, Algorithmic Complexity &amp; Optimization</option>
                    <option value="Database consistency, caching strategies, and data integrity">Caching, Databases &amp; Event Streams</option>
                    <option value="Reliability, observability, rate limiting, and failure recovery">Resilience, Observability &amp; Incident Recovery</option>
                  </select>
                </label>

                <label>
                  TARGET COMPANY TRACK
                  <input
                    value={context.company}
                    onChange={e => setContext(c => ({ ...c, company: e.target.value }))}
                    placeholder="e.g. All Top Tech, Google, Meta..."
                  />
                </label>

                <label>
                  CANDIDATE EXPERIENCE &amp; HIGHLIGHTS
                  <textarea
                    value={context.resume}
                    onChange={e => setContext(c => ({ ...c, resume: e.target.value }))}
                    placeholder="Paste specific background or projects to calibrate question depth..."
                    style={{ minHeight: 44 }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Top HUD: 45-Minute Bar-Raiser Timer & 5-Phase Interview Stepper */}
          <div className="meeting-top-hud">
            <div className="meeting-hud-left">
              <span className="meeting-company-pill">
                TARGET: {context.company || activeCompany.name || 'TIER-1 TECH'}
              </span>
              <span className="meeting-company-pill" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}>
                CALIBRATION: {context.role || 'STAFF / SENIOR SDE'}
              </span>
            </div>

            <div className="meeting-hud-center">
              <div className={`countdown-clock ${secondsRemaining < 300 ? 'danger' : secondsRemaining < 600 ? 'warning' : ''}`}>
                <Clock size={13} />
                <span>{formatTimer(secondsRemaining)} REMAINING</span>
              </div>

              <div className="phase-stepper-strip">
                {[
                  { num: 1, name: 'Intro' },
                  { num: 2, name: 'Deep Dive' },
                  { num: 3, name: 'Architecture' },
                  { num: 4, name: 'System Stress' },
                  { num: 5, name: 'Debrief' }
                ].map(phase => (
                  <span
                    key={phase.num}
                    className={`phase-step-node ${currentPhase.number === phase.num ? 'active' : currentPhase.number > phase.num ? 'completed' : ''}`}
                  >
                    P{phase.num}: {phase.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="meeting-hud-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {tabSwitches > 0 ? (
                <span className="proctor-hud-pill danger" title={`${tabSwitches} window blur/tab switches recorded`}>
                  <EyeOff size={12} /> {tabSwitches} FOCUS ALERT{tabSwitches > 1 ? 'S' : ''}
                </span>
              ) : (
                <span className="proctor-hud-pill safe" title="Active window tracking: Verified">
                  <ShieldCheck size={12} /> FOCUS VERIFIED
                </span>
              )}
            </div>
          </div>

          {/* Proctoring Integrity Alert Toast */}
          {proctorToast && (
            <div className="proctor-alert-toast">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={15} />
                <span>{proctorToast}</span>
              </div>
              <button type="button" onClick={() => setProctorToast(null)}>Dismiss</button>
            </div>
          )}

          {/* Voice Split-Screen Grid */}
          <div className="meet-split-grid">
            {/* Tile 1 (Left 50%): Photorealistic Video Avatar or Audio-Reactive Voice Orb Visualizer */}
            <div className="meet-video-tile avatar-tile-meet">
              {visualMode === 'avatar' ? (
                <HumanInterviewerAvatar
                  state={interviewerState}
                  subtitles={subtitles ? (conversationalFiller || latestPanel) : undefined}
                  interviewerName="Alex Rivera"
                  companyName={context.company || activeCompany.name}
                  roleTitle="Staff Software Engineer"
                  onInterrupt={interruptAlex}
                />
              ) : (
                <VoiceOrbVisualizer
                  state={interviewerState}
                  subtitles={subtitles ? (conversationalFiller || latestPanel) : undefined}
                  interviewerName="Alex Rivera"
                  companyName={context.company || activeCompany.name}
                  roleTitle="Staff Software Engineer"
                />
              )}

              <div className="meet-phase-indicator">
                {currentPhase.label.toUpperCase()}
              </div>
            </div>

            {/* Tile 2 (Right 50%): Candidate Live Webcam Feed */}
            <div className="meet-video-tile candidate-tile-meet">
              {/* Real-time Candidate Speech Telemetry HUD */}
              <div className="candidate-telemetry-hud">
                <div className="telemetry-pill" title="Live Speaking Pace">
                  <Zap size={11} color="#60a5fa" />
                  <span>
                    PACE: <b>{speechStats.pace > 0 ? `${speechStats.pace} WPM` : '140 WPM'}</b>
                    <small style={{ marginLeft: 3, color: speechStats.pace > 170 ? '#f87171' : speechStats.pace < 115 && speechStats.words > 10 ? '#facc15' : '#4ade80' }}>
                      {speechStats.pace > 170 ? '(Fast)' : speechStats.pace < 115 && speechStats.words > 10 ? '(Slow)' : '(Optimal)'}
                    </small>
                  </span>
                </div>
                <div className="telemetry-pill" title="Detected filler words (um, like, basically...)">
                  <span>FILLERS: <b>{speechStats.fillers}</b></span>
                </div>
              </div>

              {camera ? (
                <video ref={cameraPreviewRef} className="candidate-live-video" muted playsInline autoPlay />
              ) : (
                <div className="candidate-off-placeholder">
                  <div className="avatar-circle">YOU</div>
                  <b>Camera Inactive</b>
                  <button className="lobby-btn" onClick={() => void startCamera()}>
                    <Video size={14} /> Turn on Camera
                  </button>
                </div>
              )}

              {/* Live Interim Speech Transcription HUD */}
              {interimTranscript && (
                <div className="candidate-live-speech-hud">
                  <div className="live-speech-status">
                    <span className="live-speech-wave-dot" />
                    <small>TRANSCRIBING YOUR SPEECH IN REAL-TIME...</small>
                  </div>
                  <p>"{interimTranscript}"</p>
                  <button
                    type="button"
                    className="live-speech-done-btn"
                    onClick={() => {
                      const text = (speechBufferRef.current + ' ' + interimTranscript).trim();
                      if (text.length > 5) {
                        speechBufferRef.current = '';
                        setInterimTranscript('');
                        commitAnswer(text);
                      }
                    }}
                  >
                    Done Speaking ⏎
                  </button>
                </div>
              )}

              <div className="tile-name-tag">
                {mic ? <Mic size={13} color="#4ade80" /> : <MicOff size={13} color="#ef4444" />}
                You (Candidate) • {context.role || 'SDE-1'}
              </div>

              <div className="tile-status-icon">
                <LiveMeter active={mic} />
              </div>
            </div>
          </div>

          {/* Optional Collapsible Technical Scratchpad (Phase 3 on-demand) */}
          {showScratchpad && (
            <div className="scratchpad-panel-meet">
              <div className="scratchpad-header-bar">
                <div className="scratchpad-title-tag">
                  <Code2 size={16} />
                  <span>TECHNICAL SCRATCHPAD &amp; ARCHITECTURE NOTES</span>
                </div>
                <div className="ide-tool-group">
                  <select className="ide-select" value={language} onChange={e => handleLanguageChange(e.target.value as CodeLanguage)}>
                    <option value="python">Python 3</option>
                    <option value="js">JavaScript (Node.js)</option>
                    <option value="cpp">C++17</option>
                    <option value="java">Java 17</option>
                  </select>
                  <button className="ghost-button" style={{ color: '#e2e8f0', padding: '6px 12px', fontSize: 11 }} onClick={() => setCode(starterCodeTemplates[language])}>
                    Reset
                  </button>
                  <button className="ide-run-btn" onClick={() => void runLiveCode()} disabled={runningCode}>
                    <Play size={13} fill="currentColor" /> {runningCode ? 'Running...' : 'Run Code'}
                  </button>
                </div>
              </div>

              {/* System Architecture Blocks Toolbar */}
              <div className="architecture-blocks-bar">
                <span className="arch-bar-label"><Layers size={13} /> ARCHITECTURE BLOCKS:</span>
                <button type="button" onClick={() => insertArchitectureBlock('gateway')}>+ API Gateway</button>
                <button type="button" onClick={() => insertArchitectureBlock('queue')}>+ Kafka Queue</button>
                <button type="button" onClick={() => insertArchitectureBlock('cache')}>+ Redis Cache</button>
                <button type="button" onClick={() => insertArchitectureBlock('database')}>+ Sharded DB</button>
                <button type="button" onClick={() => insertArchitectureBlock('microservice')}>+ Worker</button>
                <button type="button" onClick={() => insertArchitectureBlock('loadbalancer')}>+ Load Balancer</button>
              </div>

              {/* Interactive System Architecture Canvas */}
              {archNodes.length > 0 && (
                <div className="architecture-visual-canvas">
                  <div className="arch-canvas-header">
                    <span>LIVE SYSTEM TOPOLOGY MAP ({archNodes.length} NODES)</span>
                    <span>AGGREGATE SYSTEM LATENCY: ~{Math.max(...archNodes.map(n => parseFloat(n.latency) || 1)).toFixed(1)}ms</span>
                  </div>
                  <div className="arch-nodes-grid">
                    {archNodes.map(node => (
                      <div key={node.id} className="arch-system-node">
                        <div className="arch-node-top">
                          <span>{node.name}</span>
                          <button
                            type="button"
                            className="arch-node-remove"
                            title="Remove node"
                            onClick={() => setArchNodes(nodes => nodes.filter(n => n.id !== node.id))}
                          >
                            ×
                          </button>
                        </div>
                        <div className="arch-node-metric">
                          ⚡ {node.latency} • 📊 {node.throughput}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="scratchpad-editor-wrapper">
                <textarea
                  className="scratchpad-code-textarea"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onPaste={e => {
                    const pasted = e.clipboardData?.getData('text') || '';
                    if (pasted.length > 100) {
                      setPasteEvents(p => p + 1);
                    }
                  }}
                  spellCheck={false}
                  placeholder="// Optional scratchpad. Talk through your system design or algorithm aloud with Alex..."
                />
                {codeOutput && (
                  <div className="scratchpad-console-box">
                    <div className="scratchpad-console-head">
                      <span>CONSOLE OUTPUT</span>
                      <span>STATUS: {runningCode ? 'EXECUTING...' : 'FINISHED'}</span>
                    </div>
                    <pre className="scratchpad-console-out">{codeOutput}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meeting Controls Bar */}
          <div className="call-control-dock">
            <div className="control-group-left">
              <button className={`call-action-btn ${mic ? 'hot-mic' : ''}`} onClick={mic ? stopMic : () => void startMic()} title={mic ? 'Mute Mic' : 'Unmute Mic'}>
                {mic ? <Mic size={18} /> : <MicOff size={18} />}
                <span>{mic ? 'Mute' : 'Unmute'}</span>
              </button>
              <button className={`call-action-btn ${camera ? 'active' : ''}`} onClick={camera ? stopCamera : () => void startCamera()} title="Toggle Camera">
                {camera ? <Video size={18} /> : <VideoOff size={18} />}
                <span>{camera ? 'Stop Cam' : 'Start Cam'}</span>
              </button>
            </div>

            <div className="control-group-center">
              <button
                className={`call-action-btn ${visualMode === 'avatar' ? 'active' : ''}`}
                onClick={() => setVisualMode(m => m === 'avatar' ? 'orb' : 'avatar')}
                title="Switch between Photorealistic Video Feed and Voice Orb"
              >
                {visualMode === 'avatar' ? <Video size={18} /> : <Sparkles size={18} />}
                <span>{visualMode === 'avatar' ? 'Avatar HD' : 'Voice Orb'}</span>
              </button>
              <button className={`call-action-btn ${voice ? 'active' : ''}`} onClick={() => { setVoice(v => !v); if (voice) window.speechSynthesis?.cancel(); }} title="Interviewer Voice">
                {voice ? <Volume2 size={18} /> : <VolumeX size={18} />}
                <span>Voice {voice ? 'ON' : 'OFF'}</span>
              </button>
              <button className={`call-action-btn ${subtitles ? 'active' : ''}`} onClick={() => setSubtitles(s => !s)} title="Captions HUD">
                <MessageCircle size={18} />
                <span>Captions</span>
              </button>
              <button className={`call-action-btn ${drawerOpen ? 'active' : ''}`} onClick={() => setDrawerOpen(d => !d)} title="STAR Coach">
                <BookOpen size={18} />
                <span>Coach</span>
              </button>
              <button className={`call-action-btn ${showScratchpad ? 'active' : ''}`} onClick={() => setShowScratchpad(s => !s)} title="Toggle Technical Scratchpad">
                <Code2 size={18} />
                <span>Scratchpad</span>
              </button>
            </div>

            <div className="control-group-right">
              <button className="call-action-btn end-call-btn" onClick={() => setShowEndCallConfirm(true)}>
                <Square size={14} /> End Call
              </button>
            </div>
          </div>

          {/* Quick In-Call Prompts & Barge-In Interrupt Bar */}
          <div className="incall-quick-actions">
            {isSpeakingTts && (
              <button type="button" className="quick-action-btn interrupt" onClick={interruptAlex} title="Interrupt Alex and speak">
                <Hand size={13} /> ✋ INTERRUPT ALEX
              </button>
            )}
            <button
              type="button"
              className="quick-action-btn"
              onClick={() => commitAnswer("Could you clarify the scale, expected throughput, and latency constraints for this system?")}
              disabled={thinking}
            >
              <HelpCircle size={13} /> 💡 Clarify Constraints
            </button>
            <button
              type="button"
              className="quick-action-btn"
              onClick={() => commitAnswer("Could you give me a small directional hint on the optimal architecture or data structure trade-off for this scenario?")}
              disabled={thinking}
            >
              <Lightbulb size={13} /> 🎯 Request Hint
            </button>
            <button
              type="button"
              className="quick-action-btn"
              onClick={() => setShowScratchpad(true)}
            >
              <Code2 size={13} /> 📐 Open Scratchpad
            </button>
            <button
              type="button"
              className="quick-action-btn"
              onClick={() => commitAnswer("Let me walk you through the key time versus space trade-offs and bottleneck mitigations for this design.")}
              disabled={thinking}
            >
              <Zap size={13} /> ⚡ Explain Trade-offs
            </button>
            <button
              type="button"
              className="quick-action-btn"
              onClick={() => commitAnswer("Let me validate this solution with a couple of edge cases: empty input, maximum threshold scale, and network partition timeouts.")}
              disabled={thinking}
            >
              <CheckCircle2 size={13} /> 🧪 Edge Cases &amp; Tests
            </button>

            {/* Phase 5 Candidate Q&A Action Chips */}
            {currentPhase.number === 5 && (
              <>
                <button
                  type="button"
                  className="quick-action-btn highlight"
                  onClick={() => commitAnswer(`Could you share more about the engineering culture, developer autonomy, and deployment rituals on the team at ${context.company || 'your company'}?`)}
                  disabled={thinking}
                >
                  <HelpCircle size={13} /> ❓ Ask About Culture &amp; Autonomy
                </button>
                <button
                  type="button"
                  className="quick-action-btn highlight"
                  onClick={() => commitAnswer(`What does the CI/CD pipeline and release cadence look like for services running in production at ${context.company || 'your company'}?`)}
                  disabled={thinking}
                >
                  <Zap size={13} /> ❓ Ask About Deployments &amp; CI/CD
                </button>
                <button
                  type="button"
                  className="quick-action-btn highlight"
                  onClick={() => commitAnswer(`How does the team balance new feature velocity with technical debt and on-call operational load at ${context.company || 'your company'}?`)}
                  disabled={thinking}
                >
                  <ShieldCheck size={13} /> ❓ Ask About On-Call &amp; Tech Debt
                </button>
              </>
            )}
          </div>

          {/* Live In-call Explanation & Answer Bar */}
          <div className="incall-response-bar">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Speak with microphone, or type your response to Alex and press Enter..."
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitText();
                }
              }}
              disabled={thinking}
            />
            <button onClick={submitText} disabled={thinking || !input.trim()}>
              <Send size={15} /> Send Answer
            </button>
          </div>

          {/* End Call Confirmation Modal */}
          {showEndCallConfirm && (
            <div className="end-call-confirm-overlay" onClick={() => setShowEndCallConfirm(false)}>
              <div className="end-call-confirm-modal" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <ShieldCheck size={22} color="#6e54f6" />
                  <h3 style={{ margin: 0 }}>End Interview &amp; Generate Debrief Report?</h3>
                </div>
                <p>
                  Alex has observed your technical responses across all 5 dimensions (Architecture, Algorithmic Depth, Trade-offs, Edge-case Rigor, and Communication). Ending now will analyze your entire transcript to produce a 100% personalized debrief report.
                </p>
                <div className="end-call-confirm-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowEndCallConfirm(false)}>
                    Resume Call
                  </button>
                  <button
                    type="button"
                    className="btn-confirm"
                    onClick={() => {
                      stopMic();
                      stopCamera();
                      setShowEndCallConfirm(false);
                      setReport(true);
                    }}
                  >
                    End Call &amp; View Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Side Drawer: Rolling Transcript & STAR Coach */}
      {drawerOpen && (
        <div className="side-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="side-drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Live Coaching &amp; Transcript</h3>
              <button className="close-modal" style={{ position: 'static' }} onClick={() => setDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="drawer-body">
              {/* STAR Answer Coach */}
              <aside className="tactics" style={{ border: '1px solid var(--ink)' }}>
                <div className="panel-label">
                  <span>/// REAL-TIME ANSWER COACH</span>
                  <span>STAR FRAMEWORK</span>
                </div>
                <div className="coach-summary">
                  <b>{interviewCoach.headline}</b>
                  <p>{interviewCoach.note}</p>
                </div>
                <div className="coach-starter">
                  <span>RECOMMENDED STRUCTURE</span>
                  <p>{interviewCoach.starter}</p>
                </div>
                {interviewCoach.checks.map((check, index) => (
                  <div key={check.label} className={`tactic ${check.value === 'GOOD' ? 'green' : check.value === 'ADD THIS' ? 'yellow' : 'red'}`}>
                    <i>0{index + 1}</i>
                    <p>
                      <b>{check.label}</b>
                      <span>{check.value}</span>
                      <small>{check.detail}</small>
                    </p>
                  </div>
                ))}
              </aside>

              {/* Rolling Transcript Messages */}
              <div className="transcript-panel" style={{ border: '1px solid var(--ink)' }}>
                <div className="panel-label">
                  <span>/// FULL ROLLING TRANSCRIPT</span>
                  <span>{messages.length} TURNS</span>
                </div>
                <div className="messages" style={{ maxHeight: 320, overflow: 'auto', padding: 14 }}>
                  {messages.map(m => (
                    <article className={`message ${m.speaker === 'PANEL' ? 'panel-msg' : 'you-msg'}`} key={m.id}>
                      <div className="message-tag">
                        {m.speaker === 'PANEL' ? 'ALEX (INTERVIEWER)' : 'YOU (CANDIDATE)'}
                        <small>{m.time}</small>
                      </div>
                      <p>{m.text}</p>
                    </article>
                  ))}
                  {thinking && (
                    <article className="message panel-msg pending">
                      <div className="message-tag">ALEX (INTERVIEWER)</div>
                      <p>Analyzing code &amp; formulating follow-up...</p>
                    </article>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Post-Interview Feedback & Debrief Modal */}
      {report && (
        <Report
          messages={messages}
          context={context}
          speechStats={speechStats}
          proctorData={{ tabSwitches, pasteEvents }}
          close={() => {
            setReport(false);
            setStarted(false);
          }}
        />
      )}
    </main>
  );
}
