import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ArrowLeft, ArrowRight, Award, BarChart3, BookOpen, Bot, Check, CheckCheck, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Code2, Copy, Download, ExternalLink, FileText, Github, Hand, HelpCircle, Layers, LayoutDashboard, Lightbulb, LockKeyhole, LogOut, MessageCircle, Mic, MicOff, Moon, Pause, Play, Printer, Radio, RotateCcw, Search, Send, ShieldCheck, Sparkles, Square, Sun, Terminal, Upload, Users, Video, VideoOff, Volume2, VolumeX, X, Zap } from 'lucide-react';
import { companyPrepCatalog, type CompanyPrepItem } from './companyPrepData';
import { Assessment } from './Assessment';
import { AuthModal, type AuthUser } from './AuthModal';
import { UserDashboard } from './UserDashboard';
import telosLogo from './assets/telos-logo.jpeg';
import './roadmap.css';
import { buildSessionReport, calculateSpeakingPace, countFillerWords, exportDebriefToMarkdown } from './voiceMetrics';

const companyCatalog = companyPrepCatalog;

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

type Page = 'dashboard' | 'studio' | 'prep' | 'community' | 'analytics' | 'bank' | 'assessment';
type Message = { id: number; speaker: 'PANEL' | 'YOU'; text: string; time: string; pending?: boolean };
type CommunityPost = { id: string; author: string; role: string; message: string; tags: string[]; timestamp: string };
type VoiceProfile = 'natural' | 'warm' | 'broadcast';
type CodeLanguage = 'js' | 'python' | 'cpp' | 'java';
type Recognition = { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; onresult: ((event: any) => void) | null; onerror: ((event: any) => void) | null; onend: (() => void) | null };
declare global { interface Window { webkitSpeechRecognition?: new () => Recognition; SpeechRecognition?: new () => Recognition } }

import { VoiceOrbVisualizer } from './components/VoiceOrbVisualizer';

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
    const response = await fetch(`${API}/api/tts`, {
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

function TopNav({page,setPage,user,onAuth,onLogout,locked}:{page:Page;setPage:(p:Page)=>void;user:AuthUser|null;onAuth:()=>void;onLogout:()=>void;locked:boolean}) { const [menuOpen,setMenuOpen] = useState(false); const [darkMode,setDarkMode] = useState(() => localStorage.getItem('telos-theme') === 'dark'); useEffect(() => { document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'; localStorage.setItem('telos-theme', darkMode ? 'dark' : 'light'); }, [darkMode]); const go=(next:Page)=>{if(!locked){setPage(next);setMenuOpen(false)}}; const accountAction=()=>{if(!locked){if(user)setMenuOpen(open => !open);else onAuth()}}; const logout=()=>{setMenuOpen(false);onLogout()}; return <header className={`top-nav ${locked?'assessment-nav-locked':''}`}><button className="wordmark" aria-label="Go to TeLos interview practice" disabled={locked} onClick={()=>go('studio')}><img className="brand-logo" src={telosLogo} alt="TeLos logo"/><span className="brand-name">TeLos</span><sup>®</sup></button><nav className="nav-links" aria-label="Main navigation"><button disabled={locked} className={page==='studio'?'selected':''} onClick={()=>go('studio')}>Interview</button><button disabled={locked} className={page==='prep'?'selected':''} onClick={()=>go('prep')}>Company prep</button><button className={page==='assessment'?'selected':''} onClick={()=>go('assessment')}>Assessment</button><button disabled={locked} className={page==='community'?'selected':''} onClick={()=>go('community')}>Community</button><button disabled={locked} className={page==='analytics'?'selected':''} onClick={()=>go('analytics')}>Results</button><button disabled={locked} className={page==='bank'?'selected':''} onClick={()=>go('bank')}>Drills</button></nav><div className="account-actions"><button className="theme-toggle" type="button" onClick={()=>setDarkMode(value => !value)} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} title={darkMode ? 'Light mode' : 'Dark mode'}>{darkMode ? <Sun size={16}/> : <Moon size={16}/>}</button><div className="account-menu"><button className="nav-cta account-cta" disabled={locked} onClick={accountAction}>{locked?'Assessment locked':user ? <><span className="account-initial">{user.name.slice(0,1).toUpperCase()}</span>{user.name.split(' ')[0]}<ChevronDown size={14} className={menuOpen?'rotated':''}/></> : <>Sign in <ArrowRight size={15}/></>}</button>{user && menuOpen && <div className="account-popover" role="menu"><div className="account-popover-head"><span>{user.name.slice(0,1).toUpperCase()}</span><div><b>{user.name}</b><small>{user.email}</small></div></div><button onClick={()=>go('dashboard')}><LayoutDashboard size={16}/><span><b>My dashboard</b><small>Profile, progress, and practice plan</small></span></button><button onClick={()=>go('analytics')}><BarChart3 size={16}/><span><b>Performance</b><small>Readiness and interview results</small></span></button><button onClick={()=>go('bank')}><Code2 size={16}/><span><b>Practice library</b><small>Drills and coding patterns</small></span></button><button className="popover-logout" onClick={logout}><LogOut size={16}/>Log out</button></div>}</div></div></header> }

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
  const [modelProvider, setModelProvider] = useState<'gemini' | 'groq' | 'openrouter' | 'ollama' | 'openai' | 'heuristic'>('gemini');

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

  const handleLanguageChange = (nextLang: CodeLanguage) => {
    setLanguage(nextLang);
    setCode(starterCodeTemplates[nextLang]);
    setCodeOutput(`Switched workspace to ${nextLang.toUpperCase()}. Click 'Run Code' to execute.`);
  };

  const runLiveCode = async () => {
    setRunningCode(true);
    setCodeOutput('Compiling & running test cases against local runtime sandbox...');
    try {
      const response = await fetch(`${API}/api/run`, {
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
    const latestAnswer = [...msgs].reverse().find(m => m.speaker === 'YOU')?.text || '';
    const companyName = context.company.trim() || 'Tech';
    const roleName = context.role.trim() || 'Software Engineer';
    const resumeText = context.resume.trim();

    if (phase === 'opening' || candidateAnswers.length === 0) {
      if (resumeText) {
        const projectMatch = resumeText.match(/(?:Project|Built|Led|Engineered|Developed|Designed|Architecture|Experience)[:\s-]*([^\n.]+)/i);
        const techMatch = resumeText.match(/(?:Java|Python|Go|Golang|C\+\+|Rust|Node|React|Kubernetes|Kafka|Redis|Postgres|AWS|GCP|Distributed|Microservices|Docker|Spring)/i);
        const highlighted = projectMatch ? projectMatch[1].trim() : techMatch ? techMatch[0] : '';
        if (highlighted) {
          return `Hey, thanks for joining today! I've been reviewing your resume for the ${roleName} role at ${companyName}, and noticed your work on ${highlighted}. To start off, could you walk me through the architectural choices you made there and the biggest technical challenge you tackled?`;
        }
        return `Hey, thanks for jumping on the call! I had a look through your background and CV for ${companyName}. Walk me through the most technically challenging system or project you've owned and what trade-offs you had to balance.`;
      }
      return `Hey, thanks for jumping on the call today! I'm calibrated to screen for the ${roleName} position at ${companyName}. To start off, walk me through your background and the core architecture of a system you recently owned.`;
    }

    if (candidateAnswers.length >= 6) {
      return `Alright, I think that's a good place to stop — thanks for walking me through all that! You did great explaining those details.`;
    }

    if (latestAnswer.toLowerCase().includes('concurren') || latestAnswer.toLowerCase().includes('lock') || latestAnswer.toLowerCase().includes('race')) {
      return 'Got it, nice. How did you handle edge cases where multiple operations competed for the same resource simultaneously?';
    }
    if (latestAnswer.toLowerCase().includes('latency') || latestAnswer.toLowerCase().includes('scale') || latestAnswer.toLowerCase().includes('cache') || latestAnswer.toLowerCase().includes('kafka')) {
      return 'Makes sense. Okay, but what if the event pipeline saturated or memory spiked during peak load? How did you recover?';
    }
    if (latestAnswer.toLowerCase().includes('fail') || latestAnswer.toLowerCase().includes('incident') || latestAnswer.toLowerCase().includes('error')) {
      return 'Interesting, okay. When that failure occurred, what broke first, and what steps did you take to prevent it from repeating?';
    }

    return `Understood. In the context of your work at ${companyName} for ${roleName}, what was the most critical trade-off behind that decision, and what would you change if the constraints shifted?`;
  };

  const playVoice = (text: string) => {
    if (!voice || !text) return;
    setIsSpeakingTts(true);
    void speak(text, true, voiceName, voiceProfile);
    const estDuration = Math.max(2500, text.split(/\s+/).length * 360);
    setTimeout(() => setIsSpeakingTts(false), estDuration);
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
    try {
      const response = await fetch(`${API}/api/interviewer/next/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...context, modelProvider, transcript: toTranscript(msgs), phase })
      });
      if (!response.body) throw new Error('stream unavailable');
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
          if (eventLine === 'delta' && dataLine) {
            const payload = JSON.parse(dataLine);
            const text = payload.text || '';
            if (text) {
              const needsSpace = assembled.length > 0 && !/\s$/.test(assembled) && !/^\s/.test(text) && !/^[.,!?;:)\]}]/.test(text);
              assembled += (needsSpace ? ' ' : '') + text;
            }
            upsertStreamingPanel(assembled, false);
          }
        }
      }
      const finalQuestion = assembled.trim() || fallbackQuestion;
      upsertStreamingPanel(finalQuestion, true);
      playVoice(finalQuestion);
    } catch {
      upsertStreamingPanel(fallbackQuestion, true);
      playVoice(fallbackQuestion);
    } finally {
      followUpLock.current = false;
      setThinking(false);
    }
  };

  const commitAnswer = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || followUpLock.current) return;
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

    void fetchPanelQuestion(next, 'followup');
  };

  const interruptAlex = () => {
    window.speechSynthesis?.cancel();
    setIsSpeakingTts(false);
    if (!mic) {
      void startMic();
    }
  };

  const insertArchitectureBlock = (type: 'gateway' | 'queue' | 'cache' | 'database' | 'microservice' | 'loadbalancer') => {
    setShowScratchpad(true);
    let template = '';
    switch (type) {
      case 'gateway':
        template = `\n// ─── ARCHITECTURE: API GATEWAY & RATE LIMITING ───\n// [Clients / Mobile / Web] \n//           │\n//           ▼\n// ┌───────────────────────────────────────┐\n// │   API Gateway (Kong / Envoy)          │\n// │   - Token Bucket Rate Limiter (Redis) │\n// │   - JWT Auth & SSL Termination        │\n// │   - Dynamic Route Dispatching         │\n// └───────────────────────────────────────┘\n`;
        break;
      case 'queue':
        template = `\n// ─── ARCHITECTURE: ASYNC EVENT STREAM (KAFKA) ───\n// [Publisher Service] ──▶ [Kafka Topic: user-events] (Partition Key: user_id)\n//                                │\n//                    ┌───────────┴───────────┐\n//                    ▼                       ▼\n//          [Consumer Group 1]      [Consumer Group 2]\n//          (Analytics Pipeline)    (Notification Worker)\n`;
        break;
      case 'cache':
        template = `\n// ─── ARCHITECTURE: MULTI-TIER CACHING (REDIS) ───\n// Read Path:  Client ──▶ App Server ──▶ Redis (Cache Hit ~2ms)\n//                                │ (Cache Miss)\n//                                └──▶ Primary DB ──▶ Write-Back to Redis (TTL: 300s)\n`;
        break;
      case 'database':
        template = `\n// ─── ARCHITECTURE: DISTRIBUTED STORAGE / SHARDING ───\n// [App Layer] ──▶ Consistent Hashing Router\n//                      ├──▶ Shard 0 (PostgreSQL Master + Read Replicas)\n//                      ├──▶ Shard 1 (PostgreSQL Master + Read Replicas)\n//                      └──▶ Shard 2 (PostgreSQL Master + Read Replicas)\n`;
        break;
      case 'microservice':
        template = `\n// ─── ARCHITECTURE: CORE MICROSERVICE WORKER ───\nclass TransactionWorker {\n  async processOrder(orderId: string, payload: any) {\n    // 1. Idempotency Check using Redis SETNX\n    // 2. Distributed Lock / Saga Coordinator\n    // 3. Database ACID Transaction\n    // 4. Emit Audit Event to Message Bus\n  }\n}\n`;
        break;
      case 'loadbalancer':
        template = `\n// ─── ARCHITECTURE: LOAD BALANCER & FAILOVER ───\n// [Internet Traffic]\n//         │\n//         ▼\n// ┌───────────────────────────────────┐\n// │ L4/L7 Load Balancer (Round Robin) │\n// └───────────────────────────────────┘\n//        ├──▶ Instance A (Healthy - 15% CPU)\n//        ├──▶ Instance B (Healthy - 18% CPU)\n//        └──▶ Instance C (Healthy - 12% CPU)\n`;
        break;
    }
    setCode(c => (c ? c + '\n' + template : template));
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
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) speechBufferRef.current += `${event.results[i][0].transcript} `;
        }
        if (speechDebounceRef.current) clearTimeout(speechDebounceRef.current);
        speechDebounceRef.current = setTimeout(() => {
          const chunk = speechBufferRef.current.trim();
          speechBufferRef.current = '';
          if (chunk.length > 10) commitAnswer(chunk);
        }, 600);
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
    const resolvedCompany = context.company.trim() || 'General Tech Company';
    const resolvedRole = context.role.trim() || 'Software Engineer';
    const resolvedFocus = context.focus.trim() || 'Distributed systems and engineering algorithms';
    const resolvedContext = {
      ...context,
      company: resolvedCompany,
      role: resolvedRole,
      persona: 'Alex (AI Interviewer)',
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

  const interviewerState = thinking ? 'thinking' : isSpeakingTts ? 'speaking' : 'listening';
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
                    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, background: '#ffffff' }}>
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
                        placeholder="e.g. Google, Flipkart, Stripe, OpenAI, Uber, Datadog, Razorpay, Startup..."
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
                            `Name: Alex Chen\nExperience: 4 years building distributed systems, Java/Spring Boot APIs, Kafka event streams, Redis caching, Kubernetes microservices.\nKey Project: Led migration to partitioned Kafka event queues, cutting P99 latency by 35% under 85k RPS peak load.\nTarget role: Backend Engineer`,
                            'sample',
                            'Sample backend CV'
                          )
                        }
                      >
                        <FileText size={13} /> Load Sample CV
                      </button>
                      <button
                        type="button"
                        className="brutalist-action-btn primary"
                        onClick={() => resumeInputRef.current?.click()}
                      >
                        <Upload size={13} /> Upload PDF Resume
                      </button>
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
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span className={`mandatory-check-pill ${camera ? 'ok' : 'warn'}`}>
                        {camera ? <Check size={14} /> : <X size={14} />} Camera {camera ? 'Verified' : 'Required'}
                      </span>
                      <span className={`mandatory-check-pill ${mic ? 'ok' : 'warn'}`}>
                        {mic ? <Check size={14} /> : <X size={14} />} Mic {mic ? 'Verified' : 'Required'}
                      </span>
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

          {/* Voice Split-Screen Grid */}
          <div className="meet-split-grid">
            {/* Tile 1 (Left 50%): Calm Audio-Reactive Voice Orb Visualizer */}
            <div className="meet-video-tile avatar-tile-meet">
              <VoiceOrbVisualizer
                state={interviewerState}
                subtitles={subtitles ? latestPanel : undefined}
                interviewerName="Alex"
                companyName={context.company || activeCompany.name}
              />

              <div className="meet-phase-indicator">
                {messages.filter(m => m.speaker === 'YOU').length < 2
                  ? 'PHASE 1 • WARM INTRO & CV DISCOVERY'
                  : messages.filter(m => m.speaker === 'YOU').length < 5
                    ? 'PHASE 2 • ARCHITECTURAL & SYSTEM DEEP-DIVE'
                    : 'PHASE 3 • TECHNICAL REASONING & CHALLENGE'}
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

              <div className="scratchpad-editor-wrapper">
                <textarea
                  className="scratchpad-code-textarea"
                  value={code}
                  onChange={e => setCode(e.target.value)}
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
              <button className="call-action-btn end-call-btn" onClick={() => { stopMic(); stopCamera(); setReport(true); }}>
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
              <div className="transcript-panel" style={{ background: '#fff', border: '1px solid var(--ink)' }}>
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
  close,
}: {
  messages: Message[];
  context: typeof defaultInterviewContext;
  speechStats: { words?: number; pace?: number; lastUpdated?: number; fillers?: number };
  close: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'qa' | 'improve' | 'not-to-say' | 'strengths'>('qa');
  const [copied, setCopied] = useState(false);
  const [debrief, setDebrief] = useState<any>(null);

  useEffect(() => {
    const transcript = messages.map(m => ({
      speaker: m.speaker === 'PANEL' ? ('interviewer' as const) : ('candidate' as const),
      text: m.text,
    }));

    fetch(`${API}/api/interview/debrief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript,
        company: context.company,
        role: context.role,
        resume: context.resume,
        focus: context.focus,
        speechStats,
      }),
    })
      .then(res => res.json())
      .then(data => {
        setDebrief(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Debrief API error:', err);
        setLoading(false);
      });
  }, [messages, context, speechStats]);

  const copySummary = () => {
    if (!debrief) return;
    const text = `TELOS POST-INTERVIEW DEBRIEF REPORT
Company Target: ${context.company}
Role: ${context.role}
Hiring Recommendation: ${debrief.hiringRecommendation} (Overall Score: ${debrief.scores?.overall}%)

EXECUTIVE SUMMARY:
${debrief.summary}

CALIBRATED SCORES:
- Overall Readiness: ${debrief.scores?.overall}%
- Technical Depth: ${debrief.scores?.technicalDepth}%
- Communication & Structure: ${debrief.scores?.communication}%
- Problem Solving: ${debrief.scores?.problemSolving}%

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
    if (lower === 'strong') return 'strong';
    if (lower === 'adequate') return 'adequate';
    return 'needs-improvement';
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
              Alex and Bar Raiser AI are analyzing all questions asked, what you said versus what you should say, and concrete technical improvements...
            </p>
          </div>
        ) : debrief ? (
          <div className="debrief-scroll-body">
            {/* Scorecard Grid with Radial Gauges */}
            <div className="debrief-scorecard-grid radial-grid">
              <ScoreRadialGauge
                value={debrief.scores?.overall ?? 82}
                label="OVERALL READINESS"
                color="var(--violet, #6e54f6)"
                grade={debrief.scores?.overall >= 85 ? 'STRONG' : 'CALIBRATED'}
              />
              <ScoreRadialGauge
                value={debrief.scores?.technicalDepth ?? 80}
                label="TECHNICAL DEPTH"
                color="#0284c7"
              />
              <ScoreRadialGauge
                value={debrief.scores?.problemSolving ?? 81}
                label="PROBLEM SOLVING"
                color="var(--mint, #16a34a)"
              />
              <ScoreRadialGauge
                value={debrief.scores?.communication ?? 85}
                label="COMMUNICATION"
                color="#eab308"
              />
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
                04 / WHAT YOU IMPROVED ({debrief.whatYouImproved?.length || 0})
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

            {/* Tab 4: What You Improved & Strengths */}
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

function Analytics(){const[data,setData]=useState(fallbackData);useEffect(()=>{fetch(`${API}/api/analytics`).then(r=>r.json()).then(d=>setData(d.sessions)).catch(()=>undefined)},[]);const latest=(data[data.length-1]||data[0]||{date:'NOW',star:78,accuracy:78,fillers:4.3,pace:145}) as typeof fallbackData[number] & { pace?: number };const insightCards=[{label:'Rhythm',value:`${latest.pace ?? 0} WPM`,copy:'Your recent sessions show a healthier speaking cadence and less drift.'},{label:'Clarity',value:`${latest.accuracy ?? 0}%`,copy:'The strongest answers connect the mechanism to the impact.'},{label:'Filler drop',value:`${latest.fillers ?? 0} / min`,copy:'You are getting quieter and more deliberate with each round.'}];return <main className="shell"><section className="studio-head"><div><p className="kicker">02 / IMPROVEMENT IS A DATASET</p><h1>YOUR<br/><span>RECEIPTS.</span></h1></div><div className="session-meta"><b>12 SESSIONS LOGGED</b><span>LAST 30 DAYS</span><span>UPWARD TRAJECTORY</span></div></section><div className="big-stats"><div><b>82</b><span>READINESS<br/>INDEX</span></div><div><b>+14</b><span>STAR SCORE<br/>THIS MONTH</span></div><div><b>−65%</b><span>FILLER WORDS<br/>FROM BASELINE</span></div></div><section className="analytics-grid"><div className="analytics-stack"><article className="chart-card"><p className="kicker">STRUCTURE × TECHNICAL DEPTH</p><h2>ANSWER QUALITY</h2><ResponsiveContainer width="100%" height={280}><LineChart data={data}><CartesianGrid stroke="#1c1c1c" vertical={false}/><XAxis dataKey="date" tickLine={false} axisLine={false}/><YAxis domain={[50,100]} tickLine={false} axisLine={false}/><Tooltip/><Line dataKey="star" stroke="#ecff00" strokeWidth={4} dot={{r:5,fill:'#ecff00'}}/><Line dataKey="accuracy" stroke="#ff4f19" strokeWidth={4} dot={{r:5,fill:'#ff4f19'}}/></LineChart></ResponsiveContainer></article><article className="chart-card light-chart"><p className="kicker">SPEAKING CLEANER</p><h2>FILLER DECAY</h2><ResponsiveContainer width="100%" height={280}><AreaChart data={data}><defs><linearGradient id="brute" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#ff4f19" stopOpacity=".7"/><stop offset="100%" stopColor="#ff4f19" stopOpacity=".03"/></linearGradient></defs><CartesianGrid stroke="#bbb" vertical={false}/><XAxis dataKey="date" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/><Tooltip/><Area dataKey="fillers" stroke="#000" fill="url(#brute)" strokeWidth={4}/></AreaChart></ResponsiveContainer></article></div><div className="analytics-stack">{insightCards.map(card=><article key={card.label} className="insight-card"><p className="kicker">INSIGHT</p><h3>{card.label}</h3><b>{card.value}</b><p>{card.copy}</p></article>)}<article className="insight-card"><p className="kicker">COMMUNITY INTELLIGENCE</p><h3>Where people share real interview stories</h3><ul><li><strong>Blind</strong> — strong for company-specific round breakdowns and recruiter stories.</li><li><strong>Reddit / r/cscareerquestions</strong> — practical prep notes and failure patterns.</li><li><strong>Discord communities</strong> — useful for recent process changes and interview feedback.</li></ul></article></div></section></main>}

function Bank() {
  const [problems, setProblems] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [companyFilter, setCompanyFilter] = useState('all');
  const [language, setLanguage] = useState<CodeLanguage>('python');
  const [code, setCode] = useState('// Choose a drill and sketch your solution.\n');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);

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

  const openProblem = (problem: any) => {
    const defaultLanguage = (problem.language || language || 'python') as CodeLanguage;
    setSelected(problem);
    setLanguage(defaultLanguage);
    setCode(codeTemplate(problem, defaultLanguage));
    setOutput('');
  };

  useEffect(() => {
    fetch(`${API}/api/problems`)
      .then(r => r.json())
      .then(d => {
        const list = d.problems || [];
        setProblems(list);
        if (list.length > 0 && !selected) {
          const first = list[0];
          setSelected(first);
          const lang = (first.language || 'python') as CodeLanguage;
          setLanguage(lang);
          setCode(codeTemplate(first, lang));
        }
      })
      .catch(() => undefined);
  }, []);

  const companyFilters = useMemo(
    () => ['all', ...Array.from(new Set(problems.map(p => p.company)))],
    [problems]
  );

  const filteredProblems = useMemo(() => {
    return companyFilter === 'all'
      ? problems
      : problems.filter(p => p.company === companyFilter);
  }, [companyFilter, problems]);

  const runCode = async () => {
    if (!selected) return;
    setRunning(true);
    setOutput('Running solution against test sandbox...');
    try {
      const result = await fetch(`${API}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, problemId: selected.id }),
      });
      const payload = await result.json();
      setOutput(payload.output || 'Solution executed successfully with no errors.');
    } catch {
      setOutput('Runner service temporarily unavailable.');
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

      {/* Drill Selector Dock */}
      <div className="drill-selector-dock">
        <div className="drill-dock-left">
          <span className="drill-dock-label">FILTER</span>
          <select
            className="drill-picker-select"
            value={companyFilter}
            onChange={e => {
              const next = e.target.value;
              setCompanyFilter(next);
              const nextList = next === 'all' ? problems : problems.filter(p => p.company === next);
              if (nextList.length > 0 && (!selected || !nextList.some(p => p.id === selected.id))) {
                openProblem(nextList[0]);
              }
            }}
          >
            {companyFilters.map(f => (
              <option key={f} value={f}>{f === 'all' ? 'All Companies' : f}</option>
            ))}
          </select>

          <span className="drill-dock-divider" />

          <span className="drill-dock-label">DRILL</span>
          <select
            className="drill-picker-select"
            value={selected?.id || ''}
            onChange={e => {
              const target = problems.find(p => p.id === e.target.value);
              if (target) openProblem(target);
            }}
            style={{ minWidth: 240 }}
          >
            {filteredProblems.map((p, idx) => (
              <option key={p.id} value={p.id}>
                {String(idx + 1).padStart(2, '0')}. {p.title} ({p.difficulty})
              </option>
            ))}
          </select>
        </div>

        <div className="drill-dock-right">
          <span className="drill-dock-count">{filteredProblems.length} DRILLS</span>
        </div>
      </div>

      {/* Main Split: Left Question, Right Coding */}
      <section className="drill-workspace-shell">
        {/* LEFT COLUMN: Question & Specifications */}
        <div className="prep-detail">
          {selected ? (
            <>
              {/* Question Hero Card */}
              <article className="detail-card hero-card drill-prompt-card">
                <div className="detail-header">
                  <div>
                    <p className="kicker">ACTIVE DRILL / {selected.company}</p>
                    <h2>{selected.title}</h2>
                  </div>
                  <span className="metric-pill">{selected.difficulty}</span>
                </div>
                <p className="problem-statement">{selected.details?.prompt || selected.description}</p>
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
                    <strong>TARGET</strong>
                    <span>{selected.details?.expectedComplexity || 'Optimal time and auxiliary space.'}</span>
                  </div>
                </div>
              </article>

              {/* Examples & Constraints Card */}
              <article className="detail-card">
                <div className="panel-label">
                  <span>EXAMPLES + CONSTRAINTS</span>
                  <span>READ BEFORE CODING</span>
                </div>
                <div className="problem-details-grid">
                  <div className="example-stack">
                    {selected.details?.examples?.map((example: any, index: number) => (
                      <article className="example-card" key={index}>
                        <strong>EXAMPLE {index + 1}</strong>
                        <code>Input: {example.input}</code>
                        <code>Output: {example.output}</code>
                        {example.explanation && <p>{example.explanation}</p>}
                      </article>
                    ))}
                  </div>
                  <div className="constraint-card">
                    <strong>CONSTRAINTS</strong>
                    <ul>
                      {(selected.details?.constraints || ['1 <= nums.length <= 10^5', 'Only one valid answer exists.']).map((constraint: string) => (
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
                </div>
              </article>
            </>
          ) : (
            <article className="detail-card empty-state-card">
              <p className="kicker">READY</p>
              <h2>Select a drill to view specifications.</h2>
              <p>Every drill includes prompt, I/O specs, constraints, examples, and interview hints.</p>
            </article>
          )}
        </div>

        {/* RIGHT COLUMN: Coding Screen / Workspace */}
        <div className="prep-detail">
          <article className="detail-card code-zone-editor">
            <div className="panel-label">
              <span>
                <Code2 size={13} style={{ display: 'inline', marginRight: 6 }} />
                WORKSPACE • {language.toUpperCase()}
              </span>
              <span>TAB: 2 SPACES</span>
            </div>

            <div className="code-toolbar">
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
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </label>
              <span className="runtime-label">
                {language === 'python'
                  ? 'Python 3.11 Sandboxed'
                  : language === 'js'
                  ? 'Node.js 20 Sandboxed'
                  : language === 'cpp'
                  ? 'GCC C++20 Sandbox'
                  : 'OpenJDK 17 Sandbox'}
              </span>
            </div>

            <textarea
              className="code-input"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              placeholder="// Write your solution here..."
            />

            <div className="action-row" style={{ padding: '14px 18px', borderTop: '1px solid var(--ink)' }}>
              <button className="brand-button" onClick={runCode} disabled={running}>
                <Play size={16} fill="currentColor" /> {running ? 'RUNNING...' : 'RUN SOLUTION'}
              </button>
              <button className="ghost-button" onClick={() => selected && openProblem(selected)}>
                <RotateCcw size={13} style={{ display: 'inline', marginRight: 4 }} /> RESET
              </button>
            </div>

            <div className="panel-label" style={{ borderTop: '1px solid var(--ink)' }}>
              <span>CONSOLE</span>
              <span>{running ? 'RUNNING' : 'IDLE'}</span>
            </div>
            <pre className="output-box" style={{ margin: 0, border: 0 }}>
              {output || '// Click "RUN SOLUTION" to test your code.'}
            </pre>
          </article>
        </div>
      </section>
    </main>
  );
}
function CompanyPrep() {
  const [query, setQuery] = useState('');
  const [faangOnly, setFaangOnly] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyPrepItem>(
    () => companyPrepCatalog.find(company => company.id === 'google') || companyPrepCatalog[0]
  );

  const filteredCompanies = useMemo(() => {
    return companyPrepCatalog.filter(company => {
      const matchesQuery =
        !query ||
        company.name.toLowerCase().includes(query.toLowerCase()) ||
        company.pyqTopics.some(topic => topic.toLowerCase().includes(query.toLowerCase()));
      const matchesFaang = !faangOnly || company.category === 'faang' || Boolean(company.faangRoadmap);
      return matchesQuery && matchesFaang;
    });
  }, [query, faangOnly]);

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
            <span>{faangOnly ? 'FAANG ROADMAPS' : 'HIGH SIGNAL'}</span>
          </div>

          <label className="search-field">
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search Google, Meta, Apple, Amazon, OpenAI..."
            />
          </label>

          <div className="pill-row">
            <button className={`pill-chip ${!faangOnly ? 'active' : ''}`} onClick={() => setFaangOnly(false)}>
              All companies
            </button>
            <button className={`pill-chip ${faangOnly ? 'active' : ''}`} onClick={() => setFaangOnly(true)}>
              FAANG roadmaps
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
              {/* Hero Banner Card */}
              <article className="detail-card hero-card">
                <div className="detail-header">
                  <div>
                    <p className="kicker">COMPANY PLAYBOOK / {selectedCompany.region}</p>
                    <h2>{selectedCompany.name}</h2>
                  </div>
                  <span className="metric-pill">{activeRoadmap?.duration || '6-WEEK SPRINT'}</span>
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

              {/* 6-Week Master Roadmap Card */}
              {activeRoadmap && (
                <article className="detail-card roadmap-card">
                  <div className="panel-label">
                    <span>
                      <BookOpen size={13} /> CURATED {selectedCompany.name.toUpperCase()} ROADMAP
                    </span>
                    <span>{activeRoadmap.duration.toUpperCase()}</span>
                  </div>
                  <p className="roadmap-intro">
                    A practical week-by-week plan built around the rounds, topics, and proof points {selectedCompany.name} is calibrated to assess. Complete each milestone before progressing to the next.
                  </p>
                  <div className="roadmap-weeks">
                    {activeRoadmap.weeks.map((week: any, index: number) => (
                      <div className="roadmap-week" key={week.label}>
                        <span className="roadmap-number">0{index + 1}</span>
                        <div>
                          <strong>{week.label} / {week.focus}</strong>
                          <p>{week.target}{week.deliverable ? ` • Deliverable: ${week.deliverable}` : ''}</p>
                          {week.topics && week.topics.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                              {week.topics.map((t: string) => (
                                <span key={t} style={{ fontSize: 10, background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: 2, color: '#d8d4e5', fontFamily: 'DM Mono, monospace' }}>
                                  ✓ {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <Check size={16} aria-hidden="true" />
                      </div>
                    ))}
                  </div>
                  <div className="curated-grid">
                    {activeRoadmap.curatedPrep.map((item: any) => (
                      <div className="curated-item" key={item.title}>
                        <span>CRITICAL STRATEGY</span>
                        <strong>{item.title}</strong>
                        <p>{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* Round Readiness & Questions Card */}
              <article className="detail-card">
                <div className="panel-label">
                  <span>ROUND READINESS &amp; FREQUENT PYQS</span>
                  <span>HIGH SIGNAL</span>
                </div>
                <div className="info-grid">
                  {selectedCompany.sampleQuestions?.slice(0, 4).map((question: string) => (
                    <div key={question} className="info-card">
                      <strong>Sample Question</strong>
                      <span>{question}</span>
                    </div>
                  ))}
                  <div className="info-card">
                    <strong>Frequent PYQ Topics</strong>
                    <span>{selectedCompany.pyqTopics.join(' • ')}</span>
                  </div>
                  {selectedCompany.systemDesignArchetypes && selectedCompany.systemDesignArchetypes.length > 0 && (
                    <div className="info-card">
                      <strong>System Design Archetypes</strong>
                      <span>{selectedCompany.systemDesignArchetypes.join(' • ')}</span>
                    </div>
                  )}
                </div>
                {selectedCompany.communityInsights && selectedCompany.communityInsights.length > 0 && (
                  <div className="info-grid" style={{ marginTop: 12 }}>
                    {selectedCompany.communityInsights.map((insight: any) => (
                      <div key={insight.title} className="info-card">
                        <strong>{insight.title}</strong>
                        <span>{insight.detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </>
          ) : (
            <article className="detail-card empty-state-card">
              <p className="kicker">READY</p>
              <h2>Select a company to see the prep map.</h2>
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
  const [draft, setDraft] = useState('');
  const [author, setAuthor] = useState('TeLos User');
  const [role, setRole] = useState('SWE Applicant');
  const [submitting, setSubmitting] = useState(false);
  const [topic, setTopic] = useState('All topics');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'popular'|'newest'>('popular');
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [replyTo, setReplyTo] = useState<CommunityPost | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const topics = ['All topics', 'Interview experiences', 'DSA & algorithms', 'System design', 'Career advice', 'Mock interviews'];

  useEffect(() => {
    fetch(`${API}/api/community`).then(r => r.json()).then(d => setPosts(d.posts || [])).catch(() => undefined);
  }, []);

  const submitPost = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setSubmitting(true);
    const nextPost: CommunityPost = {
      id: crypto.randomUUID?.() ?? `post-${Date.now()}`,
      author,
      role,
      message: trimmed,
      tags: [topic === 'All topics' ? 'interview experience' : topic.toLowerCase(), 'feedback'],
      timestamp: new Date().toISOString()
    };
    try {
      const res = await fetch(`${API}/api/community`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextPost)
      });
      const data = await res.json();
      setPosts(data.posts || [nextPost, ...posts]);
      setDraft('');
    } catch {
      setPosts(prev => [nextPost, ...prev]);
      setDraft('');
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed || !replyTo) return;
    setReplying(true);
    const nextPost: CommunityPost = {
      id: crypto.randomUUID?.() ?? `reply-${Date.now()}`,
      author,
      role,
      message: `Reply to ${replyTo.author}: ${trimmed}`,
      tags: ['reply', ...replyTo.tags.slice(0, 1)],
      timestamp: new Date().toISOString()
    };
    try {
      const response = await fetch(`${API}/api/community`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nextPost) });
      const payload = await response.json();
      setPosts(payload.posts || [nextPost, ...posts]);
    } catch {
      setPosts(current => [nextPost, ...current]);
    } finally {
      setReplyText('');
      setReplyTo(null);
      setReplying(false);
    }
  };

  const visiblePosts = posts.filter(post => {
    const text = `${post.message} ${post.tags.join(' ')}`.toLowerCase();
    const topicMatch = topic === 'All topics' || text.includes(topic.toLowerCase().replace(' & ', ' ').replace(' experiences', ' experience'));
    return topicMatch && text.includes(query.toLowerCase());
  }).sort((a, b) => sort === 'newest' ? +new Date(b.timestamp) - +new Date(a.timestamp) : (votes[b.id] || 0) - (votes[a.id] || 0));
  const vote = (id: string) => setVotes(current => ({ ...current, [id]: (current[id] || 0) + 1 }));

  return <main className="shell community-shell">
    <section className="studio-head"><div><p className="kicker">03 / LEARN WITH THE COMMUNITY</p><h1>DISCUSS.<br/><span>GET BETTER.</span></h1></div><div className="session-meta"><b>TELOS DISCUSS</b><span>INTERVIEW NOTES</span><span>PRACTICE WITH PEERS</span></div></section>
    <div className="community-layout">
      <aside className="community-sidebar"><section className="topic-nav"><div className="topic-nav-head"><Users size={16}/><span>DISCUSS</span></div><h2>Topics</h2><div>{topics.map(item => <button key={item} className={topic === item ? 'active' : ''} onClick={() => setTopic(item)}>{item}<small>{item === 'All topics' ? posts.length : posts.filter(post => `${post.message} ${post.tags.join(' ')}`.toLowerCase().includes(item.toLowerCase().replace(' & ', ' ').replace(' experiences', ' experience'))).length}</small></button>)}</div></section><section className="community-tip"><p className="kicker">GOOD QUESTION</p><p>Add company, role, round, and what you have already tried. It makes it much easier for others to help.</p></section></aside>
      <section className="community-board">
        <div className="board-header"><div><p className="kicker">TELOS DISCUSS</p><h2>{topic}</h2></div><span>{visiblePosts.length} discussions</span></div>
        <div className="board-tools"><label><Search size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search discussions"/></label><div><button className={sort === 'popular' ? 'active' : ''} onClick={() => setSort('popular')}>Popular</button><button className={sort === 'newest' ? 'active' : ''} onClick={() => setSort('newest')}>Newest</button></div></div>
        <section className="discussion-composer"><div className="compose-header"><div><b>Start a discussion</b><span>Ask, share an interview experience, or help someone prepare.</span></div><button className="brand-button" onClick={submitPost} disabled={!draft.trim() || submitting}>{submitting ? 'POSTING…' : 'POST'}</button></div><div className="composer-fields"><input value={author} onChange={event => setAuthor(event.target.value)} placeholder="Your name"/><input value={role} onChange={event => setRole(event.target.value)} placeholder="Your role"/></div><textarea value={draft} onChange={event => setDraft(event.target.value)} placeholder="What would you like to discuss? Include the company, interview round, or problem context."/></section>
        <section className="thread-list">{visiblePosts.length === 0 ? <div className="empty-state"><MessageCircle size={22}/><b>No discussions match this view.</b><span>Start the first one — a clear question is often the most useful contribution.</span></div> : visiblePosts.map(post => <article key={post.id} className="discussion-thread"><div className="thread-vote"><button onClick={() => vote(post.id)} aria-label={`Upvote ${post.author}'s discussion`}><ChevronUp size={18}/></button><b>{votes[post.id] || 0}</b></div><div className="thread-content"><div className="thread-meta"><span className="thread-avatar">{post.author.slice(0, 1).toUpperCase()}</span><span><b>{post.author}</b><small>{post.role} · {new Date(post.timestamp).toLocaleDateString()}</small></span></div><p>{post.message}</p><div className="thread-footer"><div className="tag-row">{post.tags.map(tag => <span key={tag} className="tag-badge">{tag}</span>)}</div><button onClick={() => { setReplyTo(post); setReplyText(''); }}><MessageCircle size={15}/> Reply</button></div>{replyTo?.id === post.id && <div className="thread-reply"><b>Replying to {post.author}</b><textarea autoFocus value={replyText} onChange={event => setReplyText(event.target.value)} placeholder="Write a helpful reply…"/><div><button type="button" onClick={() => { setReplyTo(null); setReplyText(''); }}>CANCEL</button><button type="button" className="brand-button" disabled={!replyText.trim() || replying} onClick={() => void submitReply()}>{replying ? 'POSTING…' : 'POST REPLY'}</button></div></div>}</div></article>)}</section>
      </section>
    </div>
  </main>;
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
  const [user,setUser] = useState<AuthUser|null>(() => { try { return JSON.parse(localStorage.getItem('telos-user') || 'null'); } catch { return null; } });
  const handleAssessmentActivity = useCallback((active: boolean) => setAssessmentLocked(active), []);
  const syncUser = useCallback((nextUser: AuthUser) => { localStorage.setItem('telos-user', JSON.stringify(nextUser)); setUser(nextUser); }, []);
  const logout = useCallback(() => { localStorage.removeItem('telos-token'); localStorage.removeItem('telos-user'); setUser(null); setPage('studio'); }, []);
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
