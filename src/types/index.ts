export type Page = 'dashboard' | 'studio' | 'prep' | 'community' | 'analytics' | 'bank' | 'assessment';

export type Message = {
  id: number;
  speaker: 'PANEL' | 'YOU';
  text: string;
  time: string;
  pending?: boolean;
};

export type VoiceProfile = 'natural' | 'warm' | 'broadcast';

export type CodeLanguage = 'js' | 'python' | 'cpp' | 'java';

export type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

export type PostType = 'question' | 'debrief' | 'offer' | 'mock';

export type CommunityReply = {
  id: string;
  author: string;
  role: string;
  message: string;
  timestamp: string;
};

export type CommunityPost = {
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

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => Recognition;
    SpeechRecognition?: new () => Recognition;
  }
}

export const defaultInterviewContext = {
  persona: 'Alex (AI Interviewer)',
  role: '',
  company: '',
  focus: '',
  resume: '',
  jobDescription: '',
};

export const fallbackData = [
  { date: 'JUL 03', star: 62, accuracy: 68, fillers: 9.2 },
  { date: 'JUL 08', star: 66, accuracy: 71, fillers: 7.4 },
  { date: 'JUL 14', star: 73, accuracy: 76, fillers: 5.6 },
  { date: 'JUL 19', star: 77, accuracy: 79, fillers: 4.1 },
  { date: 'JUL 26', star: 84, accuracy: 82, fillers: 3.2 }
];

export function stamp(start: number): string {
  const s = Math.max(0, Math.floor((Date.now() - start) / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
