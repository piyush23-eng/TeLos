import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, BarChart3, BookOpen, Check, ChevronDown, ChevronUp, Code2, LayoutDashboard, LockKeyhole, LogOut, MessageCircle, Mic, MicOff, Moon, Pause, Play, Radio, Search, Send, ShieldCheck, Square, Sun, Users, Video, VideoOff, Volume2, VolumeX, X } from 'lucide-react';
import { companyPrepCatalog } from './companyPrepData';
import { Assessment } from './Assessment';
import { AuthModal, type AuthUser } from './AuthModal';
import { UserDashboard } from './UserDashboard';
import telosLogo from './assets/telos-logo.jpeg';
import './roadmap.css';
import { buildSessionReport, calculateSpeakingPace } from './voiceMetrics';

const companyCatalog = companyPrepCatalog;

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

type Page = 'dashboard' | 'studio' | 'prep' | 'community' | 'analytics' | 'bank' | 'assessment';
type Message = { id: number; speaker: 'PANEL' | 'YOU'; text: string; time: string; pending?: boolean };
type CommunityPost = { id: string; author: string; role: string; message: string; tags: string[]; timestamp: string };
type VoiceProfile = 'natural' | 'warm' | 'broadcast';
type CodeLanguage = 'js' | 'python' | 'cpp' | 'java';
type Recognition = { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; onresult: ((event: any) => void) | null; onerror: ((event: any) => void) | null; onend: (() => void) | null };
declare global { interface Window { webkitSpeechRecognition?: new () => Recognition; SpeechRecognition?: new () => Recognition } }

const defaultInterviewContext = { persona: '', role: '', company: '', focus: '', resume: '', jobDescription: '' };
const fallbackData = [{date:'JUL 03',star:62,accuracy:68,fillers:9.2},{date:'JUL 08',star:66,accuracy:71,fillers:7.4},{date:'JUL 14',star:73,accuracy:76,fillers:5.6},{date:'JUL 19',star:77,accuracy:79,fillers:4.1},{date:'JUL 26',star:84,accuracy:82,fillers:3.2}];

function stamp(start: number) { const s = Math.max(0, Math.floor((Date.now() - start) / 1000)); return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`; }
const naturalVoiceOrder = ['Samantha', 'Ava', 'Karen', 'Moira', 'Tessa', 'Microsoft Jenny', 'Microsoft Aria', 'Google UK English Female', 'Google US English'];
function pickNaturalVoice(voices: SpeechSynthesisVoice[], requested: string) {
  return voices.find(v => v.name === requested) || naturalVoiceOrder.map(name => voices.find(v => v.name.includes(name))).find(Boolean) || voices.find(v => /en(-|_)US|en(-|_)GB/i.test(v.lang)) || voices[0];
}
let activeHumanVoice: HTMLAudioElement | null = null;
function browserSpeechFallback(text: string, requestedVoice = '', profile: VoiceProfile = 'natural') {
  if (!('speechSynthesis' in window) || !text?.trim()) return;
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const chunks = cleanText.match(/[^.!?]+[.!?]?/g)?.map(chunk => chunk.trim()).filter(Boolean) || [cleanText];
  const voice = pickNaturalVoice(window.speechSynthesis.getVoices(), requestedVoice);
  window.speechSynthesis.cancel();
  const settings = {
    natural: { rate: 0.92, pitch: 1.0, volume: 1.0 },
    warm: { rate: 0.85, pitch: 1.05, volume: 0.95 },
    broadcast: { rate: 1.0, pitch: 1.08, volume: 1.0 }
  }[profile];
  const playChunk = (index: number) => {
    if (index >= chunks.length) return;
    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    utterance.lang = 'en-US';
    if (voice) utterance.voice = voice;
    utterance.onend = () => playChunk(index + 1);
    window.speechSynthesis.speak(utterance);
  };
  playChunk(0);
}
async function speak(text: string, enabled: boolean, requestedVoice = 'coral', profile: VoiceProfile = 'natural') {
  if (!enabled || !text?.trim()) return;
  window.speechSynthesis?.cancel();
  activeHumanVoice?.pause();
  try {
    const response = await fetch(`${API}/api/tts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, voice: requestedVoice, profile }) });
    if (!response.ok) throw new Error('Human voice service unavailable');
    const url = URL.createObjectURL(await response.blob());
    const audio = new Audio(url);
    activeHumanVoice = audio;
    audio.onended = () => { URL.revokeObjectURL(url); if (activeHumanVoice === audio) activeHumanVoice = null; };
    await audio.play();
  } catch {
    browserSpeechFallback(text, '', profile);
  }
}

const pageOrder: Page[] = ['dashboard', 'studio', 'prep', 'community', 'analytics', 'bank'];

function TopNav({page,setPage,user,onAuth,onLogout,locked}:{page:Page;setPage:(p:Page)=>void;user:AuthUser|null;onAuth:()=>void;onLogout:()=>void;locked:boolean}) { const [menuOpen,setMenuOpen] = useState(false); const [darkMode,setDarkMode] = useState(() => localStorage.getItem('telos-theme') === 'dark'); useEffect(() => { document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'; localStorage.setItem('telos-theme', darkMode ? 'dark' : 'light'); }, [darkMode]); const go=(next:Page)=>{if(!locked){setPage(next);setMenuOpen(false)}}; const accountAction=()=>{if(!locked){if(user)setMenuOpen(open => !open);else onAuth()}}; const logout=()=>{setMenuOpen(false);onLogout()}; return <header className={`top-nav ${locked?'assessment-nav-locked':''}`}><button className="wordmark" aria-label="Go to TeLos interview practice" disabled={locked} onClick={()=>go('studio')}><img className="brand-logo" src={telosLogo} alt="TeLos logo"/><span className="brand-name">TeLos</span><sup>®</sup></button><nav className="nav-links" aria-label="Main navigation"><button disabled={locked} className={page==='studio'?'selected':''} onClick={()=>go('studio')}>Interview</button><button disabled={locked} className={page==='prep'?'selected':''} onClick={()=>go('prep')}>Company prep</button><button className={page==='assessment'?'selected':''} onClick={()=>go('assessment')}>Assessment</button><button disabled={locked} className={page==='community'?'selected':''} onClick={()=>go('community')}>Community</button><button disabled={locked} className={page==='analytics'?'selected':''} onClick={()=>go('analytics')}>Results</button><button disabled={locked} className={page==='bank'?'selected':''} onClick={()=>go('bank')}>Drills</button></nav><div className="account-actions"><button className="theme-toggle" type="button" onClick={()=>setDarkMode(value => !value)} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} title={darkMode ? 'Light mode' : 'Dark mode'}>{darkMode ? <Sun size={16}/> : <Moon size={16}/>}</button><div className="account-menu"><button className="nav-cta account-cta" disabled={locked} onClick={accountAction}>{locked?'Assessment locked':user ? <><span className="account-initial">{user.name.slice(0,1).toUpperCase()}</span>{user.name.split(' ')[0]}<ChevronDown size={14} className={menuOpen?'rotated':''}/></> : <>Sign in <ArrowRight size={15}/></>}</button>{user && menuOpen && <div className="account-popover" role="menu"><div className="account-popover-head"><span>{user.name.slice(0,1).toUpperCase()}</span><div><b>{user.name}</b><small>{user.email}</small></div></div><button onClick={()=>go('dashboard')}><LayoutDashboard size={16}/><span><b>My dashboard</b><small>Profile, progress, and practice plan</small></span></button><button onClick={()=>go('analytics')}><BarChart3 size={16}/><span><b>Performance</b><small>Readiness and interview results</small></span></button><button onClick={()=>go('bank')}><Code2 size={16}/><span><b>Practice library</b><small>Drills and coding patterns</small></span></button><button className="popover-logout" onClick={logout}><LogOut size={16}/>Log out</button></div>}</div></div></header> }

function LiveMeter({active}:{active:boolean}) { return <div className={`live-meter ${active?'hot':''}`} aria-label={active?'Microphone input active':'Microphone paused'}>{Array.from({length:34},(_,i)=><i key={i} style={{height:`${active ? 6 + ((i*29)%30) : 5}px`}}/>)}</div> }

function Studio() {
  const [context,setContext] = useState(defaultInterviewContext);
  const [selectedCompany,setSelectedCompany] = useState('google');
  const [speechStats,setSpeechStats] = useState({ words: 0, pace: 0, lastUpdated: 0 });
  const [started,setStarted] = useState(false); const [mic,setMic] = useState(false); const [camera,setCamera] = useState(false); const [voice,setVoice] = useState(true); const [voiceName,setVoiceName] = useState('coral'); const [voiceProfile,setVoiceProfile] = useState<VoiceProfile>('natural'); const [input,setInput] = useState(''); const [messages,setMessages] = useState<Message[]>([]); const [thinking,setThinking] = useState(false); const [report,setReport] = useState(false); const [micError,setMicError] = useState(''); const [cameraError,setCameraError] = useState(''); const [resumeSource,setResumeSource] = useState<'paste'|'upload'|'sample'>('paste'); const [resumeFileName,setResumeFileName] = useState('No resume loaded');
  const systemVoices = [{ name: 'coral', lang: 'Natural interviewer' }, { name: 'sage', lang: 'Calm and analytical' }, { name: 'marin', lang: 'Warm and conversational' }, { name: 'cedar', lang: 'Clear and direct' }];
  const startRef = useRef(Date.now()); const streamRef = useRef<MediaStream|null>(null); const cameraStreamRef = useRef<MediaStream|null>(null); const cameraPreviewRef = useRef<HTMLVideoElement|null>(null); const recognitionRef = useRef<Recognition|null>(null); const retryRef = useRef(false); const followUpLock = useRef(false); const speechBufferRef = useRef(''); const speechDebounceRef = useRef<ReturnType<typeof setTimeout>|null>(null); const messagesRef = useRef(messages); const resumeInputRef = useRef<HTMLInputElement|null>(null);
  messagesRef.current = messages;
  const latestPanel = useMemo(()=>[...messages].reverse().find(x=>x.speaker==='PANEL')?.text || '',[messages]);
  const activeCompany = useMemo(() => companyCatalog.find(c => c.id === selectedCompany) || companyCatalog[0], [selectedCompany]);
  const speakingPace = useMemo(() => speechStats.pace ? `${speechStats.pace} WPM` : '0 WPM', [speechStats.pace]);
  const reportMetrics = useMemo(() => buildSessionReport({ answerCount: messages.filter(m=>m.speaker==='YOU').length, pace: speechStats.pace }), [messages, speechStats.pace]);
  const interviewCoach = useMemo(() => {
    const lastAnswer = [...messages].reverse().find(m => m.speaker === 'YOU')?.text || '';
    const words = lastAnswer.trim().split(/\s+/).filter(Boolean);
    const hasDecision = /\b(chose|built|implemented|designed|owned|decided|led|shipped)\b/i.test(lastAnswer);
    const hasTradeoff = /\b(trade-?off|because|instead|versus|however|latency|cost|scale|reliability)\b/i.test(lastAnswer);
    const hasProof = /\b(%|ms|p\d\d|rps|qps|users|customers|reduced|improved|increased|decreased|saved)\b/i.test(lastAnswer);
    if (!lastAnswer) return {
      headline: 'Use this simple 3-step answer.',
      note: `Pick one project from your CV. You do not need perfect words — just tell a short story that ${activeCompany.name} can follow.`,
      starter: '“In my project, I needed to solve [problem]. I chose [approach] because [reason]. It improved [result].”',
      checks: [
        { label: 'Start with the project', value: 'PROJECT + PROBLEM', detail: 'Say what you built and the problem it solved.' },
        { label: 'Explain your choice', value: 'WHY THIS APPROACH', detail: 'Explain why you chose this solution over another one.' },
        { label: 'Finish with impact', value: 'RESULT', detail: 'Add a number, a user benefit, or a reliability improvement.' }
      ]
    };
    const missing = !hasDecision ? 'Add one sentence about the choice you made personally.' : !hasTradeoff ? 'Explain why this approach was better than the alternative.' : !hasProof ? 'Finish with a result: a number, user impact, or improvement.' : 'This is a strong answer. Be ready to explain the one part that was hardest.';
    return {
      headline: words.length < 35 ? 'Good start — add a little more context.' : hasProof && hasTradeoff ? 'Clear and convincing answer.' : 'You have the right idea — make one part stronger.',
      note: missing,
      starter: !hasDecision ? 'Try adding: “I chose this approach because…”' : !hasTradeoff ? 'Try adding: “I considered [alternative], but chose this because…”' : !hasProof ? 'Try adding: “As a result, we improved…”' : 'Next, be ready to explain what you would improve if you built it again.',
      checks: [
        { label: 'Your decision', value: hasDecision ? 'GOOD' : 'ADD THIS', detail: hasDecision ? 'You explained what you owned.' : 'Mention the decision you made or work you led.' },
        { label: 'Why you chose it', value: hasTradeoff ? 'GOOD' : 'ADD THIS', detail: hasTradeoff ? 'Your reasoning is clear.' : 'Compare it with another option or constraint.' },
        { label: 'Result', value: hasProof ? 'GOOD' : 'ADD THIS', detail: hasProof ? 'You included evidence or impact.' : 'Add a measurable or visible outcome.' }
      ]
    };
  }, [messages, activeCompany.name]);
  const toTranscript = (msgs: Message[]) => msgs.map(m=>({speaker:m.speaker==='PANEL'?'interviewer' as const:'candidate' as const,text:m.text}));
  useEffect(()=>{ if (!started || !mic) return; const words = messages.filter(m=>m.speaker==='YOU').reduce((total,m)=>total + m.text.trim().split(/\s+/).filter(Boolean).length,0); const elapsed = Math.max(1, Math.floor((Date.now() - startRef.current) / 1000 / 60)); const pace = calculateSpeakingPace(words, elapsed); setSpeechStats({ words, pace, lastUpdated: Date.now() }); }, [messages, started, mic]);
  useEffect(()=>()=>{ if(speechDebounceRef.current) clearTimeout(speechDebounceRef.current); streamRef.current?.getTracks().forEach(t=>t.stop()); cameraStreamRef.current?.getTracks().forEach(t=>t.stop()); recognitionRef.current?.stop(); window.speechSynthesis?.cancel(); activeHumanVoice?.pause(); },[]);
  const applyResumeText = (value: string, source: 'paste'|'upload'|'sample', fileLabel = 'No resume loaded') => {
    setContext(c => ({ ...c, resume: value }));
    setResumeSource(source);
    setResumeFileName(fileLabel);
  };
  const handleResumeUpload = async (
  event: ChangeEvent<HTMLInputElement>
  ) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    let text = '';

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();

     const pdf = await pdfjsLib.getDocument({
  data: new Uint8Array(arrayBuffer),
  disableStream: true,
  disableAutoFetch: true,
}).promise;

      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const reader = page.streamTextContent().getReader();

const items: any[] = [];

while (true) {
  const { value, done } = await reader.read();

  if (done) break;

  if (value?.items) {
    items.push(...value.items);
  }
}

const pageText = items
  .map((item: any) => item.str || '')
  .join(' ');

        pages.push(pageText);
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

  const message =
    error instanceof Error ? error.message : String(error);

  alert(`PDF error: ${message}`);
} finally {
  event.target.value = '';
}
};

  const upsertStreamingPanel = (text:string, final=false) => {
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
  const buildCompanySpecificQuestion = (phase:'opening'|'followup', msgs:Message[]) => {
    const latestAnswer = [...msgs].reverse().find(m => m.speaker === 'YOU')?.text || '';
    const companyName = context.company || activeCompany.name;
    const questionBank = [
      `For ${companyName}, walk me through a system you built where correctness mattered under load. What invariant did you protect?`,
      `In ${companyName} style, describe a trade-off you made in a real project and why you chose it.`,
      `For ${companyName}, how would you approach a problem where the data volume grows unexpectedly and latency becomes visible?`,
      `Tell me about a production incident you owned. What broke first, and what did you improve afterward?`,
      `If you were interviewing for ${companyName}, how would you explain a complex design choice to a skeptical stakeholder?`
    ];

    if (phase === 'opening') {
      return questionBank[0];
    }

    if (latestAnswer.toLowerCase().includes('latency') || latestAnswer.toLowerCase().includes('cache')) {
      return 'What metric would tell you that the approach is no longer acceptable under real traffic?';
    }
    if (latestAnswer.toLowerCase().includes('failure') || latestAnswer.toLowerCase().includes('retry')) {
      return 'What is the first failure mode you would isolate, and how would you contain it?';
    }
    if (latestAnswer.toLowerCase().includes('trade') || latestAnswer.toLowerCase().includes('choice')) {
      return 'Which constraint mattered most in that decision, and what would you change if it disappeared?';
    }
    return questionBank[1 + (msgs.filter(m => m.speaker === 'YOU').length % 3)];
  };

  const fetchPanelQuestion = async (msgs:Message[], phase:'opening'|'followup') => {
    if (followUpLock.current) return;
    followUpLock.current = true;
    setThinking(true);
    const fallbackQuestion = buildCompanySpecificQuestion(phase, msgs);
    upsertStreamingPanel(phase === 'opening' ? 'Starting the interview…' : 'Thinking of a follow-up…', false);
    try {
      const response = await fetch(`${API}/api/interviewer/next/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...context, transcript: toTranscript(msgs), phase })
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
  const needsSpace =
    assembled.length > 0 &&
    !/\s$/.test(assembled) &&
    !/^\s/.test(text) &&
    !/^[.,!?;:)\]}]/.test(text);

  assembled += (needsSpace ? ' ' : '') + text;
}
            upsertStreamingPanel(assembled, false);
          }
        }
      }
      if (buffer) {
        const lines = buffer.split('\n');
        const eventLine = lines.find(line => line.startsWith('event:'))?.replace('event:', '').trim();
        const dataLine = lines.find(line => line.startsWith('data:'))?.replace('data:', '').trim();
        if (eventLine === 'delta' && dataLine) {
          const payload = JSON.parse(dataLine);
          assembled += payload.text || '';
          upsertStreamingPanel(assembled, false);
        }
      }
      const finalQuestion = assembled.trim() || fallbackQuestion;
      upsertStreamingPanel(finalQuestion, true);
      speak(finalQuestion, voice, voiceName, voiceProfile);
    } catch {
      upsertStreamingPanel(fallbackQuestion, true);
      speak(fallbackQuestion, voice, voiceName, voiceProfile);
    } finally {
      followUpLock.current = false;
      setThinking(false);
    }
  };
  const commitAnswer = (text:string) => { const trimmed=text.trim(); if(!trimmed||followUpLock.current) return; const youMsg={id:Date.now(),speaker:'YOU' as const,text:trimmed,time:stamp(startRef.current)}; const next=[...messagesRef.current,youMsg]; setMessages(next); void fetchPanelQuestion(next,'followup'); };
  const startInterview = async () => { setStarted(true); startRef.current=Date.now(); setMessages([]); setContext(c => ({ ...c, company: activeCompany.name, focus: `${activeCompany.name.toLowerCase()} interview prep` })); await fetchPanelQuestion([],'opening'); };
  const stopMic = () => { retryRef.current=false; recognitionRef.current?.stop(); streamRef.current?.getTracks().forEach(t=>t.stop()); streamRef.current=null; setMic(false); if(speechDebounceRef.current) clearTimeout(speechDebounceRef.current); const pending=speechBufferRef.current.trim(); speechBufferRef.current=''; if(pending.length>8) commitAnswer(pending); };
  const stopCamera = () => { cameraStreamRef.current?.getTracks().forEach(track=>track.stop()); cameraStreamRef.current=null; if(cameraPreviewRef.current) cameraPreviewRef.current.srcObject=null; setCamera(false); };
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:'user', width:{ideal:960}, height:{ideal:540} }, audio:false });
      cameraStreamRef.current=stream;
      if(cameraPreviewRef.current){ cameraPreviewRef.current.srcObject=stream; await cameraPreviewRef.current.play(); }
      setCamera(true);
    } catch { setCameraError('Camera access was denied. Allow camera access in your browser or macOS privacy settings, then try again.'); }
  };
  const startMic = async () => {
    setMicError(''); if(!started) await startInterview();
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation:true, noiseSuppression:true, autoGainControl:true } });
      setMic(true); retryRef.current=true; if(latestPanel) speak(latestPanel, voice, voiceName);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) { setMicError('Mic is live. Built-in speech-to-text is unavailable in this Chromium build; use the response field.'); return; }
      const recognition = new SpeechRecognition(); recognition.continuous=true; recognition.interimResults=true; recognition.lang='en-US';
      recognition.onresult=(event:any)=>{ for(let i=event.resultIndex;i<event.results.length;i++){ if(event.results[i].isFinal) speechBufferRef.current += `${event.results[i][0].transcript} `; } if(speechDebounceRef.current) clearTimeout(speechDebounceRef.current); speechDebounceRef.current=setTimeout(()=>{ const chunk=speechBufferRef.current.trim(); speechBufferRef.current=''; if(chunk.length>12) commitAnswer(chunk); },350); };
      recognition.onerror=(event:any)=>{ if(event.error!=='aborted' && event.error!=='no-speech') setMicError(`Speech recognition: ${event.error}. Your microphone remains available.`); };
      recognition.onend=()=>{ if(retryRef.current) { try { recognition.start(); } catch { /* already restarting */ } } };
      recognitionRef.current=recognition; recognition.start();
    } catch { setMicError('Microphone permission was denied. Allow it in macOS System Settings → Privacy & Security → Microphone, then try again.'); setMic(false); }
  };
  const submitText = () => { const t=input; setInput(''); if(!started){ void (async()=>{ await startInterview(); if(t.trim()) commitAnswer(t); })(); return; } commitAnswer(t); };
  const manualFollowUp = () => { if(!started){ void startInterview(); return; } void fetchPanelQuestion(messagesRef.current,'followup'); };
  return <main className="shell"><section className="studio-head"><div><p className="kicker">AI INTERVIEW PRACTICE / BUILT FOR ENGINEERS</p><h1>Practice like<br/>the interview<br/><span>matters.</span></h1></div><div className="session-meta"><b>{started?(thinking?'INTERVIEWER THINKING…':'LIVE SESSION'):'READY WHEN YOU ARE'}</b><span>{context.company.toUpperCase()} / {context.role.toUpperCase()}</span><span>VOICE, CV &amp; JD CALIBRATED</span></div></section>
    <details className="context-dock" open>
      <summary>ROLE CONTEXT / PERSONALISE THIS INTERVIEW</summary>
      <div className="context-fields">
        <label>PERSONA<input value={context.persona} placeholder="e.g. Senior software engineer interviewer" onChange={e=>setContext(c=>({...c,persona:e.target.value}))}/></label><label>ROLE<input value={context.role} placeholder="e.g. Backend engineer" onChange={e=>setContext(c=>({...c,role:e.target.value}))}/></label>
        <label>COMPANY<input value={context.company} placeholder="e.g. Google" onChange={e=>setContext(c=>({...c,company:e.target.value}))}/></label>
        <label>FOCUS<input value={context.focus} placeholder="e.g. System design and APIs" onChange={e=>setContext(c=>({...c,focus:e.target.value}))}/></label>
        <label>RESUME SOURCE<select value={resumeSource} onChange={e=>{ const source=e.target.value as 'paste'|'upload'|'sample'; if (source==='sample') { applyResumeText(`Name: Alex Chen\nExperience: 6 years building distributed systems, APIs, and data platforms.\nStrengths: backend services, observability, ownership, incident response.\nTarget role: Senior Backend Engineer`, 'sample', 'Sample engineering resume'); } else if (source==='paste') { applyResumeText(context.resume, 'paste', resumeFileName); } }}><option value="paste">Paste manually</option><option value="upload">Upload text resume</option><option value="sample">Use sample engineering resume</option></select></label>
        <div className="context-fields" style={{gap:8}}>
          <button type="button" className="black-button" onClick={()=>resumeInputRef.current?.click()}>UPLOAD RESUME</button>
          <span style={{fontSize:12,opacity:0.8}}>{resumeFileName}</span>
        </div>
        <input ref={resumeInputRef} type="file" accept=".pdf,.txt,.md,.text" onChange={handleResumeUpload} hidden />
        <label>RESUME / PASTE TEXT<textarea value={context.resume} onChange={e=>setContext(c=>({...c,resume:e.target.value}))} placeholder="Paste your resume so opening questions reflect your actual experience."/></label>
        <label>JOB DESCRIPTION / PASTE TEXT<textarea value={context.jobDescription} onChange={e=>setContext(c=>({...c,jobDescription:e.target.value}))} placeholder="Paste the job description to calibrate the interview."/></label>
      </div>
    </details>
    <section className="control-deck"><div className="deck-title"><span>INTERVIEW CHANNEL</span><b>{started ? stamp(startRef.current) : '00:00'}</b></div><div className="deck-main"><button className={`mic-button ${mic?'on':''}`} onClick={mic?stopMic:startMic} disabled={thinking}>{mic?<Mic size={28}/>:<MicOff size={28}/>}<strong>{mic?'MIC IS LIVE':started?'ENABLE MIC':'START + MIC'}</strong><small>{thinking?'Wait for the next question…':mic?'Pause ~3s after you finish to send your answer':'Starts the interview, then listens continuously'}</small></button><div className="audio-readout"><div><b>INPUT / {mic?'CAPTURING':started?'STANDBY':'IDLE'}</b><span>{mic?'Speak clearly and pause when finished—the panel listens for your next turn.':started?'Type or speak. Each answer cues the next AI question.':'Hit Start Interview or enable the mic to begin.'}</span></div><LiveMeter active={mic}/>{micError&&<p className="mic-warning">{micError}</p>}</div><div className="voice-box"><button aria-label={voice ? 'Mute interviewer voice' : 'Enable interviewer voice'} onClick={()=>{setVoice(v=>!v);if(voice)window.speechSynthesis.cancel()}}>{voice?<Volume2 size={20}/>:<VolumeX size={20}/>}</button><div className="voice-details"><div className="voice-header"><div><b>INTERVIEWER VOICE</b><span>{voice ? 'ACTIVE / HUMAN TONE' : 'MUTED / SILENT'}</span></div><p className="voice-copy">Preview the AI interviewer before you answer. Choose the voice and tone that match the session energy.</p></div><div className="voice-controls"><label>VOICE<select aria-label="Interviewer voice" value={voiceName} onChange={e=>setVoiceName(e.target.value)}>{systemVoices.length ? systemVoices.map(v=><option key={`${v.name}-${v.lang}`} value={v.name}>{v.name}</option>) : <option value="">Loading available voices…</option>}</select></label><label>STYLE<select aria-label="Voice style" value={voiceProfile} onChange={e=>setVoiceProfile(e.target.value as VoiceProfile)}><option value="natural">Natural Human</option><option value="warm">Warm Storyteller</option><option value="broadcast">Broadcast Confidence</option></select></label></div></div><button className="speak-button" onClick={()=>latestPanel&&speak(latestPanel,true,voiceName,voiceProfile)} disabled={!latestPanel}>{latestPanel ? 'HEAR SAMPLE' : 'NO LINE AVAILABLE'}</button></div></div>{!started&&<div className="deck-main" style={{marginTop:12}}><button className="black-button" onClick={()=>void startInterview()} disabled={thinking}>START INTERVIEW <ArrowRight size={18}/></button></div>}</section>
    <section className="interview-presence"><article className={`candidate-camera ${camera?'active':''}`}><video ref={cameraPreviewRef} muted playsInline/><div className="camera-placeholder"><Video size={20}/><b>Candidate camera</b><small>Enable it to rehearse eye contact and presence.</small></div><div className="camera-live-label">{camera ? <><i/> CAMERA LIVE</> : 'CAMERA OFF'}</div></article><div className="presence-copy"><p className="kicker">LIVE INTERVIEW PRESENCE</p><h2>Practice the room, <i>not just the answer.</i></h2><p>Camera stays in your browser and is never recorded by TeLos.</p><div className="presence-actions"><button className={camera?'presence-on':''} onClick={camera?stopCamera:()=>void startCamera()}>{camera?<VideoOff size={16}/>:<Video size={16}/>}{camera?'TURN CAMERA OFF':'ENABLE CAMERA'}</button><button className={mic?'presence-on':''} onClick={mic?stopMic:()=>void startMic()}>{mic?<MicOff size={16}/>:<Mic size={16}/>}{mic?'MUTE MICROPHONE':'ENABLE MICROPHONE'}</button></div>{cameraError&&<p className="presence-warning">{cameraError}</p>}</div><div className="presence-status"><span><b>{camera?'01':'00'}</b><small>CAMERA</small></span><span><b>{mic?'01':'00'}</b><small>MICROPHONE</small></span><span><b>{started?'LIVE':'READY'}</b><small>SESSION</small></span></div></section>
    <section className="studio-grid"><div className="transcript-panel"><div className="panel-label"><span>/// ROLLING TRANSCRIPT</span><span>{mic?'RECORDING':started?'LIVE':'WAITING'}</span></div><div className="messages">{!messages.length&&!thinking&&<article className="message panel-msg"><div className="message-tag">PANEL<small>—</small></div><p>Press <b>Start Interview</b>. The AI panel will open with a question, then follow up after each answer.</p></article>}{messages.map(m=><article className={`message ${m.speaker==='PANEL'?'panel-msg':'you-msg'}${m.pending?' pending':''}`} key={m.id}><div className="message-tag">{m.speaker}<small>{m.time}</small></div><p>{m.text}{m.pending?' …':''}</p></article>)}{thinking&&<article className="message panel-msg pending"><div className="message-tag">PANEL<small>{stamp(startRef.current)}</small></div><p>Thinking of a follow-up…</p></article>}</div><div className="response-box"><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder={started?'Type your answer and press Enter—the panel responds automatically.':'Start the interview, then answer here or with the mic.'} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submitText()}}} disabled={thinking}/><button onClick={submitText} aria-label="Send response" disabled={thinking}><Send size={19}/></button></div></div>
      <aside className="tactics"><div className="panel-label"><span>/// ANSWER COACH</span><span>PLAIN-ENGLISH GUIDE</span></div><div className="coach-summary"><b>{interviewCoach.headline}</b><p>{interviewCoach.note}</p></div><div className="coach-starter"><span>TRY THIS STRUCTURE</span><p>{interviewCoach.starter}</p></div>{interviewCoach.checks.map((check,index)=><div key={check.label} className={`tactic ${check.value==='GOOD'?'green':check.value==='ADD THIS'?'yellow':'red'}`}><i>0{index+1}</i><p><b>{check.label}</b><span>{check.value}</span><small>{check.detail}</small></p></div>)}<button className="follow-up" onClick={manualFollowUp} disabled={thinking||!messages.some(m=>m.speaker==='YOU')}>GET NEXT QUESTION <ArrowRight size={18}/></button></aside>
    </section>
    <section className="footer-strip"><div><b>FILLERS</b><span>{messages.filter(m=>m.speaker==='YOU').length ? '2.8 / MIN' : '0.0 / MIN'}</span></div><div><b>PACE</b><span>{speakingPace}</span></div><div><b>STAR</b><span>{Math.min(100, 72 + messages.filter(m=>m.speaker==='YOU').length * 4)}% COMPLETE</span></div><button onClick={()=>{stopMic();setReport(true)}}><Square size={14}/> END + SCORE SESSION</button></section>
    {report&&<Report metrics={reportMetrics} close={()=>setReport(false)}/>}</main>
}

function Report({metrics, close}:{metrics: ReturnType<typeof buildSessionReport>; close:()=>void}) {
  return <div className="modal"><div className="brutal-report"><button className="close-modal" onClick={close}><X/></button><p className="kicker">SESSION ANALYSIS / COMPLETE</p><h2>YOUR ANSWER<br/>HAS A SHAPE.</h2><div className="score-row"><div><b>{metrics.clarity}</b><span>CLARITY</span></div><div><b>{metrics.accuracy}</b><span>ACCURACY</span></div><div><b>{metrics.paceScore}</b><span>PACE</span></div></div><p className="report-copy"><b>KEEP:</b> You frame technical trade-offs with clear constraints.<br/><b>NEXT:</b> Finish each answer by measuring the business or system impact and tightening your opening statement.</p><button className="black-button" onClick={close}>BACK TO THE FLOOR <ArrowRight size={18}/></button></div></div> }

function Analytics(){const[data,setData]=useState(fallbackData);useEffect(()=>{fetch(`${API}/api/analytics`).then(r=>r.json()).then(d=>setData(d.sessions)).catch(()=>undefined)},[]);const latest=(data[data.length-1]||data[0]||{date:'NOW',star:78,accuracy:78,fillers:4.3,pace:145}) as typeof fallbackData[number] & { pace?: number };const insightCards=[{label:'Rhythm',value:`${latest.pace ?? 0} WPM`,copy:'Your recent sessions show a healthier speaking cadence and less drift.'},{label:'Clarity',value:`${latest.accuracy ?? 0}%`,copy:'The strongest answers connect the mechanism to the impact.'},{label:'Filler drop',value:`${latest.fillers ?? 0} / min`,copy:'You are getting quieter and more deliberate with each round.'}];return <main className="shell"><section className="studio-head"><div><p className="kicker">02 / IMPROVEMENT IS A DATASET</p><h1>YOUR<br/><span>RECEIPTS.</span></h1></div><div className="session-meta"><b>12 SESSIONS LOGGED</b><span>LAST 30 DAYS</span><span>UPWARD TRAJECTORY</span></div></section><div className="big-stats"><div><b>82</b><span>READINESS<br/>INDEX</span></div><div><b>+14</b><span>STAR SCORE<br/>THIS MONTH</span></div><div><b>−65%</b><span>FILLER WORDS<br/>FROM BASELINE</span></div></div><section className="analytics-grid"><div className="analytics-stack"><article className="chart-card"><p className="kicker">STRUCTURE × TECHNICAL DEPTH</p><h2>ANSWER QUALITY</h2><ResponsiveContainer width="100%" height={280}><LineChart data={data}><CartesianGrid stroke="#1c1c1c" vertical={false}/><XAxis dataKey="date" tickLine={false} axisLine={false}/><YAxis domain={[50,100]} tickLine={false} axisLine={false}/><Tooltip/><Line dataKey="star" stroke="#ecff00" strokeWidth={4} dot={{r:5,fill:'#ecff00'}}/><Line dataKey="accuracy" stroke="#ff4f19" strokeWidth={4} dot={{r:5,fill:'#ff4f19'}}/></LineChart></ResponsiveContainer></article><article className="chart-card light-chart"><p className="kicker">SPEAKING CLEANER</p><h2>FILLER DECAY</h2><ResponsiveContainer width="100%" height={280}><AreaChart data={data}><defs><linearGradient id="brute" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#ff4f19" stopOpacity=".7"/><stop offset="100%" stopColor="#ff4f19" stopOpacity=".03"/></linearGradient></defs><CartesianGrid stroke="#bbb" vertical={false}/><XAxis dataKey="date" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/><Tooltip/><Area dataKey="fillers" stroke="#000" fill="url(#brute)" strokeWidth={4}/></AreaChart></ResponsiveContainer></article></div><div className="analytics-stack">{insightCards.map(card=><article key={card.label} className="insight-card"><p className="kicker">INSIGHT</p><h3>{card.label}</h3><b>{card.value}</b><p>{card.copy}</p></article>)}<article className="insight-card"><p className="kicker">COMMUNITY INTELLIGENCE</p><h3>Where people share real interview stories</h3><ul><li><strong>Blind</strong> — strong for company-specific round breakdowns and recruiter stories.</li><li><strong>Reddit / r/cscareerquestions</strong> — practical prep notes and failure patterns.</li><li><strong>Discord communities</strong> — useful for recent process changes and interview feedback.</li></ul></article></div></section></main>}

function Bank(){
  const [problems,setProblems]=useState<any[]>([]);
  const [selected,setSelected]=useState<any>(null);
  const [companyFilter,setCompanyFilter]=useState('all');
  const [language,setLanguage]=useState<CodeLanguage>('js');
  const [code,setCode]=useState('// Choose a drill and sketch your solution.\n');
  const [output,setOutput]=useState('');
  const [running,setRunning]=useState(false);

  useEffect(()=>{
    fetch(`${API}/api/problems`).then(r=>r.json()).then(d=>setProblems(d.problems)).catch(()=>undefined);
  },[]);

  const companyFilters = useMemo(
    () => ['all', ...Array.from(new Set(problems.map(p=>p.company)))],
    [problems]
  );

  const filteredProblems = useMemo(
    () => companyFilter === 'all'
      ? problems
      : problems.filter(p => p.company === companyFilter),
    [companyFilter, problems]
  );

  const codeTemplate = (problem:any, lang: CodeLanguage) => {
    const header = `// ${problem?.title || 'Problem'}\n// ${problem?.description || ''}\n\n`;
    if (lang === 'python') {
      return `${header}def solve():\n    # write your solution here\n    return None\n\nif __name__ == "__main__":\n    print(solve())\n`;
    }
    if (lang === 'cpp') {
      return `${header}#include <bits/stdc++.h>\nusing namespace std;\n\nint solve() {\n    // write your solution here\n    return 0;\n}\n\nint main() {\n    cout << solve() << endl;\n    return 0;\n}\n`;
    }
    if (lang === 'java') {
      return `${header}public class Main {\n    public static String solve() {\n        // write your solution here\n        return "";\n    }\n\n    public static void main(String[] args) {\n        System.out.println(solve());\n    }\n}\n`;
    }
    return `${header}function solve(input) {\n    // write your solution here\n    return input;\n}\n\nconsole.log(solve(undefined));\n`;
  };

  const openProblem = (problem:any) => {
    const defaultLanguage = (problem.language || 'js') as CodeLanguage;
    setSelected(problem);
    setLanguage(defaultLanguage);
    setCode(codeTemplate(problem, defaultLanguage));
  };

  const runCode = async () => {
    if (!selected) return;
    setRunning(true);
    setOutput('Running...');
    try {
      const result = await fetch(`${API}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, problemId: selected.id })
      });
      const payload = await result.json();
      setOutput(payload.output || 'No output.');
    } catch {
      setOutput('Runner unavailable.');
    } finally {
      setRunning(false);
    }
  };

  return <main className="shell">
    <section className="studio-head"><div><p className="kicker">04 / REAL PRACTICE, NOT RANDOM DRILLS</p><h1>DRILL THE<br/><span>REAL SHAPE.</span></h1></div><div className="session-meta"><b>{problems.length} DETAILED DRILLS</b><span>FULL PROMPTS + CONSTRAINTS</span><span>COMPANY-ALIGNED DSA</span></div></section>
    <section className="prep-shell">
      <div className="prep-sidebar"><div className="panel-label"><span>SELECT A DRILL</span><span>{companyFilter==='all'?'ALL COMPANIES':companyFilter.toUpperCase()}</span></div><div className="pill-row">{companyFilters.map(filter=><button key={filter} className={`pill-chip ${companyFilter===filter?'active':''}`} onClick={()=>setCompanyFilter(filter)}>{filter==='all'?'All companies':filter}</button>)}</div><div className="prep-list">{filteredProblems.map((p,i)=><button key={p.id} className={`prep-card ${selected?.id===p.id?'selected':''}`} onClick={()=>openProblem(p)}><div className="prep-card-top"><span className="index-badge">{String(i+1).padStart(2,'0')}</span><div><strong>{p.title}</strong><small>{p.difficulty} • {p.company} • {p.category}</small></div></div><span className="arrow-pill"><ArrowRight size={16}/></span></button>)}</div></div>
      <div className="prep-detail">{selected ? <>
        <article className="detail-card hero-card drill-prompt-card"><div className="detail-header"><div><p className="kicker">ACTIVE DRILL / {selected.company}</p><h2>{selected.title}</h2></div><span className="metric-pill">{selected.difficulty}</span></div><p className="problem-statement">{selected.details?.prompt || selected.description}</p><div className="problem-io"><div><strong>INPUT</strong><span>{selected.details?.input || 'Use the input described in the prompt.'}</span></div><div><strong>OUTPUT</strong><span>{selected.details?.output || 'Return the requested result.'}</span></div><div><strong>TARGET</strong><span>{selected.details?.expectedComplexity || 'Explain the best practical complexity.'}</span></div></div></article>
        <article className="detail-card"><div className="panel-label"><span>EXAMPLES + CONSTRAINTS</span><span>READ BEFORE CODING</span></div><div className="problem-details-grid"><div className="example-stack">{selected.details?.examples?.map((example:any, index:number)=><article className="example-card" key={index}><strong>EXAMPLE {index + 1}</strong><code>Input: {example.input}</code><code>Output: {example.output}</code><p>{example.explanation}</p></article>)}</div><div className="constraint-card"><strong>CONSTRAINTS</strong><ul>{(selected.details?.constraints || []).map((constraint:string)=><li key={constraint}>{constraint}</li>)}</ul><div className="hint-callout"><b>INTERVIEW HINT</b><span>{selected.hint}</span></div></div></div></article>
        <article className="detail-card"><div className="panel-label"><span>WORKSPACE</span><span>RUN YOUR SOLUTION</span></div><div className="code-toolbar"><label>LANGUAGE<select value={language} onChange={e=>{const next=e.target.value as CodeLanguage;setLanguage(next);setCode(codeTemplate(selected,next));setOutput('Starter reset for '+next+'.')}}><option value="js">JavaScript</option><option value="python">Python</option><option value="cpp">C++</option><option value="java">Java</option></select></label><span className="runtime-label">{language==='js'?'Node.js runtime':language==='python'?'Python 3 runtime':language==='cpp'?'C++ compile + run':'Java compile + run'}</span></div><textarea className="code-input" value={code} onChange={e=>setCode(e.target.value)}/><div className="action-row"><button className="brand-button" onClick={runCode} disabled={running}><Play size={16}/> {running?'RUNNING...':'RUN SOLUTION'}</button><button className="ghost-button" onClick={()=>openProblem(selected)}>RESET STARTER</button></div><pre className="output-box">{output}</pre></article>
      </> : <article className="detail-card empty-state-card"><p className="kicker">READY</p><h2>Pick a detailed drill to start solving.</h2><p>Every drill includes a full prompt, I/O contract, constraints, examples, an interview hint, and a runnable workspace.</p></article>}</div>
    </section>
  </main>;
}
function CompanyPrep() {
  const [query, setQuery] = useState('');
  const [faangOnly, setFaangOnly] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(() => companyCatalog.find(company => company.id === 'google') || companyCatalog[0]);
  const filteredCompanies = useMemo(() => companyCatalog.filter(company => {
    const matchesQuery = company.name.toLowerCase().includes(query.toLowerCase()) || company.pyqTopics.some(topic => topic.toLowerCase().includes(query.toLowerCase()));
    return matchesQuery && (!faangOnly || Boolean(company.faangRoadmap));
  }), [query, faangOnly]);
  const faangCount = companyCatalog.filter(company => company.faangRoadmap).length;
  const activeRoadmap = selectedCompany?.roadmap || selectedCompany?.faangRoadmap;

  return <main className="shell">
    <section className="studio-head">
      <div><p className="kicker">02 / COMPANY WISE PRACTICE</p><h1>COMPANY<br/><span>PLAYBOOKS</span></h1></div>
      <div className="session-meta"><b>{faangCount} CURATED FAANG ROADMAPS</b><span>DSA / SYSTEM DESIGN / BEHAVIORAL</span><span>WEEK-BY-WEEK PREP PLANS</span></div>
    </section>
    <section className="prep-shell">
      <div className="prep-sidebar">
        <div className="panel-label"><span>SEARCH COMPANIES</span><span>{faangOnly ? 'FAANG ROADMAPS' : 'HIGH SIGNAL'}</span></div>
        <label className="search-field"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Google, Meta, Apple, Amazon..."/></label>
        <div className="pill-row">
          <button className={`pill-chip ${!faangOnly ? 'active' : ''}`} onClick={() => setFaangOnly(false)}>All companies</button>
          <button className={`pill-chip ${faangOnly ? 'active' : ''}`} onClick={() => setFaangOnly(true)}>FAANG roadmaps</button>
        </div>
        <div className="prep-list">{filteredCompanies.map((company, index) => <button key={`${company.id}-${index}`} className={`prep-card ${selectedCompany?.id === company.id ? 'selected' : ''}`} onClick={() => setSelectedCompany(company)}>
          <div className="prep-card-top"><span className="index-badge">{company.faangRoadmap ? '★' : '●'}</span><div><strong>{company.name}</strong><small>{company.faangRoadmap ? 'Curated roadmap' : `${company.region} • ${company.hiringProcess[0]}`}</small></div></div>
          <span className="arrow-pill"><ArrowRight size={16}/></span>
        </button>)}</div>
      </div>
      <div className="prep-detail">{selectedCompany ? <>
        <article className="detail-card hero-card">
          <div className="detail-header"><div><p className="kicker">COMPANY PREP</p><h2>{selectedCompany.name}</h2></div><span className="metric-pill">{activeRoadmap?.duration || selectedCompany.region}</span></div>
          <p>{selectedCompany.interviewStyle}</p>
          <div className="detail-meta-row"><span className="meta-pill">Region • {selectedCompany.region}</span><span className="meta-pill">Round focus • {selectedCompany.hiringProcess[1] || 'Hiring loop'}</span><span className="meta-pill">Prep angle • {selectedCompany.prepNotes?.[0] || 'Ownership and trade-offs'}</span></div>
          <div className="info-grid"><div className="info-card"><strong>Hiring process</strong><span>{selectedCompany.hiringProcess.join(' • ')}</span></div><div className="info-card"><strong>What they reward</strong><span>{selectedCompany.prepNotes?.[0] || 'Strong ownership, trade-off clarity, and measurable impact.'}</span></div><div className="info-card"><strong>Prep angle</strong><span>{selectedCompany.prepNotes?.[1] || 'Anchor answers around constraints, execution quality, and business impact.'}</span></div></div>
        </article>
        {activeRoadmap && <article className="detail-card roadmap-card">
          <div className="panel-label"><span><BookOpen size={13}/> {selectedCompany.faangRoadmap ? 'CURATED' : 'FOCUSED'} {selectedCompany.name.toUpperCase()} ROADMAP</span><span>{activeRoadmap.duration.toUpperCase()}</span></div>
          <p className="roadmap-intro">A practical plan built around the rounds, topics, and proof points this company is likely to assess. Finish each week before progressing to the next.</p>
          <div className="roadmap-weeks">{activeRoadmap.weeks.map((week, index) => <div className="roadmap-week" key={week.label}>
            <span className="roadmap-number">0{index + 1}</span><div><strong>{week.label} / {week.focus}</strong><p>{week.target}</p></div><Check size={16} aria-hidden="true"/>
          </div>)}</div>
          <div className="curated-grid">{activeRoadmap.curatedPrep.map(item => <div className="curated-item" key={item.title}><span>{selectedCompany.faangRoadmap ? 'CURATED' : 'FOCUS'}</span><strong>{item.title}</strong><p>{item.detail}</p></div>)}</div>
        </article>}
        <article className="detail-card">
          <div className="panel-label"><span>ROUND READINESS</span><span>HIGH SIGNAL</span></div>
          <div className="info-grid">{selectedCompany.sampleQuestions?.slice(0, 3).map(question => <div key={question} className="info-card"><strong>Sample question</strong><span>{question}</span></div>)}<div className="info-card"><strong>PYQ topics</strong><span>{selectedCompany.pyqTopics.join(' • ')}</span></div></div>
          <div className="info-grid">{selectedCompany.communityInsights?.map(insight => <div key={insight.title} className="info-card"><strong>{insight.title}</strong><span>{insight.detail}</span></div>)}</div>
        </article>
      </> : <article className="detail-card empty-state-card"><p className="kicker">READY</p><h2>Select a company to see the prep map.</h2><p>Each company card surfaces the hiring process, the likely rounds, and the questions that matter most.</p></article>}</div>
    </section>
  </main>;
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
    {authOpen && <AuthModal onClose={()=>setAuthOpen(false)} onAuthenticated={nextUser=>{ syncUser(nextUser); setPage('dashboard'); setAuthOpen(false); }}/>} 
  </div>}
