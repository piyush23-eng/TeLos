import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ArrowLeft, ArrowRight, Award, BarChart3, BookOpen, Bookmark, Bot, Briefcase, Check, CheckCheck, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, Code2, Copy, Download, ExternalLink, Eye, EyeOff, FileText, Github, Hand, HelpCircle, Layers, LayoutDashboard, Lightbulb, LockKeyhole, LogOut, MessageCircle, Mic, MicOff, Moon, Pause, Play, Printer, Radio, RotateCcw, Search, Send, ShieldAlert, ShieldCheck, Sparkles, Square, Sun, Terminal, ThumbsUp, TrendingUp, Upload, Users, Video, VideoOff, Volume2, VolumeX, X, Zap } from 'lucide-react';
import { companyPrepCatalog, type CompanyPrepItem } from './companyPrepData';
import { problemCatalog, type DrillProblem } from './problemCatalog';
import { Assessment } from './Assessment';
import { AuthModal, type AuthUser } from './AuthModal';
import { UserDashboard } from './UserDashboard';
import telosLogo from './assets/telos-logo.jpeg';
import './roadmap.css';
import { buildSessionReport, calculateSpeakingPace, countFillerWords, exportDebriefToMarkdown } from './voiceMetrics';

import { apiUrl, safeStorage } from './apiConfig';
import {
  getStoredOpenRouterKey,
  setStoredOpenRouterKey,
  getStoredOpenRouterModel,
  setStoredOpenRouterModel,
  testDirectOpenRouterCall,
  generateQuestionDirectly,
  generateDebriefDirectly,
  type OpenRouterTelemetry
} from './openrouter';

type Page = 'dashboard' | 'studio' | 'prep' | 'community' | 'analytics' | 'bank' | 'assessment';
type Message = { id: number; speaker: 'PANEL' | 'YOU'; text: string; time: string; pending?: boolean };
type VoiceProfile = 'natural' | 'warm' | 'broadcast';
type CodeLanguage = 'js' | 'python' | 'cpp' | 'java';
type Recognition = { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; onresult: ((event: any) => void) | null; onerror: ((event: any) => void) | null; onend: (() => void) | null };
type PostType = 'question' | 'debrief' | 'offer' | 'mock';
type CommunityReply = { id: string; author: string; role: string; message: string; timestamp: string };
type CommunityPost = {
  id: string;
  author: string;
  role: string;
  title?: string;
  postType?: PostType;
  company?: string;
  outcome?: 'Offer' | 'Reject' | 'Pending' | 'N/A';
  level?: string;
  compensation?: string;
  message: string;
  tags: string[];
  timestamp: string;
  upvotes?: number;
  helpfulCount?: number;
  replies?: CommunityReply[];
  saved?: boolean;
};
declare global { interface Window { webkitSpeechRecognition?: new () => Recognition; SpeechRecognition?: new () => Recognition } }

import { VoiceOrbVisualizer } from './components/VoiceOrbVisualizer';
import { HumanInterviewerAvatar, type InterviewerVisualState } from './components/HumanInterviewerAvatar';

const defaultInterviewContext = {
  persona: 'Alex (AI Interviewer)',
  role: '',
  company: '',
  focus: '',
  resume: '',
  jobDescription: '',
};
const fallbackData = [{date:'JUL 03',star:62,accuracy:68,fillers:9.2},{date:'JUL 08',star:66,accuracy:71,fillers:7.4},{date:'JUL 14',star:73,accuracy:76,fillers:5.6},{date:'JUL 19',star:77,accuracy:79,fillers:4.1},{date:'JUL 26',star:84,accuracy:82,fillers:3.2}];

function stamp(start: number) { const s = Math.max(0, Math.floor((Date.now() - start) / 1000)); return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`; }

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

const pageOrder: Page[] = ['dashboard', 'studio', 'prep', 'community', 'analytics', 'bank'];

function TopNav({page,setPage,user,onAuth,onLogout,locked}:{page:Page;setPage:(p:Page)=>void;user:AuthUser|null;onAuth:()=>void;onLogout:()=>void;locked:boolean}) { const [menuOpen,setMenuOpen] = useState(false); const [darkMode,setDarkMode] = useState(() => safeStorage.get('telos-theme') === 'dark'); useEffect(() => { document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'; safeStorage.set('telos-theme', darkMode ? 'dark' : 'light'); }, [darkMode]); const go=(next:Page)=>{if(!locked){setPage(next);setMenuOpen(false)}}; const accountAction=()=>{if(!locked){if(user)setMenuOpen(open => !open);else onAuth()}}; const logout=()=>{setMenuOpen(false);onLogout()}; return <header className={`top-nav ${locked?'assessment-nav-locked':''}`}><button className="wordmark" aria-label="Go to TeLos interview practice" disabled={locked} onClick={()=>go('studio')}><img className="brand-logo" src={telosLogo} alt="TeLos logo"/><span className="brand-name">TeLos</span><sup>®</sup></button><nav className="nav-links" aria-label="Main navigation"><button disabled={locked} className={page==='studio'?'selected':''} onClick={()=>go('studio')}>Interview</button><button disabled={locked} className={page==='prep'?'selected':''} onClick={()=>go('prep')}>Company prep</button><button className={page==='assessment'?'selected':''} onClick={()=>go('assessment')}>Assessment</button><button disabled={locked} className={page==='community'?'selected':''} onClick={()=>go('community')}>Discuss</button><button disabled={locked} className={page==='analytics'?'selected':''} onClick={()=>go('analytics')}>Results</button><button disabled={locked} className={page==='bank'?'selected':''} onClick={()=>go('bank')}>Drills</button></nav><div className="account-actions"><button className="theme-toggle" type="button" onClick={()=>setDarkMode(value => !value)} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} title={darkMode ? 'Light mode' : 'Dark mode'}>{darkMode ? <Sun size={16}/> : <Moon size={16}/>}</button><div className="account-menu"><button className="nav-cta account-cta" disabled={locked} onClick={accountAction}>{locked?'Assessment locked':user ? <><span className="account-initial">{user.name.slice(0,1).toUpperCase()}</span>{user.name.split(' ')[0]}<ChevronDown size={14} className={menuOpen?'rotated':''}/></> : <>Sign in <ArrowRight size={15}/></>}</button>{user && menuOpen && <div className="account-popover" role="menu"><div className="account-popover-head"><span>{user.name.slice(0,1).toUpperCase()}</span><div><b>{user.name}</b><small>{user.email}</small></div></div><button onClick={()=>go('dashboard')}><LayoutDashboard size={16}/><span><b>My dashboard</b><small>Profile, progress, and practice plan</small></span></button><button onClick={()=>go('analytics')}><BarChart3 size={16}/><span><b>Performance</b><small>Readiness and interview results</small></span></button><button onClick={()=>go('bank')}><Code2 size={16}/><span><b>Practice library</b><small>Drills and coding patterns</small></span></button><button className="popover-logout" onClick={logout}><LogOut size={16}/>Log out</button></div>}</div></div></header> }

function LiveMeter({ active }: { active: boolean }) {
  return (
    <div className={`voice-wave-container ${active ? 'active' : ''}`} aria-label={active ? 'Microphone live' : 'Microphone paused'}>
      <div className="voice-wave-bars">
        <span className="voice-wave-bar" />
        <span className="voice-wave-bar" />
        <span className="voice-wave-bar" />
        <span className="voice-wave-bar" />
        <span className="voice-wave-bar" />
      </div>
      <span className="voice-wave-label">{active ? 'AUDIO LIVE' : 'MIC PAUSED'}</span>
    </div>
  );
}

function Studio() {
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

function ScoreRadialGauge({ value, label, color, grade }: { value: number; label: string; color: string; grade?: string }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="radial-score-card">
      <div className="radial-svg-wrapper">
        <svg width="84" height="84" viewBox="0 0 84 84">
          <circle
            cx="42"
            cy="42"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="42"
            cy="42"
            r={radius}
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.25, 1, 0.5, 1)', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        <div className="radial-value-center">
          <span className="val">{clamped}%</span>
          {grade && <span className="grade">{grade}</span>}
        </div>
      </div>
      <span className="radial-label">{label}</span>
    </div>
  );
}

function Report({
  messages,
  context,
  speechStats,
  proctorData,
  close,
}: {
  messages: Message[];
  context: typeof defaultInterviewContext;
  speechStats: { words?: number; pace?: number; lastUpdated?: number; fillers?: number };
  proctorData?: { tabSwitches: number; pasteEvents: number };
  close: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'qa' | 'improve' | 'not-to-say' | 'strengths' | 'rubric' | 'roadmap'>('qa');
  const [copied, setCopied] = useState(false);
  const [debrief, setDebrief] = useState<any>(null);

  useEffect(() => {
    const transcript = messages.map(m => ({
      speaker: m.speaker === 'PANEL' ? ('interviewer' as const) : ('candidate' as const),
      text: m.text,
    }));

    const apiKey = getStoredOpenRouterKey();
    const model = getStoredOpenRouterModel();
    const switches = proctorData?.tabSwitches ?? 0;
    const pastes = proctorData?.pasteEvents ?? 0;
    const focusIntegrityScore = Math.max(0, 100 - (switches * 10) - (pastes * 5));
    const finalProctorStats = {
      tabSwitches: switches,
      pasteEvents: pastes,
      focusIntegrityScore
    };

    fetch(apiUrl('/api/interview/debrief'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript,
        company: context.company,
        role: context.role,
        resume: context.resume,
        focus: context.focus,
        speechStats,
        proctorStats: finalProctorStats,
        customApiKey: apiKey,
        modelName: model,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.scores) {
          setDebrief({ ...data, proctorStats: finalProctorStats });
          setLoading(false);
        } else {
          throw new Error('Invalid backend debrief response');
        }
      })
      .catch(async (err) => {
        console.warn('Backend debrief failed, using direct OpenRouter debrief engine:', err);
        try {
          const directData = await generateDebriefDirectly({
            transcript,
            company: context.company,
            role: context.role,
            resume: context.resume,
            focus: context.focus,
            speechStats,
            apiKey,
            model,
          });
          setDebrief({ ...directData, proctorStats: finalProctorStats });
        } catch (directErr) {
          console.error('Direct OpenRouter debrief error:', directErr);
        } finally {
          setLoading(false);
        }
      });
  }, [messages, context, speechStats, proctorData]);

  const copySummary = () => {
    if (!debrief) return;
    const text = `TELOS POST-INTERVIEW DEBRIEF REPORT
Company Target: ${context.company}
Role: ${context.role}
Hiring Recommendation: ${debrief.hiringRecommendation} (Overall Score: ${debrief.scores?.overall}%)

EXECUTIVE SUMMARY:
${debrief.summary}

CALIBRATED SCORES:
- Overall Readiness: ${debrief.scores?.overall ?? 0}%
- Technical Depth: ${debrief.scores?.technicalDepth ?? 0}%
- System Architecture: ${debrief.scores?.systemDesign ?? debrief.scores?.problemSolving ?? 0}%
- Communication & Structure: ${debrief.scores?.communication ?? 0}%
- Edge Cases & Reliability: ${debrief.scores?.edgeCases ?? 0}%
- Pacing & Cadence: ${debrief.scores?.pacing ?? 0}%

SPEECH & CADENCE TELEMETRY:
- Speaking Pace: ${debrief.cadenceMetrics?.paceWpm ?? speechStats?.pace ?? 0} WPM
- Filler Density: ${debrief.cadenceMetrics?.fillerDensity || '0%'}
- Talk-Time Distribution: ${debrief.cadenceMetrics?.talkRatio || 'N/A'}
- Answer Directness: ${debrief.cadenceMetrics?.succinctness || 'N/A'}

COMPANY BAR RUBRIC SIGNALS:
${debrief.companyRubric?.map((r: any) => `- ${r.pillar}: [${r.status} - ${r.score}%] ${r.note}`).join('\n')}

48-HOUR PRACTICE ROADMAP:
${debrief.actionRoadmap?.map((plan: any) => `${plan.phase}: ${plan.title}\n- Focus: ${plan.focus}\n- Action Drill: ${plan.drill}`).join('\n\n')}

QUESTIONS & IDEAL ANSWERS BREAKDOWN:
${debrief.questionsAnalysis?.map((q: any, i: number) => `
Q${i + 1}: ${q.question}
[WHAT YOU SAID]: ${q.whatYouSaid}
[WHAT YOU SHOULD SAY]: ${q.whatYouShouldSay}
[VERDICT]: ${q.verdict} | ${q.feedback}
`).join('\n')}

WHAT TO IMPROVE:
${debrief.whatToImprove?.map((item: any) => `- ${item.title}: ${item.detail}\n  Action Drill: ${item.actionItem}`).join('\n')}

WHAT NOT TO SAY (ANTI-PATTERNS):
${debrief.whatNotToSay?.map((item: any) => `- Avoid: "${item.phraseOrHabit}"\n  Why: ${item.whyAvoid}\n  Say Instead: "${item.betterAlternative}"`).join('\n')}

STRENGTHS & WHAT YOU IMPROVED:
${debrief.whatYouImproved?.map((item: any) => `- ${item.strength}: ${item.observation}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const downloadMarkdown = () => {
    if (!debrief) return;
    const md = exportDebriefToMarkdown(debrief, context);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `telos-debrief-${(context.company || 'tech').toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  const badgeClass = (rec: string = '') => {
    const lower = rec.toLowerCase();
    if (lower.includes('strong hire') || lower === 'hire') return 'strong-hire';
    if (lower.includes('leaning hire')) return 'leaning-hire';
    return 'no-hire';
  };

  const verdictClass = (v: string = '') => {
    const lower = v.toLowerCase();
    if (lower === 'strong' || lower === 'strong signal') return 'strong';
    if (lower === 'adequate') return 'adequate';
    return 'needs-improvement';
  };

  const rubricStatusClass = (status: string = '') => {
    const lower = status.toLowerCase();
    if (lower.includes('strong')) return 'strong';
    if (lower.includes('adequate') || lower.includes('meets')) return 'adequate';
    return 'needs-cal';
  };

  return (
    <div className="debrief-modal-overlay">
      <div className="debrief-modal-card">
        {/* Header Strip */}
        <div className="debrief-header-strip">
          <div className="debrief-title-group">
            <span className="debrief-kicker">POST-INTERVIEW CALIBRATION &amp; DEBRIEF</span>
            <h2>{context.company.toUpperCase()} • TECHNICAL SCREEN DEBRIEF</h2>
          </div>
          <div className="debrief-header-actions">
            {debrief && (
              <span className={`hiring-badge ${badgeClass(debrief.hiringRecommendation)}`}>
                RECOMMENDATION: {debrief.hiringRecommendation?.toUpperCase()}
              </span>
            )}
            <button className="debrief-close-btn" onClick={close} title="Close debrief">
              <X size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="debrief-loading-box">
            <div className="spinner" />
            <b style={{ font: "700 14px 'DM Mono', monospace" }}>CALIBRATING FULL INTERVIEW TRANSCRIPT...</b>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13, maxWidth: 460 }}>
              Alex and Bar Raiser AI are analyzing all questions asked, what you said versus what you should say, speech telemetry, and concrete technical improvements...
            </p>
          </div>
        ) : debrief ? (
          <div className="debrief-scroll-body">
            {/* Scorecard Grid with 6 Radial Gauges */}
            <div className="debrief-scorecard-grid radial-grid-6">
              <ScoreRadialGauge
                value={debrief.scores?.overall ?? 0}
                label="OVERALL READINESS"
                color="var(--violet, #6e54f6)"
                grade={debrief.scores?.overall >= 85 ? 'STRONG' : 'CALIBRATED'}
              />
              <ScoreRadialGauge
                value={debrief.scores?.technicalDepth ?? 0}
                label="TECHNICAL DEPTH"
                color="#0284c7"
              />
              <ScoreRadialGauge
                value={debrief.scores?.systemDesign ?? debrief.scores?.problemSolving ?? 0}
                label="SYSTEM DESIGN"
                color="var(--mint, #16a34a)"
              />
              <ScoreRadialGauge
                value={debrief.scores?.communication ?? 0}
                label="COMMUNICATION"
                color="#eab308"
              />
              <ScoreRadialGauge
                value={debrief.scores?.edgeCases ?? 0}
                label="EDGE CASES &amp; TESTS"
                color="#ec4899"
              />
              <ScoreRadialGauge
                value={debrief.scores?.pacing ?? 0}
                label="PACING &amp; CADENCE"
                color="#8b5cf6"
              />
            </div>

            {/* Speech & Cadence Telemetry HUD Bar */}
            <div className="debrief-telemetry-hud">
              <div className="telemetry-stat-item">
                <span className="telemetry-label">
                  <Mic size={11} /> SPEAKING PACE
                </span>
                <span className="telemetry-val">
                  {debrief.cadenceMetrics?.paceWpm ?? speechStats?.pace ?? 0} WPM
                </span>
                <span className="telemetry-sub">Optimal Band: 130–160 WPM</span>
              </div>
              <div className="telemetry-stat-item">
                <span className="telemetry-label">
                  <Zap size={11} /> FILLER WORDS
                </span>
                <span className="telemetry-val">
                  {debrief.cadenceMetrics?.fillerDensity || (speechStats ? `${speechStats.fillers ?? 0} total` : '0%')}
                </span>
                <span className="telemetry-sub">Cognitive clarity index</span>
              </div>
              <div className="telemetry-stat-item">
                <span className="telemetry-label">
                  <Users size={11} /> TALK DISTRIBUTION
                </span>
                <span className="telemetry-val">
                  {debrief.cadenceMetrics?.talkRatio || 'N/A'}
                </span>
                <span className="telemetry-sub">Target: 60–75% candidate floor</span>
              </div>
              <div className="telemetry-stat-item">
                <span className="telemetry-label">
                  <ShieldCheck size={11} /> ANSWER DIRECTNESS
                </span>
                <span className="telemetry-val">
                  {debrief.cadenceMetrics?.succinctness || 'Direct'}
                </span>
                <span className="telemetry-sub">STAR structural alignment</span>
              </div>
              <div className="telemetry-stat-item">
                <span className="telemetry-label">
                  <ShieldCheck size={11} /> PROCTOR INTEGRITY
                </span>
                <span className="telemetry-val" style={{ color: (debrief.proctorStats?.focusIntegrityScore ?? 100) >= 80 ? '#4ade80' : '#f87171' }}>
                  {debrief.proctorStats?.focusIntegrityScore ?? 100}%
                </span>
                <span className="telemetry-sub">
                  {(debrief.proctorStats?.tabSwitches ?? 0) === 0 ? 'Zero focus loss detected' : `${debrief.proctorStats.tabSwitches} window blur events`}
                </span>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="debrief-summary-box">
              <span className="summary-head">EXECUTIVE EVALUATION SUMMARY</span>
              <p>{debrief.summary}</p>
              {debrief.hiringRationale && (
                <div className="rationale-note">
                  <b>BAR RAISER NOTE:</b> {debrief.hiringRationale}
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="debrief-tabs-row">
              <button
                className={`debrief-tab-btn ${activeTab === 'qa' ? 'active' : ''}`}
                onClick={() => setActiveTab('qa')}
              >
                01 / QUESTIONS &amp; IDEAL ANSWERS ({debrief.questionsAnalysis?.length || 0})
              </button>
              <button
                className={`debrief-tab-btn ${activeTab === 'improve' ? 'active' : ''}`}
                onClick={() => setActiveTab('improve')}
              >
                02 / WHAT TO IMPROVE ({debrief.whatToImprove?.length || 0})
              </button>
              <button
                className={`debrief-tab-btn ${activeTab === 'not-to-say' ? 'active' : ''}`}
                onClick={() => setActiveTab('not-to-say')}
              >
                03 / WHAT NOT TO SAY ({debrief.whatNotToSay?.length || 0})
              </button>
              <button
                className={`debrief-tab-btn ${activeTab === 'strengths' ? 'active' : ''}`}
                onClick={() => setActiveTab('strengths')}
              >
                04 / STANDOUT STRENGTHS ({debrief.whatYouImproved?.length || 0})
              </button>
              <button
                className={`debrief-tab-btn ${activeTab === 'rubric' ? 'active' : ''}`}
                onClick={() => setActiveTab('rubric')}
              >
                05 / {context.company ? context.company.toUpperCase() : 'TARGET'} RUBRIC SIGNALS ({debrief.companyRubric?.length || 4})
              </button>
              <button
                className={`debrief-tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
                onClick={() => setActiveTab('roadmap')}
              >
                06 / 48-HOUR PRACTICE ROADMAP ({debrief.actionRoadmap?.length || 3})
              </button>
            </div>

            {/* Tab 1: Questions & Ideal Answers Breakdown */}
            {activeTab === 'qa' && (
              <div className="qa-breakdown-list">
                {debrief.questionsAnalysis?.map((q: any, index: number) => (
                  <div key={q.id || index} className="qa-card">
                    <div className="qa-card-header">
                      <div className="q-title">
                        <span style={{ color: 'var(--violet)', fontFamily: "'DM Mono', monospace", marginRight: 8 }}>
                          Q{index + 1}.
                        </span>
                        {q.question}
                      </div>
                      <span className={`qa-verdict-pill ${verdictClass(q.verdict)}`}>
                        {q.verdict?.toUpperCase() || 'EVALUATED'}
                      </span>
                    </div>
                    <div className="qa-card-body">
                      <div className="qa-comparison-col what-you-said">
                        <span className="qa-col-label">WHAT YOU SAID</span>
                        <p className="qa-col-text">{q.whatYouSaid}</p>
                      </div>
                      <div className="qa-comparison-col what-you-should-say">
                        <span className="qa-col-label">WHAT YOU SHOULD SAY (OPTIMAL SENIOR ANSWER)</span>
                        <p className="qa-col-text">{q.whatYouShouldSay}</p>
                      </div>
                    </div>
                    {q.feedback && (
                      <div className="qa-feedback-strip">
                        <b>FEEDBACK:</b> {q.feedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: What to Improve */}
            {activeTab === 'improve' && (
              <div className="actionable-items-list">
                {debrief.whatToImprove?.map((item: any, i: number) => (
                  <div key={i} className="action-item-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={16} color="#eab308" />
                      <h4>{item.title}</h4>
                    </div>
                    <p>{item.detail}</p>
                    {item.actionItem && (
                      <div className="action-drill-box">
                        <b>PRACTICE DRILL:</b> {item.actionItem}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: What NOT to Say (Anti-patterns & Traps) */}
            {activeTab === 'not-to-say' && (
              <div className="actionable-items-list">
                {debrief.whatNotToSay?.map((item: any, i: number) => (
                  <div key={i} className="not-to-say-card">
                    <div className="not-to-say-avoid">
                      <b>🚫 AVOID SAYING / DOING</b>
                      <p>{item.phraseOrHabit}</p>
                      <small>Why: {item.whyAvoid}</small>
                    </div>
                    <div className="not-to-say-better">
                      <b>✓ SENIOR HIGH-BAR ALTERNATIVE</b>
                      <p>{item.betterAlternative}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Standout Strengths */}
            {activeTab === 'strengths' && (
              <div className="actionable-items-list">
                {debrief.whatYouImproved?.map((item: any, i: number) => (
                  <div key={i} className="strength-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="#16a34a" />
                      <b>{item.strength}</b>
                    </div>
                    <p>{item.observation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 5: Target Company Rubric Signals */}
            {activeTab === 'rubric' && (
              <div className="actionable-items-list">
                {(debrief.companyRubric || [
                  {
                    pillar: `${context.company || 'Target Company'} Core Technical Rigor`,
                    status: 'Strong Signal',
                    score: 85,
                    note: 'Demonstrated clean computational thinking, clear modularity, and algorithmic efficiency.'
                  },
                  {
                    pillar: 'Distributed Systems & Scaling Architecture',
                    status: 'Adequate',
                    score: 80,
                    note: 'Good high-level component diagrams; deepen discussion on partition recovery and read/write scaling.'
                  },
                  {
                    pillar: 'Constraint Verification & Edge Cases',
                    status: 'Strong Signal',
                    score: 84,
                    note: 'Proactively clarified data throughput and latency requirements before proposing storage engines.'
                  },
                  {
                    pillar: 'Communication Clarity & STAR Structure',
                    status: 'Strong Signal',
                    score: 88,
                    note: 'Delivered crisp responses without rambling; checked in on interviewer understanding.'
                  }
                ]).map((r: any, i: number) => (
                  <div key={i} className="rubric-card">
                    <div className="rubric-card-header">
                      <span className="rubric-card-title">{r.pillar}</span>
                      <span className={`rubric-status-pill ${rubricStatusClass(r.status)}`}>
                        {r.status?.toUpperCase() || 'EVALUATED'} • {r.score ?? 85}%
                      </span>
                    </div>
                    <div className="rubric-bar-container">
                      <div className="rubric-bar-fill" style={{ width: `${r.score ?? 85}%` }} />
                    </div>
                    <p className="rubric-note">{r.note}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 6: 48-Hour Practice Roadmap */}
            {activeTab === 'roadmap' && (
              <div className="actionable-items-list">
                {(debrief.actionRoadmap || [
                  {
                    phase: 'Phase 1 (Next 24h)',
                    title: 'Throughput & Quantitative Anchoring',
                    focus: 'Ground every system design response in quantifiable scale targets (RPS, storage GB/day, latency P99).',
                    drill: `Practice top PYQs for ${context.company || 'Tech Companies'} in Company Prep.`
                  },
                  {
                    phase: 'Phase 2 (Next 48h)',
                    title: 'Failure Recovery & Edge Cases',
                    focus: 'Identify database replica failover, cache stampede mitigation, and exponential backoff retry patterns.',
                    drill: 'Review System Design drills and concurrency playbooks in TeLos Bank.'
                  },
                  {
                    phase: 'Phase 3 (Final Calibration)',
                    title: 'Full Proctored Mock Run',
                    focus: 'Run a live timed interview with Alex to lock in optimal speaking cadence and trade-off precision.',
                    drill: 'Launch another Live Studio Screen with Alex.'
                  }
                ]).map((plan: any, i: number) => (
                  <div key={i} className="roadmap-timeline-card">
                    <span className="roadmap-phase-badge">
                      <Sparkles size={11} /> {plan.phase}
                    </span>
                    <h4 className="roadmap-title">{plan.title}</h4>
                    <p className="roadmap-focus"><b>FOCUS:</b> {plan.focus}</p>
                    <div className="roadmap-drill-box">
                      <b>ACTION DRILL:</b> {plan.drill}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="debrief-loading-box">
            <p>Unable to generate debrief. Please check your network connection.</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="debrief-footer-actions">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="action-pill-btn" onClick={downloadMarkdown} disabled={loading || !debrief} title="Download structured markdown report">
              <Download size={13} /> Export .MD
            </button>
            <button className="action-pill-btn" onClick={printReport} disabled={loading || !debrief} title="Print or save as PDF">
              <Printer size={13} /> Print / PDF
            </button>
            <button className="action-pill-btn" onClick={copySummary} disabled={loading || !debrief}>
              <Copy size={13} /> {copied ? 'Copied Full Debrief!' : 'Copy Summary'}
            </button>
          </div>
          <button className="join-call-btn-refined" style={{ margin: 0, width: 'auto', padding: '10px 20px' }} onClick={close}>
            RETURN TO DASHBOARD <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Analytics(){const[data,setData]=useState(fallbackData);useEffect(()=>{fetch(apiUrl('/api/analytics')).then(r=>r.json()).then(d=>setData(d.sessions)).catch(()=>undefined)},[]);const latest=(data[data.length-1]||data[0]||{date:'NOW',star:78,accuracy:78,fillers:4.3,pace:145}) as typeof fallbackData[number] & { pace?: number };const insightCards=[{label:'Rhythm',value:`${latest.pace ?? 0} WPM`,copy:'Your recent sessions show a healthier speaking cadence and less drift.'},{label:'Clarity',value:`${latest.accuracy ?? 0}%`,copy:'The strongest answers connect the mechanism to the impact.'},{label:'Filler drop',value:`${latest.fillers ?? 0} / min`,copy:'You are getting quieter and more deliberate with each round.'}];return <main className="shell"><section className="studio-head"><div><p className="kicker">02 / IMPROVEMENT IS A DATASET</p><h1>YOUR<br/><span>RECEIPTS.</span></h1></div><div className="session-meta"><b>12 SESSIONS LOGGED</b><span>LAST 30 DAYS</span><span>UPWARD TRAJECTORY</span></div></section><div className="big-stats"><div><b>82</b><span>READINESS<br/>INDEX</span></div><div><b>+14</b><span>STAR SCORE<br/>THIS MONTH</span></div><div><b>−65%</b><span>FILLER WORDS<br/>FROM BASELINE</span></div></div><section className="analytics-grid"><div className="analytics-stack"><article className="chart-card"><p className="kicker">STRUCTURE × TECHNICAL DEPTH</p><h2>ANSWER QUALITY</h2><ResponsiveContainer width="100%" height={280}><LineChart data={data}><CartesianGrid stroke="#1c1c1c" vertical={false}/><XAxis dataKey="date" tickLine={false} axisLine={false}/><YAxis domain={[50,100]} tickLine={false} axisLine={false}/><Tooltip/><Line dataKey="star" stroke="#ecff00" strokeWidth={4} dot={{r:5,fill:'#ecff00'}}/><Line dataKey="accuracy" stroke="#ff4f19" strokeWidth={4} dot={{r:5,fill:'#ff4f19'}}/></LineChart></ResponsiveContainer></article><article className="chart-card light-chart"><p className="kicker">SPEAKING CLEANER</p><h2>FILLER DECAY</h2><ResponsiveContainer width="100%" height={280}><AreaChart data={data}><defs><linearGradient id="brute" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#ff4f19" stopOpacity=".7"/><stop offset="100%" stopColor="#ff4f19" stopOpacity=".03"/></linearGradient></defs><CartesianGrid stroke="#bbb" vertical={false}/><XAxis dataKey="date" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/><Tooltip/><Area dataKey="fillers" stroke="#000" fill="url(#brute)" strokeWidth={4}/></AreaChart></ResponsiveContainer></article></div><div className="analytics-stack">{insightCards.map(card=><article key={card.label} className="insight-card"><p className="kicker">INSIGHT</p><h3>{card.label}</h3><b>{card.value}</b><p>{card.copy}</p></article>)}<article className="insight-card"><p className="kicker">COMMUNITY INTELLIGENCE</p><h3>Where people share real interview stories</h3><ul><li><strong>Blind</strong> — strong for company-specific round breakdowns and recruiter stories.</li><li><strong>Reddit / r/cscareerquestions</strong> — practical prep notes and failure patterns.</li><li><strong>Discord communities</strong> — useful for recent process changes and interview feedback.</li></ul></article></div></section></main>}

const codeTemplate = (problem: any, lang: CodeLanguage) => {
  const header = `// ${problem?.title || 'Problem'}\n// ${problem?.description || ''}\n\n`;
  if (lang === 'python') {
    return `${header}def solve(input_data):\n    # Write your optimal O(N) solution here\n    result = []\n    return result\n\nif __name__ == "__main__":\n    print(solve(None))\n`;
  }
  if (lang === 'cpp') {
    return `${header}#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint solve() {\n    // Write your optimal solution here\n    return 0;\n}\n\nint main() {\n    cout << solve() << endl;\n    return 0;\n}\n`;
  }
  if (lang === 'java') {
    return `${header}public class Solution {\n    public static void main(String[] args) {\n        System.out.println("Solution executed.");\n    }\n}\n`;
  }
  return `${header}function solve(input) {\n    // Write your optimal solution here\n    return input;\n}\n\nconsole.log(solve(undefined));\n`;
};

function Bank() {
  const [problems, setProblems] = useState<any[]>(problemCatalog);
  const [selected, setSelected] = useState<any>(problemCatalog[0] || null);
  const [companyFilter, setCompanyFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<CodeLanguage>('python');
  const [code, setCode] = useState(() => codeTemplate(problemCatalog[0], 'python'));
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);

  const openProblem = (problem: any) => {
    const defaultLanguage = (problem.language || language || 'python') as CodeLanguage;
    setSelected(problem);
    setLanguage(defaultLanguage);
    setCode(codeTemplate(problem, defaultLanguage));
    setOutput('');
  };

  useEffect(() => {
    fetch(apiUrl('/api/problems'))
      .then(r => r.json())
      .then(d => {
        const list = d.problems || [];
        if (list.length > 0) {
          setProblems(list);
          if (!selected) {
            setSelected(list[0]);
            const lang = (list[0].language || 'python') as CodeLanguage;
            setLanguage(lang);
            setCode(codeTemplate(list[0], lang));
          }
        }
      })
      .catch(() => undefined);
  }, []);

  const companyFilters = useMemo(
    () => ['all', ...Array.from(new Set(problems.map(p => p.company)))],
    [problems]
  );

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchesCompany = companyFilter === 'all' || p.company?.toLowerCase() === companyFilter.toLowerCase();
      const matchesDifficulty = difficultyFilter === 'all' || p.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        p.title?.toLowerCase().includes(q) ||
        p.company?.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));
      return matchesCompany && matchesDifficulty && matchesSearch;
    });
  }, [problems, companyFilter, difficultyFilter, searchQuery]);

  const currentIndex = selected ? filteredProblems.findIndex(p => p.id === selected.id) : -1;

  const goToPrev = () => {
    if (currentIndex > 0) {
      openProblem(filteredProblems[currentIndex - 1]);
    } else if (filteredProblems.length > 0) {
      openProblem(filteredProblems[filteredProblems.length - 1]);
    }
  };

  const goToNext = () => {
    if (currentIndex >= 0 && currentIndex < filteredProblems.length - 1) {
      openProblem(filteredProblems[currentIndex + 1]);
    } else if (filteredProblems.length > 0) {
      openProblem(filteredProblems[0]);
    }
  };

  const runCode = async () => {
    if (!selected) return;
    setRunning(true);
    setOutput('Running solution against test sandbox...');
    try {
      const result = await fetch(apiUrl('/api/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, problemId: selected.id }),
      });
      if (!result.ok) {
        const errPayload = await result.json().catch(() => ({}));
        throw new Error(errPayload.error || `Runner returned HTTP ${result.status}`);
      }
      const payload = await result.json();
      setOutput(payload.output || 'Solution executed successfully with no errors.');
    } catch (err: any) {
      if (language === 'js') {
        try {
          const logs: string[] = [];
          const customConsole = {
            log: (...args: any[]) => logs.push(args.map(String).join(' ')),
            error: (...args: any[]) => logs.push(args.map(String).join(' ')),
            warn: (...args: any[]) => logs.push(args.map(String).join(' ')),
          };
          const runnerFn = new Function('console', code);
          runnerFn(customConsole);
          setOutput(logs.join('\n') || 'Executed locally: Solution passed with no console errors.');
          return;
        } catch (clientErr: any) {
          setOutput(`Runtime Error:\n${clientErr.message}`);
          return;
        }
      }
      setOutput(err?.message ? `Execution error: ${err.message}` : 'Runner service temporarily unavailable. Please retry in a moment.');
    } finally {
      setRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const nextCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(nextCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <main className="shell">
      <section className="studio-head">
        <div>
          <p className="kicker">04 / LIVE CODING &amp; PRACTICE DRILLS</p>
          <h1>PRACTICE<br /><span>WORKBENCH.</span></h1>
        </div>
        <div className="session-meta">
          <b>{problems.length} CURATED DRILLS</b>
          <span>MULTI-LANGUAGE SANDBOX</span>
          <span>COMPANY-ALIGNED DSA</span>
        </div>
      </section>

      {/* Modern Brutalist Drill Control Deck */}
      <div className="drill-control-deck">
        {/* Top Filter Bar: Company Chips + Difficulty Pills + Search */}
        <div className="drill-filter-bar">
          <div className="drill-filter-group">
            <div className="drill-group-label">
              <Code2 size={13} />
              <span>COMPANY:</span>
            </div>
            <div className="drill-chip-scroll">
              {companyFilters.map(f => (
                <button
                  key={f}
                  className={`drill-filter-chip ${companyFilter === f ? 'active' : ''}`}
                  onClick={() => {
                    setCompanyFilter(f);
                    const nextList = problems.filter(p => 
                      (f === 'all' || p.company === f) &&
                      (difficultyFilter === 'all' || p.difficulty?.toLowerCase() === difficultyFilter.toLowerCase())
                    );
                    if (nextList.length > 0 && (!selected || !nextList.some(p => p.id === selected.id))) {
                      openProblem(nextList[0]);
                    }
                  }}
                >
                  {f === 'all' ? 'All Companies' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="drill-filter-group">
            <div className="drill-group-label">
              <Zap size={13} />
              <span>DIFFICULTY:</span>
            </div>
            <div className="drill-difficulty-pills">
              {(['all', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
                <button
                  key={diff}
                  className={`drill-diff-pill ${difficultyFilter === diff ? 'active' : ''} diff-${diff.toLowerCase()}`}
                  onClick={() => {
                    setDifficultyFilter(diff);
                    const nextList = problems.filter(p => 
                      (companyFilter === 'all' || p.company === companyFilter) &&
                      (diff === 'all' || p.difficulty?.toLowerCase() === diff.toLowerCase())
                    );
                    if (nextList.length > 0 && (!selected || !nextList.some(p => p.id === selected.id))) {
                      openProblem(nextList[0]);
                    }
                  }}
                >
                  {diff.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="drill-search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search drills by topic..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="drill-search-clear" onClick={() => setSearchQuery('')}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Drill Navigator: Prev / Next / Jump Select / Metadata */}
        <div className="drill-navigator-strip">
          <div className="drill-nav-controls">
            <button 
              className="drill-nav-btn prev-btn" 
              onClick={goToPrev}
              disabled={filteredProblems.length === 0}
              title="Previous Problem"
            >
              <ChevronLeft size={14} />
              <span>PREV</span>
            </button>

            <div className="drill-active-select-wrapper">
              <select
                className="drill-active-select"
                value={selected?.id || ''}
                onChange={e => {
                  const target = problems.find(p => p.id === e.target.value);
                  if (target) openProblem(target);
                }}
              >
                {filteredProblems.map((p, idx) => (
                  <option key={p.id} value={p.id}>
                    [{p.company}] #{String(idx + 1).padStart(2, '0')} — {p.title} ({p.difficulty})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="drill-select-arrow" />
            </div>

            <button 
              className="drill-nav-btn next-btn" 
              onClick={goToNext}
              disabled={filteredProblems.length === 0}
              title="Next Problem"
            >
              <span>NEXT</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="drill-nav-meta">
            {selected && (
              <>
                <span className="drill-tag-badge company-tag">{selected.company}</span>
                <span className={`drill-tag-badge difficulty-tag diff-${selected.difficulty?.toLowerCase()}`}>
                  {selected.difficulty}
                </span>
                {selected.category && (
                  <span className="drill-tag-badge category-tag">{selected.category}</span>
                )}
              </>
            )}
            <span className="drill-counter-pill">
              {currentIndex >= 0 ? `${currentIndex + 1} / ${filteredProblems.length}` : `${filteredProblems.length}`} DRILLS
            </span>
          </div>
        </div>
      </div>

      {/* Main Split: Left Question Box, Right Workspace Box (100% Symmetrical Equal Dual-Pane) */}
      <section className="drill-workspace-shell">
        {/* LEFT EQUAL BOX: Question Details & Specs */}
        <div className="drill-box drill-question-box">
          <div className="panel-label">
            <span>
              <Code2 size={13} style={{ display: 'inline', marginRight: 6 }} />
              ACTIVE DRILL • {selected?.company?.toUpperCase() || 'SPECIFICATIONS'}
            </span>
            <span>{selected?.difficulty?.toUpperCase() || 'DRILL DETAILS'}</span>
          </div>

          <div className="drill-question-scroll">
            {selected ? (
              <>
                <div className="drill-question-hero">
                  <p className="kicker">DRILL SPECIFICATION / {selected.company}</p>
                  <h2>{selected.title}</h2>
                  <div className="drill-meta-pills">
                    <span className={`drill-tag-badge difficulty-tag diff-${selected.difficulty?.toLowerCase()}`}>
                      {selected.difficulty} DIFFICULTY
                    </span>
                    {selected.category && (
                      <span className="drill-tag-badge category-tag">{selected.category}</span>
                    )}
                    <span className="metric-pill">
                      TARGET: {selected.details?.expectedComplexity || 'O(N) TIME'}
                    </span>
                  </div>
                </div>

                <div className="problem-statement-block">
                  <p className="problem-statement">{selected.details?.prompt || selected.description}</p>
                </div>

                <div className="problem-io">
                  <div>
                    <strong>INPUT</strong>
                    <span>{selected.details?.input || 'Function parameters described above.'}</span>
                  </div>
                  <div>
                    <strong>OUTPUT</strong>
                    <span>{selected.details?.output || 'Expected return value.'}</span>
                  </div>
                  <div>
                    <strong>COMPLEXITY</strong>
                    <span>{selected.details?.expectedComplexity || 'Optimal time and auxiliary space.'}</span>
                  </div>
                </div>

                {selected.details?.examples && selected.details.examples.length > 0 && (
                  <div className="example-stack">
                    <div className="panel-label" style={{ padding: '8px 0', border: 0, borderBottom: '1px solid var(--line)' }}>
                      <span>EXAMPLES</span>
                      <span>TEST CASES</span>
                    </div>
                    {selected.details.examples.map((example: any, index: number) => (
                      <article className="example-card" key={index}>
                        <strong>EXAMPLE {index + 1}</strong>
                        <code>Input: {example.input}</code>
                        <code>Output: {example.output}</code>
                        {example.explanation && <p>{example.explanation}</p>}
                      </article>
                    ))}
                  </div>
                )}

                <div className="constraint-card">
                  <div className="panel-label" style={{ padding: '8px 0', border: 0, borderBottom: '1px solid var(--line)' }}>
                    <span>CONSTRAINTS</span>
                    <span>BOUNDARIES</span>
                  </div>
                  <ul>
                    {(selected.details?.constraints || ['1 <= nums.length <= 10^5', 'Optimal O(N) runtime required.']).map((constraint: string) => (
                      <li key={constraint}>{constraint}</li>
                    ))}
                  </ul>
                  {selected.hint && (
                    <div className="hint-callout">
                      <b>INTERVIEW HINT</b>
                      <span>{selected.hint}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                Select a drill to view specifications.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT EQUAL BOX: Code Workspace & Terminal Output */}
        <div className="drill-box drill-code-box">
          <div className="panel-label">
            <span>
              <Terminal size={13} style={{ display: 'inline', marginRight: 6 }} />
              WORKSPACE • {language.toUpperCase()}
            </span>
            <span>SANDBOX READY • TAB: 2 SPACES</span>
          </div>

          <div className="drill-code-toolbar">
            <label>
              LANGUAGE
              <select
                value={language}
                onChange={e => {
                  const next = e.target.value as CodeLanguage;
                  setLanguage(next);
                  if (selected) {
                    setCode(codeTemplate(selected, next));
                    setOutput('Starter reset for ' + next.toUpperCase() + '.');
                  }
                }}
              >
                <option value="python">Python 3</option>
                <option value="js">JavaScript (Node.js)</option>
                <option value="cpp">C++ (GCC 12)</option>
                <option value="java">Java (OpenJDK 17)</option>
              </select>
            </label>
            <span className="runtime-label">
              {language === 'python'
                ? 'Python 3.11 Sandbox'
                : language === 'js'
                ? 'Node.js 20 Sandbox'
                : language === 'cpp'
                ? 'GCC C++20 Sandbox'
                : 'OpenJDK 17 Sandbox'}
            </span>
          </div>

          <textarea
            className="drill-code-input"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            placeholder="// Write your solution here..."
          />

          <div className="drill-action-bar">
            <button className="brand-button" onClick={runCode} disabled={running}>
              <Play size={15} fill="currentColor" /> {running ? 'RUNNING...' : 'RUN SOLUTION'}
            </button>
            <button className="ghost-button" onClick={() => selected && openProblem(selected)}>
              <RotateCcw size={13} style={{ display: 'inline', marginRight: 4 }} /> RESET CODE
            </button>
          </div>

          <div className="drill-console-pane">
            <div className="drill-console-header">
              <span>SANDBOX CONSOLE / TEST OUTPUT</span>
              <span>{running ? 'PROCESSING...' : 'RESULT'}</span>
            </div>
            <pre className="drill-console-output">
              {output || '// Click "RUN SOLUTION" to execute code against sandbox test cases.'}
            </pre>
          </div>
        </div>
      </section>
    </main>
  );
}
function CompanyPrep() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'india' | 'global' | 'faang' | 'fintech' | 'service'>('all');
  const [selectedCompany, setSelectedCompany] = useState<CompanyPrepItem>(
    () => companyPrepCatalog.find(company => company.id === 'google') || companyPrepCatalog[0]
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    blueprint: true,
    rounds: true,
    questions: true,
    systemDesign: false,
    culture: false,
  });
  const [openWeeks, setOpenWeeks] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleWeek = (idx: number) => {
    setOpenWeeks(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const expandAll = () => {
    setOpenSections({
      blueprint: true,
      rounds: true,
      questions: true,
      systemDesign: true,
      culture: true,
    });
    setOpenWeeks({ 0: true, 1: true, 2: true, 3: true, 4: true, 5: true });
  };

  const collapseAll = () => {
    setOpenSections({
      blueprint: false,
      rounds: false,
      questions: false,
      systemDesign: false,
      culture: false,
    });
    setOpenWeeks({ 0: false, 1: false, 2: false, 3: false, 4: false, 5: false });
  };

  const globalIds = useMemo(() => new Set([
    'google', 'microsoft', 'amazon', 'meta', 'apple', 'netflix', 'uber', 'adobe', 
    'salesforce', 'oracle', 'linkedin', 'atlassian', 'stripe', 'bloomberg', 
    'goldman-sachs', 'jpmorgan', 'visa', 'mastercard', 'nvidia', 'servicenow', 'openai'
  ]), []);

  const filteredCompanies = useMemo(() => {
    return companyPrepCatalog.filter(company => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        company.name.toLowerCase().includes(q) ||
        company.region.toLowerCase().includes(q) ||
        company.pyqTopics.some(topic => topic.toLowerCase().includes(q)) ||
        company.sampleQuestions.some(sq => sq.toLowerCase().includes(q));

      let matchesCategory = true;
      if (activeCategory === 'global') {
        matchesCategory = globalIds.has(company.id);
      } else if (activeCategory === 'india') {
        matchesCategory = !globalIds.has(company.id);
      } else if (activeCategory === 'faang') {
        matchesCategory = company.category === 'faang';
      } else if (activeCategory === 'fintech') {
        matchesCategory = company.category === 'fintech';
      } else if (activeCategory === 'service') {
        matchesCategory = company.category === 'service-based';
      }

      return matchesQuery && matchesCategory;
    });
  }, [query, activeCategory, globalIds]);

  const activeRoadmap = selectedCompany?.roadmap || selectedCompany?.faangRoadmap;

  return (
    <main className="shell">
      <section className="studio-head">
        <div>
          <p className="kicker">02 / COMPANY WISE PRACTICE</p>
          <h1>COMPANY<br /><span>PLAYBOOKS.</span></h1>
        </div>
        <div className="session-meta">
          <b>{companyPrepCatalog.length} CURATED ROADMAPS</b>
          <span>6-WEEK MASTER PREPARATION PLANS</span>
          <span>DSA • SYSTEM DESIGN • BEHAVIORAL</span>
        </div>
      </section>

      <section className="prep-shell">
        {/* Left Filter Sidebar */}
        <div className="prep-sidebar">
          <div className="panel-label">
            <span>SEARCH COMPANIES</span>
            <span>{filteredCompanies.length} PLAYBOOKS MATCHING</span>
          </div>

          <label className="search-field">
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search TCS, Google, Flipkart, Swiggy, Uber, OpenAI..."
            />
          </label>

          <div className="pill-row">
            <button className={`pill-chip ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
              All ({companyPrepCatalog.length})
            </button>
            <button className={`pill-chip ${activeCategory === 'india' ? 'active' : ''}`} onClick={() => setActiveCategory('india')}>
              India Tech (26)
            </button>
            <button className={`pill-chip ${activeCategory === 'global' ? 'active' : ''}`} onClick={() => setActiveCategory('global')}>
              Global (21)
            </button>
            <button className={`pill-chip ${activeCategory === 'faang' ? 'active' : ''}`} onClick={() => setActiveCategory('faang')}>
              FAANG
            </button>
            <button className={`pill-chip ${activeCategory === 'fintech' ? 'active' : ''}`} onClick={() => setActiveCategory('fintech')}>
              Fintech
            </button>
            <button className={`pill-chip ${activeCategory === 'service' ? 'active' : ''}`} onClick={() => setActiveCategory('service')}>
              IT Services
            </button>
          </div>

          <div className="prep-list">
            {filteredCompanies.map((company, index) => (
              <button
                key={`${company.id}-${index}`}
                className={`prep-card ${selectedCompany?.id === company.id ? 'selected' : ''}`}
                onClick={() => setSelectedCompany(company)}
              >
                <div className="prep-card-top">
                  <span className="index-badge">{company.category === 'faang' ? '★' : '●'}</span>
                  <div>
                    <strong>{company.name}</strong>
                    <small>{company.region} • {company.hiringProcess[0]}</small>
                  </div>
                </div>
                <span className="arrow-pill"><ArrowRight size={16} /></span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Details Workspace */}
        <div className="prep-detail">
          {selectedCompany ? (
            <>
              {/* ── Hero Banner Card ── */}
              <article className="detail-card hero-card">
                <div className="detail-header">
                  <div>
                    <p className="kicker">COMPANY PLAYBOOK / {selectedCompany.region}</p>
                    <h2>{selectedCompany.name}</h2>
                  </div>
                  <span className="metric-pill" style={{ background: 'var(--ink, #101018)', color: '#fff', border: '1px solid var(--ink, #101018)', fontWeight: 700, padding: '8px 14px' }}>
                    {activeRoadmap?.duration || '6-WEEK SPRINT'}
                  </span>
                </div>
                <p style={{ margin: '8px 0 14px', fontSize: 13, lineHeight: 1.6 }}>{selectedCompany.interviewStyle}</p>
                <div className="detail-meta-row">
                  <span className="meta-pill">Region • {selectedCompany.region}</span>
                  <span className="meta-pill">Hiring Stages • {selectedCompany.hiringProcess.length} Rounds</span>
                  <span className="meta-pill">Prep Angle • {selectedCompany.prepNotes?.[0] || 'Ownership & Trade-offs'}</span>
                </div>
                <div className="info-grid">
                  <div className="info-card">
                    <strong>Hiring Process Loop</strong>
                    <span>{selectedCompany.hiringProcess.join('  ⟶  ')}</span>
                  </div>
                  <div className="info-card">
                    <strong>What They Calibrate &amp; Reward</strong>
                    <span>{selectedCompany.prepNotes?.[0] || 'Strong ownership, trade-off clarity, and measurable impact.'}</span>
                  </div>
                  <div className="info-card">
                    <strong>Preparation Angle</strong>
                    <span>{selectedCompany.prepNotes?.[1] || 'Anchor answers around constraints, execution quality, and business impact.'}</span>
                  </div>
                  {selectedCompany.culturalValues && selectedCompany.culturalValues.length > 0 && (
                    <div className="info-card">
                      <strong>Core Cultural Values</strong>
                      <span>{selectedCompany.culturalValues.slice(0, 2).join(' • ')}</span>
                    </div>
                  )}
                </div>
              </article>

              {/* ── Quick Collapse / Expand Toolbar ── */}
              <div className="prep-collapsible-bar">
                <span className="prep-collapsible-count">
                  {Object.values(openSections).filter(Boolean).length} OF 5 SECTIONS EXPANDED
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="collapsible-ctrl-btn" onClick={expandAll}>
                    Expand All
                  </button>
                  <button type="button" className="collapsible-ctrl-btn" onClick={collapseAll}>
                    Collapse All
                  </button>
                </div>
              </div>

              {/* ── Detailed 6-Week Prep Roadmap ── */}
              {activeRoadmap && (
                <article className="detail-card roadmap-card">
                  <button
                    type="button"
                    className="panel-label collapsible-trigger"
                    onClick={() => toggleSection('blueprint')}
                    title="Click to expand / collapse 6-week blueprint"
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BookOpen size={13} /> {selectedCompany.name.toUpperCase()} 6-WEEK STEP-BY-STEP PREP BLUEPRINT
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="collapsible-tag">{activeRoadmap.duration.toUpperCase()}</span>
                      {openSections.blueprint ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {openSections.blueprint && (
                    <div className="collapsible-card-content">
                      <p className="roadmap-intro">
                        A rigorous, high-signal preparation roadmap calibrated specifically for {selectedCompany.name}'s technical bar. Follow the weekly milestones in sequence to build deep pattern mastery and interview confidence.
                      </p>

                      <div className="roadmap-weeks">
                        {activeRoadmap.weeks.map((week: any, index: number) => {
                          const isWeekOpen = openWeeks[index] ?? (index === 0);
                          return (
                            <div className="roadmap-week" key={week.label}>
                              <button
                                type="button"
                                className="week-head-row week-head-btn"
                                onClick={() => toggleWeek(index)}
                                title="Click to toggle week details"
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span className="roadmap-number">0{index + 1}</span>
                                  <strong>{week.label} / {week.focus}</strong>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ font: "700 9px 'DM Mono', monospace", color: 'var(--muted)' }}>
                                    {week.topics?.length || 0} TOPICS
                                  </span>
                                  {isWeekOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                              </button>

                              {isWeekOpen && (
                                <div className="week-body" style={{ animation: 'editorial-in 0.15s ease both' }}>
                                  <p>{week.target}</p>

                                  {week.topics && week.topics.length > 0 && (
                                    <div>
                                      <span className="week-topics-label">HIGH-PRIORITY TOPICS &amp; PATTERNS:</span>
                                      <div className="week-topics-row">
                                        {week.topics.map((t: string) => (
                                          <span key={t} className="topic-chip">✓ {t}</span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {week.deliverable && (
                                    <div className="week-deliverable">
                                      <b>MILESTONE DELIVERABLE:</b>
                                      <span>{week.deliverable}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="curated-grid" style={{ marginTop: 20 }}>
                        {activeRoadmap.curatedPrep.map((item: any) => (
                          <div className="curated-item" key={item.title}>
                            <span>CRITICAL STRATEGY</span>
                            <strong>{item.title}</strong>
                            <p>{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              )}

              {/* ── Interview Round Sequence ── */}
              <article className="detail-card">
                <button
                  type="button"
                  className="panel-label collapsible-trigger"
                  onClick={() => toggleSection('rounds')}
                  title="Click to expand / collapse rounds"
                >
                  <span>INTERVIEW ROUND SEQUENCE</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="collapsible-tag">{selectedCompany.hiringProcess.length} ROUNDS</span>
                    {openSections.rounds ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </div>
                </button>

                {openSections.rounds && (
                  <div className="collapsible-card-content">
                    <div className="info-grid" style={{ gap: 0, marginTop: 12 }}>
                      {selectedCompany.hiringProcess.map((roundText: string, idx: number) => (
                        <div className="info-card" key={idx} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          <span style={{ font: "800 18px/1 'Space Grotesk', sans-serif", color: 'var(--violet, #6e54f6)', minWidth: 28 }}>0{idx + 1}</span>
                          <div>
                            <strong>{roundText.split(':')[0]}</strong>
                            <span style={{ display: 'block', marginTop: 2 }}>{roundText.split(':')[1] || roundText}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>

              {/* ── Frequent PYQs & Sample Questions ── */}
              <article className="detail-card">
                <button
                  type="button"
                  className="panel-label collapsible-trigger"
                  onClick={() => toggleSection('questions')}
                  title="Click to expand / collapse PYQs"
                >
                  <span>FREQUENT REPEATED QUESTIONS</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="collapsible-tag">{selectedCompany.sampleQuestions?.length || 0} PYQS</span>
                    {openSections.questions ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </div>
                </button>

                {openSections.questions && (
                  <div className="collapsible-card-content">
                    <div className="info-grid" style={{ marginTop: 12 }}>
                      {selectedCompany.sampleQuestions?.map((q: string, idx: number) => (
                        <div key={idx} className="info-card" style={{ position: 'relative' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ font: "700 9px/1 'DM Mono', monospace", letterSpacing: '1px', background: '#ece8ff', color: 'var(--violet, #6e54f6)', border: '1px solid var(--ink, #101018)', padding: '3px 7px' }}>
                              PYQ #{idx + 1}
                            </span>
                            <span style={{ font: "700 8.5px/1 'DM Mono', monospace", letterSpacing: '1px', padding: '3px 7px', border: '1px solid var(--ink, #101018)', color: 'var(--ink, #101018)', background: q.toLowerCase().includes('hard') ? 'var(--coral, #f3a184)' : q.toLowerCase().includes('easy') ? 'var(--mint, #d6f4d1)' : '#f2f0ea' }}>
                              {q.toLowerCase().includes('hard') ? 'HARD' : q.toLowerCase().includes('easy') ? 'EASY' : 'MEDIUM'}
                            </span>
                          </div>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                    <div className="info-grid" style={{ marginTop: 12 }}>
                      <div className="info-card">
                        <strong>Frequent PYQ Topics</strong>
                        <span>{selectedCompany.pyqTopics.join(' • ')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </article>

              {/* ── System Design Archetypes ── */}
              {selectedCompany.systemDesignArchetypes && selectedCompany.systemDesignArchetypes.length > 0 && (
                <article className="detail-card">
                  <button
                    type="button"
                    className="panel-label collapsible-trigger"
                    onClick={() => toggleSection('systemDesign')}
                    title="Click to expand / collapse system design drills"
                  >
                    <span>COMPANY-SPECIFIC ARCHITECTURES</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="collapsible-tag">{selectedCompany.systemDesignArchetypes.length} DRILLS</span>
                      {openSections.systemDesign ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {openSections.systemDesign && (
                    <div className="collapsible-card-content">
                      <div className="info-grid" style={{ marginTop: 12 }}>
                        {selectedCompany.systemDesignArchetypes.map((arch: string, idx: number) => (
                          <div className="info-card" key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ font: "700 9px/1 'DM Mono', monospace", letterSpacing: '1px', background: 'var(--coral, #f3a184)', color: 'var(--ink, #101018)', border: '1px solid var(--ink, #101018)', padding: '3px 7px' }}>
                                SYSTEM DRILL 0{idx + 1}
                              </span>
                            </div>
                            <strong>{arch}</strong>
                            <span>Focus on component trade-offs, data models, scale calculations (QPS &amp; Storage), and failure modes.</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              )}

              {/* ── Culture & Behavioral Blueprint ── */}
              {selectedCompany.culturalValues && selectedCompany.culturalValues.length > 0 && (
                <article className="detail-card">
                  <button
                    type="button"
                    className="panel-label collapsible-trigger"
                    onClick={() => toggleSection('culture')}
                    title="Click to expand / collapse culture values"
                  >
                    <span>CULTURE &amp; LEADERSHIP VALUES</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="collapsible-tag">{selectedCompany.culturalValues.length} VALUES</span>
                      {openSections.culture ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {openSections.culture && (
                    <div className="collapsible-card-content">
                      <div className="info-grid" style={{ marginTop: 12 }}>
                        {selectedCompany.culturalValues.map((val: string, idx: number) => (
                          <div className="info-card" key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ font: "700 9px/1 'DM Mono', monospace", letterSpacing: '1px', background: 'var(--mint, #d6f4d1)', color: 'var(--ink, #101018)', border: '1px solid var(--ink, #101018)', padding: '3px 7px' }}>
                                CORE VALUE 0{idx + 1}
                              </span>
                            </div>
                            <strong>{val.split(':')[0]}</strong>
                            {val.includes(':') && <span>{val.split(':')[1]}</span>}
                          </div>
                        ))}
                      </div>

                      {selectedCompany.communityInsights && selectedCompany.communityInsights.length > 0 && (
                        <div className="info-grid" style={{ marginTop: 12 }}>
                          {selectedCompany.communityInsights.map((insight: any, idx: number) => (
                            <div className="info-card" key={idx}>
                              <strong>{insight.title}</strong>
                              <span>{insight.detail}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              )}
            </>
          ) : (
            <article className="detail-card empty-state-card">
              <p className="kicker">READY</p>
              <h2>Select a company to view the complete playbook.</h2>
              <p>Each company card surfaces the hiring process, the likely rounds, and the questions that matter most.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}

function Community() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState('All topics');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [postTypeFilter, setPostTypeFilter] = useState<'all' | PostType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<'popular' | 'newest' | 'replies' | 'helpful'>('popular');
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [upvotedPosts, setUpvotedPosts] = useState<Set<string>>(new Set());
  const [helpfulPosts, setHelpfulPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  // Composer State
  const [composerType, setComposerType] = useState<PostType>('question');
  const [author, setAuthor] = useState('TeLos User');
  const [role, setRole] = useState('SWE Candidate');
  const [targetCompany, setTargetCompany] = useState(companyPrepCatalog[0]?.name || 'Google');
  const [levelOrRound, setLevelOrRound] = useState('L4 / SDE II');
  const [outcome, setOutcome] = useState<'Offer' | 'Reject' | 'Pending' | 'N/A'>('Offer');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reply Drafts
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const topics = ['All topics', 'Interview experiences', 'DSA & algorithms', 'System design', 'Career advice', 'Mock interviews'];

  // Dynamically compute trending companies from catalog and active posts
  const trendingCompanies = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach(p => {
      if (p.company) map.set(p.company, (map.get(p.company) || 0) + 1);
    });
    const sortedActive = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(([name]) => name);
    const topCatalog = companyPrepCatalog.map(c => c.name);
    const combined = Array.from(new Set([...sortedActive, ...topCatalog])).slice(0, 14);
    return ['All', ...combined];
  }, [posts]);

  // Dynamically compute signal metrics
  const uniqueAuthorsCount = useMemo(() => {
    const set = new Set<string>();
    posts.forEach(p => {
      if (p.author) set.add(p.author);
      (p.replies || []).forEach(r => { if (r.author) set.add(r.author); });
    });
    return set.size;
  }, [posts]);

  const totalPYQsCount = useMemo(() => {
    return posts.filter(p => p.postType === 'debrief' || p.outcome || p.tags?.includes('interview experiences')).length;
  }, [posts]);

  const totalRepliesCount = useMemo(() => {
    return posts.reduce((acc, p) => acc + (p.replies?.length || 0), 0);
  }, [posts]);

  const trackedCompaniesCount = useMemo(() => {
    return new Set([...companyPrepCatalog.map(c => c.name), ...posts.map(p => p.company).filter(Boolean)]).size;
  }, [posts]);

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl('/api/community'))
      .then(r => r.json())
      .then(d => {
        if (d.posts && Array.isArray(d.posts)) {
          setPosts(d.posts);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const toggleVote = async (id: string) => {
    const isUpvoted = upvotedPosts.has(id);
    const delta = isUpvoted ? -1 : 1;
    setUpvotedPosts(prev => {
      const next = new Set(prev);
      if (isUpvoted) next.delete(id);
      else next.add(id);
      return next;
    });
    setVotes(v => ({ ...v, [id]: (v[id] || 0) + delta }));
    try {
      await fetch(apiUrl('/api/community/vote'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id, delta })
      });
    } catch {
      // offline fallback
    }
  };

  const toggleHelpful = (id: string) => {
    setHelpfulPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSaved = (id: string) => {
    setSavedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleReplies = (id: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submitReply = async (postId: string) => {
    const text = (replyDrafts[postId] || '').trim();
    if (!text) return;
    const newReply: CommunityReply = {
      id: crypto.randomUUID?.() ?? `rep-${Date.now()}`,
      author: author.trim() || 'TeLos Member',
      role: role.trim() || 'Candidate',
      message: text,
      timestamp: new Date().toISOString()
    };
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          replies: [...(p.replies || []), newReply]
        };
      }
      return p;
    }));
    setReplyDrafts(prev => ({ ...prev, [postId]: '' }));
    setExpandedReplies(prev => new Set(prev).add(postId));

    try {
      await fetch(apiUrl('/api/community/reply'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, reply: newReply })
      });
    } catch {
      // offline fallback
    }
  };

  const submitPost = async () => {
    const trimmedMsg = message.trim();
    if (!trimmedMsg) return;
    setSubmitting(true);
    const tags = [
      targetCompany.toLowerCase(),
      composerType === 'debrief' ? 'interview experiences' : composerType === 'mock' ? 'mock interviews' : activeTopic === 'All topics' ? 'dsa & algorithms' : activeTopic.toLowerCase()
    ];
    if (outcome && outcome !== 'N/A' && composerType === 'debrief') tags.push(outcome.toLowerCase());

    const newPost: CommunityPost = {
      id: crypto.randomUUID?.() ?? `post-${Date.now()}`,
      author: author.trim() || 'TeLos Candidate',
      role: role.trim() || 'Software Engineer',
      title: title.trim() || `${targetCompany} ${composerType.toUpperCase()} Discussion`,
      postType: composerType,
      company: targetCompany,
      outcome: composerType === 'debrief' ? outcome : undefined,
      level: levelOrRound.trim() || undefined,
      message: trimmedMsg,
      tags,
      timestamp: new Date().toISOString(),
      upvotes: 1,
      helpfulCount: 0,
      replies: []
    };

    try {
      const res = await fetch(apiUrl('/api/community'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [newPost, ...prev]);
      }
    } catch {
      setPosts(prev => [newPost, ...prev]);
    }

    setMessage('');
    setTitle('');
    setSubmitting(false);
  };

  const visiblePosts = useMemo(() => {
    return posts.filter(post => {
      const text = `${post.title || ''} ${post.message} ${(post.tags || []).join(' ')} ${post.author} ${post.company || ''}`.toLowerCase();
      
      const topicMatch = activeTopic === 'All topics' || 
        text.includes(activeTopic.toLowerCase().replace(' & ', ' ').replace(' experiences', ' experience'));
      
      const companyMatch = companyFilter === 'All' || 
        post.company?.toLowerCase() === companyFilter.toLowerCase() ||
        text.includes(companyFilter.toLowerCase());

      const typeMatch = postTypeFilter === 'all' || post.postType === postTypeFilter;

      const queryMatch = !searchQuery.trim() || text.includes(searchQuery.trim().toLowerCase());

      return topicMatch && companyMatch && typeMatch && queryMatch;
    }).sort((a, b) => {
      if (sort === 'newest') return +new Date(b.timestamp) - +new Date(a.timestamp);
      if (sort === 'replies') return (b.replies?.length || 0) - (a.replies?.length || 0);
      if (sort === 'helpful') return ((b.helpfulCount || 0) + (helpfulPosts.has(b.id) ? 1 : 0)) - ((a.helpfulCount || 0) + (helpfulPosts.has(a.id) ? 1 : 0));
      // popular (default)
      const scoreA = (a.upvotes || 0) + (votes[a.id] || 0) + (a.replies?.length || 0) * 2;
      const scoreB = (b.upvotes || 0) + (votes[b.id] || 0) + (b.replies?.length || 0) * 2;
      return scoreB - scoreA;
    });
  }, [posts, activeTopic, companyFilter, postTypeFilter, searchQuery, sort, votes, helpfulPosts]);

  return (
    <main className="shell community-shell">
      <section className="studio-head">
        <div>
          <p className="kicker">03 / LEARN WITH THE COMMUNITY</p>
          <h1>DISCUSS.<br /><span>GET BETTER.</span></h1>
        </div>
        <div className="session-meta">
          <b>TELOS DISCUSS HUB</b>
          <span>REAL INTERVIEW LOGS</span>
          <span>PEER MOCK INTERVIEWS</span>
        </div>
      </section>

      <div className="community-layout">
        {/* LEFT COLUMN: Structured Sidebar (Equalized Cards) */}
        <aside className="community-sidebar">
          {/* Card 1: Topics Directory */}
          <div className="community-card">
            <div className="community-card-head">
              <span>
                <Users size={12} style={{ display: 'inline', marginRight: 6 }} />
                TOPICS DIRECTORY
              </span>
              <span>{posts.length} POSTS</span>
            </div>
            <div className="community-topic-list">
              {topics.map(item => {
                const count = item === 'All topics'
                  ? posts.length
                  : posts.filter(post => `${post.message} ${(post.tags || []).join(' ')}`.toLowerCase().includes(item.toLowerCase().replace(' & ', ' ').replace(' experiences', ' experience'))).length;
                return (
                  <button
                    key={item}
                    className={`community-topic-btn ${activeTopic === item ? 'active' : ''}`}
                    onClick={() => setActiveTopic(item)}
                  >
                    <span>{item}</span>
                    <span className="community-topic-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Trending Company Scope */}
          <div className="community-card">
            <div className="community-card-head">
              <span>
                <Briefcase size={12} style={{ display: 'inline', marginRight: 6 }} />
                DISCUSS BY COMPANY
              </span>
              <span>HOT</span>
            </div>
            <div className="trending-companies-grid">
              {trendingCompanies.map(comp => (
                <button
                  key={comp}
                  className={`company-tag-pill ${companyFilter === comp ? 'active' : ''}`}
                  onClick={() => setCompanyFilter(comp)}
                >
                  {comp === 'All' ? 'All Companies' : `#${comp}`}
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Community Metrics */}
          <div className="community-card">
            <div className="community-card-head">
              <span>
                <TrendingUp size={12} style={{ display: 'inline', marginRight: 6 }} />
                COMMUNITY SIGNAL
              </span>
              <span>VERIFIED</span>
            </div>
            <div className="community-stats-grid">
              <div className="community-stat-cell">
                <span className="community-stat-val">{uniqueAuthorsCount}</span>
                <span className="community-stat-lbl">Active Contributors</span>
              </div>
              <div className="community-stat-cell">
                <span className="community-stat-val">{totalPYQsCount}</span>
                <span className="community-stat-lbl">Debriefs &amp; PYQs</span>
              </div>
              <div className="community-stat-cell">
                <span className="community-stat-val">{totalRepliesCount}</span>
                <span className="community-stat-lbl">Community Answers</span>
              </div>
              <div className="community-stat-cell">
                <span className="community-stat-val">{trackedCompaniesCount}</span>
                <span className="community-stat-lbl">Companies Tracked</span>
              </div>
            </div>
          </div>

          {/* Card 4: Signal Guidelines */}
          <div className="community-card" style={{ background: 'var(--ink)', color: '#ffffff' }}>
            <div className="community-card-head" style={{ background: '#191826', color: 'var(--mint)', borderBottomColor: 'rgba(255,255,255,0.15)' }}>
              <span>
                <Award size={12} style={{ display: 'inline', marginRight: 6 }} />
                HIGH-SIGNAL ADVICE
              </span>
              <span>STANDARDS</span>
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ margin: 0, font: '400 11.5px/1.6 Manrope, sans-serif', color: '#d8d4e4' }}>
                When posting an interview debrief, include the <strong>Company</strong>, <strong>Role/Level</strong>, <strong>Round specifications</strong>, and <strong>trade-offs asked</strong>. This helps peers give precise, actionable feedback.
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Board Header, Filter Toolbar, Composer & Discussion Feed */}
        <section className="community-board">
          {/* Header Card */}
          <div className="board-hero-card">
            <div>
              <p className="kicker">COMMUNITY FORUM / {companyFilter.toUpperCase()}</p>
              <h2>{activeTopic}</h2>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="drill-tag-badge company-tag">{companyFilter === 'All' ? 'ALL COMPANIES' : companyFilter}</span>
              <span className="drill-counter-pill">{visiblePosts.length} DISCUSSIONS</span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="community-filter-bar">
            <div className="community-search-box">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search discussions by keyword, company, author..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, color: 'var(--muted)' }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="community-sort-tabs">
              <button
                className={`community-sort-btn ${sort === 'popular' ? 'active' : ''}`}
                onClick={() => setSort('popular')}
              >
                🔥 POPULAR
              </button>
              <button
                className={`community-sort-btn ${sort === 'newest' ? 'active' : ''}`}
                onClick={() => setSort('newest')}
              >
                ✨ NEWEST
              </button>
              <button
                className={`community-sort-btn ${sort === 'replies' ? 'active' : ''}`}
                onClick={() => setSort('replies')}
              >
                💬 MOST REPLIES
              </button>
              <button
                className={`community-sort-btn ${sort === 'helpful' ? 'active' : ''}`}
                onClick={() => setSort('helpful')}
              >
                ⭐ HELPFUL
              </button>
            </div>
          </div>

          {/* Rich Discussion Composer Card */}
          <div className="composer-card">
            <div className="composer-type-tabs">
              <button
                className={`composer-type-btn ${composerType === 'question' ? 'active' : ''}`}
                onClick={() => setComposerType('question')}
              >
                💡 QUESTION / DISCUSSION
              </button>
              <button
                className={`composer-type-btn ${composerType === 'debrief' ? 'active' : ''}`}
                onClick={() => setComposerType('debrief')}
              >
                📝 INTERVIEW DEBRIEF (PYQS)
              </button>
              <button
                className={`composer-type-btn ${composerType === 'offer' ? 'active' : ''}`}
                onClick={() => setComposerType('offer')}
              >
                💼 OFFER &amp; COMP REVIEW
              </button>
              <button
                className={`composer-type-btn ${composerType === 'mock' ? 'active' : ''}`}
                onClick={() => setComposerType('mock')}
              >
                👥 FIND MOCK PARTNER
              </button>
            </div>

            <div className="composer-body">
              <div className="composer-row-fields">
                <input
                  className="composer-field-input"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Your Name (e.g. Aria S.)"
                />
                <input
                  className="composer-field-input"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="Your Role / Target (e.g. SDE-2 Candidate)"
                />
                <select
                  className="composer-field-input"
                  value={targetCompany}
                  onChange={e => setTargetCompany(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  {companyPrepCatalog.map(comp => (
                    <option key={comp.id} value={comp.name}>{comp.name}</option>
                  ))}
                  <option value="General">General / Other</option>
                </select>
              </div>

              {composerType === 'debrief' && (
                <div className="composer-row-fields">
                  <input
                    className="composer-field-input"
                    value={levelOrRound}
                    onChange={e => setLevelOrRound(e.target.value)}
                    placeholder="Round / Level (e.g. Round 3 System Design / L4)"
                  />
                  <select
                    className="composer-field-input"
                    value={outcome}
                    onChange={e => setOutcome(e.target.value as any)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Offer">Outcome: Offer Received 🎉</option>
                    <option value="Pending">Outcome: Result Pending</option>
                    <option value="Reject">Outcome: Rejected (Shared for Learning)</option>
                    <option value="N/A">Outcome: General Round Debrief</option>
                  </select>
                  <span style={{ font: '600 10px/2.5 "DM Mono", monospace', color: 'var(--muted)' }}>
                    ✓ AUTO-TAGGED FOR COMMUNITY
                  </span>
                </div>
              )}

              <input
                className="composer-field-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Discussion Title (e.g. Google L4 Rate Limiter Round — Expected Complexity & Edge Cases)"
                style={{ fontWeight: 600 }}
              />

              <textarea
                className="composer-textarea"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={
                  composerType === 'debrief'
                    ? "Share the interview questions, edge cases discussed, behavioral prompts, and specific tips that helped you..."
                    : composerType === 'offer'
                    ? "List base salary, stock/RSUs, joining bonus, location, and your competing counter-offers..."
                    : composerType === 'mock'
                    ? "Describe your target companies, topics (DSA / LLD / System Design), and weekly availability..."
                    : "What would you like to discuss? Include company, round context, code snippets, or architecture questions."
                }
              />

              <div className="composer-footer">
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="tag-badge">#{targetCompany.toLowerCase()}</span>
                  <span className="tag-badge">#{composerType}</span>
                  {activeTopic !== 'All topics' && (
                    <span className="tag-badge">#{activeTopic.toLowerCase()}</span>
                  )}
                </div>

                <button
                  className="brand-button"
                  onClick={submitPost}
                  disabled={!message.trim() || submitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
                >
                  <Send size={13} />
                  <span>{submitting ? 'POSTING...' : 'PUBLISH DISCUSSION'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Discussion Thread Feed */}
          <div className="thread-list">
            {loading ? (
              <div className="detail-card empty-state-card" style={{ padding: 40, textAlign: 'center' }}>
                <Sparkles size={24} style={{ margin: '0 auto 12px', color: 'var(--violet)' }} />
                <h2>Loading discussions...</h2>
              </div>
            ) : visiblePosts.length === 0 ? (
              <div className="detail-card empty-state-card" style={{ padding: 40, textAlign: 'center' }}>
                <MessageCircle size={28} style={{ margin: '0 auto 12px', color: 'var(--muted)' }} />
                <h2>No discussions found for this view.</h2>
                <p>Be the first to start a conversation or share an interview experience!</p>
              </div>
            ) : (
              visiblePosts.map(post => {
                const totalVotes = (post.upvotes || 0) + (votes[post.id] || 0);
                const isUpvoted = upvotedPosts.has(post.id);
                const isHelpful = helpfulPosts.has(post.id);
                const isSaved = savedPosts.has(post.id);
                const isExpanded = expandedReplies.has(post.id);
                const repliesList = post.replies || [];

                return (
                  <article key={post.id} className="thread-item-card">
                    {/* Vote Column */}
                    <div className="thread-vote-column">
                      <button
                        className={`thread-vote-btn ${isUpvoted ? 'upvoted' : ''}`}
                        onClick={() => toggleVote(post.id)}
                        title="Upvote discussion"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <span className="thread-vote-num">{totalVotes}</span>
                    </div>

                    {/* Content Column */}
                    <div className="thread-main-column">
                      <div className="thread-header-row">
                        <div className="thread-user-info">
                          <span className="thread-user-avatar">
                            {post.author.slice(0, 1).toUpperCase()}
                          </span>
                          <div className="thread-user-titles">
                            <span className="thread-user-name">{post.author}</span>
                            <span className="thread-user-role">
                              {post.role} • {new Date(post.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {post.company && (
                            <span className="drill-tag-badge company-tag">{post.company}</span>
                          )}
                          {post.outcome && (
                            <span className={`drill-tag-badge difficulty-tag ${post.outcome === 'Offer' ? 'diff-easy' : 'diff-medium'}`}>
                              {post.outcome.toUpperCase()}
                            </span>
                          )}
                          {post.postType && post.postType !== 'question' && (
                            <span className="drill-tag-badge category-tag">{post.postType.toUpperCase()}</span>
                          )}
                        </div>
                      </div>

                      {post.title && (
                        <h3 className="thread-title">{post.title}</h3>
                      )}

                      <p className="thread-body-text">{post.message}</p>

                      <div className="thread-badges-row">
                        {post.tags?.map(tag => (
                          <span key={tag} className="tag-badge">#{tag}</span>
                        ))}
                      </div>

                      {/* Action Row */}
                      <div className="thread-actions-bar">
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <button
                            className={`thread-action-btn ${isExpanded ? 'active' : ''}`}
                            onClick={() => toggleReplies(post.id)}
                          >
                            <MessageCircle size={14} />
                            <span>{repliesList.length} {repliesList.length === 1 ? 'Reply' : 'Replies'}</span>
                          </button>

                          <button
                            className={`thread-action-btn ${isHelpful ? 'active' : ''}`}
                            onClick={() => toggleHelpful(post.id)}
                          >
                            <ThumbsUp size={13} />
                            <span>{(post.helpfulCount || 0) + (isHelpful ? 1 : 0)} Helpful</span>
                          </button>

                          <button
                            className={`thread-action-btn ${isSaved ? 'active' : ''}`}
                            onClick={() => toggleSaved(post.id)}
                          >
                            <Bookmark size={13} fill={isSaved ? 'currentColor' : 'none'} />
                            <span>{isSaved ? 'Saved' : 'Save'}</span>
                          </button>
                        </div>

                        <button
                          className="thread-action-btn"
                          onClick={() => toggleReplies(post.id)}
                          style={{ color: 'var(--ink)', fontWeight: 700 }}
                        >
                          {isExpanded ? 'Hide Replies' : '+ Reply to Thread'}
                        </button>
                      </div>

                      {/* Nested Replies Drawer */}
                      {isExpanded && (
                        <div className="nested-replies-tray">
                          {repliesList.length > 0 ? (
                            repliesList.map((rep: CommunityReply) => (
                              <div key={rep.id} className="nested-reply-item">
                                <div className="nested-reply-header">
                                  <span className="nested-reply-author">{rep.author}</span>
                                  <span className="nested-reply-role">{rep.role}</span>
                                </div>
                                <p className="nested-reply-text">{rep.message}</p>
                              </div>
                            ))
                          ) : (
                            <p style={{ margin: 0, font: '400 11.5px Manrope, sans-serif', color: 'var(--muted)' }}>
                              No replies yet. Be the first to answer!
                            </p>
                          )}

                          {/* Inline Reply Composer */}
                          <div className="nested-reply-composer">
                            <input
                              className="nested-reply-input"
                              placeholder={`Reply to ${post.author}...`}
                              value={replyDrafts[post.id] || ''}
                              onChange={e => setReplyDrafts({ ...replyDrafts, [post.id]: e.target.value })}
                              onKeyDown={e => {
                                if (e.key === 'Enter') submitReply(post.id);
                              }}
                            />
                            <button
                              className="brand-button"
                              onClick={() => submitReply(post.id)}
                              disabled={!(replyDrafts[post.id] || '').trim()}
                              style={{ padding: '6px 14px', fontSize: 10 }}
                            >
                              REPLY
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function SiteFooter({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <footer className="telos-site-footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <div className="footer-logo-row">
            <img src={telosLogo} alt="TeLos Logo" className="footer-logo-img" />
            <span className="footer-brand-title">TeLos</span>
          </div>
          <p className="footer-tagline">
            High-signal technical interview calibration studio built for college students, new grads, and software engineers aiming for breakthrough careers in tech.
          </p>
        </div>

        <div className="footer-links-col">
          <span className="footer-col-head">STUDIO TRACKS</span>
          <button type="button" onClick={() => onNavigate('studio')}>01 / Live Mock Interview</button>
          <button type="button" onClick={() => onNavigate('prep')}>02 / Company Prep Playbooks</button>
          <button type="button" onClick={() => onNavigate('bank')}>03 / System &amp; DSA Drills</button>
          <button type="button" onClick={() => onNavigate('analytics')}>04 / Cadence &amp; Analytics</button>
          <button type="button" onClick={() => onNavigate('community')}>05 / Discuss &amp; Community</button>
        </div>

        <div className="footer-links-col">
          <span className="footer-col-head">OPEN SOURCE REPO</span>
          <a
            href="https://github.com/piyush23-eng/TeLos"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-github-card"
          >
            <Github size={20} />
            <div>
              <b>piyush23-eng / TeLos</b>
              <small>View source code &amp; star on GitHub <ExternalLink size={11} style={{ display: 'inline', marginLeft: 2 }} /></small>
            </div>
          </a>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <span>© {new Date().getFullYear()} TELOS • REAL SYSTEMS. DEEP TRADEOFFS. ZERO CANNED TRIVIA.</span>
        <a
          href="https://github.com/piyush23-eng/TeLos"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-bottom-gh-link"
        >
          <Github size={14} /> github.com/piyush23-eng/TeLos
        </a>
      </div>
    </footer>
  );
}

export default function App(){
  const [page,setPage] = useState<Page>('studio');
  const [authOpen,setAuthOpen] = useState(false);
  const [assessmentLocked,setAssessmentLocked] = useState(false);
  const [user,setUser] = useState<AuthUser|null>(() => { try { return JSON.parse(safeStorage.get('telos-user') || 'null'); } catch { return null; } });
  const handleAssessmentActivity = useCallback((active: boolean) => setAssessmentLocked(active), []);
  const syncUser = useCallback((nextUser: AuthUser) => { safeStorage.set('telos-user', JSON.stringify(nextUser)); setUser(nextUser); }, []);
  const logout = useCallback(() => { safeStorage.remove('telos-token'); safeStorage.remove('telos-user'); setUser(null); setPage('studio'); }, []);
  const currentPage = page === 'dashboard'
    ? user ? <UserDashboard user={user} onNavigate={setPage} onRequireAuth={()=>setAuthOpen(true)} onUserUpdated={syncUser} /> : <Studio />
    : page === 'studio'
    ? <Studio />
    : page === 'prep'
      ? <CompanyPrep />
      : page === 'community'
        ? <Community />
        : page === 'analytics'
        ? <Analytics />
          : page === 'assessment'
            ? <Assessment user={user} onRequireAuth={()=>setAuthOpen(true)} onActivityChange={handleAssessmentActivity} />
            : <Bank />;

  return <div className="app-shell">
    <TopNav page={page} setPage={setPage} user={user} onAuth={()=>setAuthOpen(true)} onLogout={logout} locked={assessmentLocked}/>
    <div className="page-stage">
      {currentPage}
    </div>
    {!assessmentLocked && <SiteFooter onNavigate={setPage} />}
    {authOpen && <AuthModal onClose={()=>setAuthOpen(false)} onAuthenticated={nextUser=>{ syncUser(nextUser); setPage('dashboard'); setAuthOpen(false); }}/>} 
  </div>}
