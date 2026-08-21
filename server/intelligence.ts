import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

export type InterviewCategory = 'behavioral' | 'technical' | 'system-design' | 'small-talk' | 'coding';
export type TranscriptTurn = { speaker: 'interviewer' | 'candidate'; text: string; isFinal?: boolean; at?: number };

type InterviewContext = {
  role?: string;
  company?: string;
  persona?: string;
  focus?: string;
  resume?: string;
  jobDescription?: string;
  transcript?: TranscriptTurn[];
  phase?: 'opening' | 'followup';
};

type AnswerSignals = {
  technologies: string[];
  hasTradeoff: boolean;
  hasFailure: boolean;
  hasMetric: boolean;
  hasDecision: boolean;
  isVague: boolean;
};

const INTERVIEWER_SYSTEM = (context: {
  persona?: string;
  role?: string;
  focus?: string;
  company?: string;
  resume?: string;
  jobDescription?: string;
}) => `
You are a senior engineering interviewer conducting a realistic live interview.

CANDIDATE CONTEXT:
Role: ${context.role || "Software Engineer"}
Company: ${context.company || "Not specified"}
Focus area: ${context.focus || "Technical engineering"}
Resume:
${context.resume || "No resume provided."}

Job Description:
${context.jobDescription || "No job description provided."}

INTERVIEW RULES:

- Every question must be relevant to the candidate's resume, the job description,
  the selected role/focus, or something the candidate actually said.
- Treat the resume and job description as the source of truth.
- NEVER invent experience, projects, technologies, responsibilities, or achievements
  that are not present in the resume or conversation.
- If the focus area is backend, prioritize backend topics such as APIs, Java,
  Spring Boot, databases, system design, scalability, authentication,
  performance, testing, and distributed systems.
- Do NOT ask frontend, React, UI, CSS, or frontend state-management questions
  unless those topics are explicitly present in the resume, job description,
  or the candidate's answer.
- For the opening question, choose ONE strong question that connects the
  candidate's actual background to the job requirements.
- For follow-up questions, identify one concrete claim, technology, decision,
  trade-off, metric, failure mode, or missing detail from the candidate's
  latest answer and ask about that specifically.
- Do not repeat questions already asked.
- Do not ask generic textbook questions when a resume-specific question is possible.
- Never give the candidate the answer or hints.
- Keep the interview conversational, direct, professional, and concise.
- Return only the question you would say aloud.
- Ask the question directly. Do not use conversational filler such as "To start off", "To kick things off", "To get started", "Let's start", or "First off".
- For the opening question, never say "Welcome", "To start off", or similar introductory phrases. Begin directly with the interview question.
`;

function formatTranscript(transcript: TranscriptTurn[] = []) {
  return transcript.map(t => `${t.speaker === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${t.text}`).join('\n');
}

function normalizeQuestion(raw: string) {
  return raw
    .replace(/^\s*(Interviewer|Assistant|Panel):\s*/i, '')
    .replace(/^(welcome!?|hi!?|hello!?)[\s,!:.-]*/i, '')
    .replace(/^(to\s+(kick|start)(\s+things)?\s+off[,\s]*)/i, '')
    .replace(/^let'?s\s+(kick|start)\s+things\s+off[,\s]*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["“”\-–—]+/, '')
    .trim();
}

function isGenericFollowUp(question: string) {
  const normalized = normalizeQuestion(question).toLowerCase();
  return /can you elaborate|tell me more|what are your thoughts|what do you think|why is that|can you explain|can you make that more concrete|walk me through/i.test(normalized);
}

function isRepeatedQuestion(
  question: string,
  previousQuestions: string[]
) {
  const normalized = normalizeQuestion(question).toLowerCase();

  if (!normalized) return true;

  return previousQuestions.some(prev => {
    const previous = normalizeQuestion(prev).toLowerCase();

    if (!previous) return false;

    // Exact duplicate
    if (previous === normalized) {
      return true;
    }

    // One question contains the other
    if (
      previous.includes(normalized) ||
      normalized.includes(previous)
    ) {
      return true;
    }

    const prevWords = new Set(
      previous
        .split(/\W+/)
        .filter(word => word.length > 3)
    );

    const nextWords = normalized
      .split(/\W+/)
      .filter(word => word.length > 3);

    if (nextWords.length === 0) return false;

    const overlap = nextWords.filter(
      word => prevWords.has(word)
    ).length;

    const similarity = overlap / nextWords.length;

    return similarity >= 0.65;
  });
}

function extractAnswerSignals(answer: string): AnswerSignals {
  const value = answer.toLowerCase();
  const technologies = [
    'kafka', 'redis', 'postgres', 'mysql', 'mongodb', 'cassandra', 'rabbitmq', 'sqs', 's3', 'aws', 'gcp', 'azure',
    'docker', 'kubernetes', 'graphql', 'rest', 'event-driven', 'cache', 'sql', 'nosql', 'queue', 'consensus',
    'replication', 'sharding', 'partition', 'retry', 'timeout', 'idempotency', 'circuit breaker', 'backpressure'
  ].filter(tech => value.includes(tech));

  return {
    technologies,
    hasTradeoff: /(but|however|instead|rather|tradeoff|depends|versus|vs|because)/i.test(value),
    hasFailure: /(failure|fail|retry|timeout|race|concurrency|deadlock|latency|throughput|bottleneck|rollback|backpressure|consistency|partition|edge case)/i.test(value),
    hasMetric: /(ms|seconds|latency|throughput|qps|rps|percent|slo|sla|uptime|availability|p99|p95|nines|tps)/i.test(value),
    hasDecision: /(chose|used|implemented|built|decided|selected|opted|designed|migrated|owned)/i.test(value),
    isVague: /\b(i think|maybe|probably|i guess|sort of|kind of|some|thing)\b/i.test(value) || answer.trim().split(/\s+/).length < 12
  };
}

function inferDomain(context: InterviewContext) {
  const combined = [context.role, context.focus, context.resume, context.jobDescription].join(' ').toLowerCase();
  if (/(frontend|react|ui|ux|javascript|typescript)/i.test(combined)) return 'frontend';
  if (/(ml|model|pipeline|data|analytics)/i.test(combined)) return 'data';
  if (/(backend|api|system|distributed|database|microservice|architecture|scal|latency|availability)/i.test(combined)) return 'systems';
  return 'general';
}

function buildOpeningQuestion(context: InterviewContext) {
  const domain = inferDomain(context);
  if (domain === 'frontend') {
    return 'Tell me about a recent front-end change that got tricky because state or user flow became complex. What was the hardest edge case to get right?';
  }
  if (domain === 'data') {
    return 'Walk me through a data or ML system you worked on where quality or correctness really mattered. How did you validate it in practice?';
  }
  if (domain === 'systems') {
    return 'Tell me about a production system you helped build or operate where correctness mattered under load. What invariant did you protect?';
  }
  return 'Walk me through a recent technical decision you owned end to end. What problem were you solving, and how did you know your approach was right?';
}

export function buildHeuristicQuestion(context: InterviewContext) {
  const transcript = context.transcript || [];
  const recent = transcript.slice(-12);
  const isOpening = context.phase === 'opening' || recent.filter(turn => turn.speaker === 'candidate').length === 0;

  if (isOpening) {
    return { question: buildOpeningQuestion(context), category: 'technical' as const };
  }

  const latestAnswer = [...recent].reverse().find(turn => turn.speaker === 'candidate')?.text || '';
  const previousQuestions = recent.filter(turn => turn.speaker === 'interviewer').map(turn => turn.text);
  const priorQuestion = [...recent].reverse().find(turn => turn.speaker === 'interviewer')?.text || '';

  if (!latestAnswer) {
    return { question: 'You mentioned a concrete decision. What trade-off did you optimize for, and what did you give up?', category: 'technical' as const };
  }

  const signals = extractAnswerSignals(latestAnswer);
  const roleFocus = [context.role, context.focus].filter(Boolean).join(' ');
  const hasPreviousFailure = previousQuestions.some(q => /(failure|fail|retry|latency|recover|contain|break)/i.test(q));
  const hasPreviousTradeoff = previousQuestions.some(q => /(trade|constraint|assumption|decision|optimiz)/i.test(q));
  const hasPreviousMetric = previousQuestions.some(q => /(metric|threshold|load|throughput|latency|slo|uptime)/i.test(q));

  let question = '';

  if (signals.isVague) {
    question = 'Give me one concrete example from that answer. What actually happened, and what was the outcome?';
  } else if (signals.hasFailure || (signals.hasTradeoff && hasPreviousMetric)) {
    question = 'When that path fails in production, what is the first thing that breaks, and how would you contain it?';
  } else if (signals.hasMetric || hasPreviousFailure) {
    question = 'What metric or threshold would tell you that approach is no longer acceptable under load?';
  } else if (signals.hasTradeoff || hasPreviousMetric) {
    question = 'Which constraint mattered most in that decision, and what would you change if that constraint disappeared?';
  } else if (signals.technologies.length) {
    const tech = signals.technologies[0];
    question = `You mentioned ${tech}. What would make that choice fail in the real world, and how would you detect it early?`;
  } else if (signals.hasDecision) {
    question = 'What assumption was most important behind that decision, and how would you test it?';
  } else if (roleFocus) {
    question = `You said that in the context of ${roleFocus}. What assumption is most important there, and how would you test it?`;
  } else if (priorQuestion) {
    question = 'What is the most important assumption behind that approach, and how would you validate it?';
  } else {
    question = 'What trade-off did you optimize for in that choice, and what would you change if the constraints shifted?';
  }

  if (isRepeatedQuestion(question, previousQuestions)) {
    question = 'What would you change if the constraints or traffic pattern shifted overnight?';
  }

  return { question, category: 'technical' as const };
}

/**
 * The only cloud-bound portion of the app. Keep this interface stable if the
 * Express service is eventually replaced by Spring Boot.
 */
export class IntelligenceProvider {
  private openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : undefined;
  private anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
  private gemini = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    ? new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
    : null;

  private async delay(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  private chunkText(text: string) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  for (const word of words) {
    current += (current ? ' ' : '') + word;

    if (current.length >= 40 || /[.!?]$/.test(word)) {
      chunks.push(current);
      current = '';
    }
  }

  if (current) chunks.push(current);

  return chunks.length ? chunks : [text];
}

  readonly llm = this.gemini ? 'google' : this.anthropic ? 'anthropic' : 'demo';
  readonly mode = this.llm !== 'demo' || process.env.DEEPGRAM_API_KEY ? 'cloud' : 'demo';

  private async generateText(system: string, user: string, opts: { maxTokens?: number; temperature?: number } = {}) {
    const { maxTokens = 400, temperature = 0.3 } = opts;
    if (this.gemini) {
      const model = this.gemini.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
        systemInstruction: system,
        generationConfig: { maxOutputTokens: maxTokens, temperature }
      });
      const result = await model.generateContent(user);

const raw = result.response.text();

console.log("========== RAW AI QUESTION ==========");
console.log(raw);
console.log("=====================================");

return raw.trim();
    }
    if (this.openai) {
  const response = await this.openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: system,
      },
      {
        role: 'user',
        content: user,
      },
    ],
    max_tokens: maxTokens,
    temperature,
  });

  return response.choices[0]?.message?.content?.trim() || '';
}
    
    if (this.anthropic) {
      const completion = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: maxTokens,
        temperature,
        system,
        messages: [{ role: 'user', content: user }]
      });
      return completion.content.find(x => x.type === 'text')?.text.trim() || '';
    }
    return '';
  }

  async classify(text: string): Promise<{ category: InterviewCategory; confidence: number }> {
    if (this.llm === 'demo') return this.demoClassify(text);
    const system =
      'Classify this interviewer utterance. Return only one lowercase label: behavioral, technical, system-design, small-talk, coding.';
    const value = (await this.generateText(system, text, { maxTokens: 40, temperature: 0 })).toLowerCase() as InterviewCategory;
    return {
      category: ['behavioral', 'technical', 'system-design', 'small-talk', 'coding'].includes(value) ? value : 'technical',
      confidence: 0.9
    };
  }

  async nextQuestion(context: InterviewContext) {
  const system = INTERVIEWER_SYSTEM(context);
  const transcript = context.transcript || [];

  const isOpening =
    context.phase === 'opening' ||
    transcript.filter(t => t.speaker === 'candidate').length === 0;

  const heuristic = buildHeuristicQuestion(context);

  // Demo mode
  if (this.llm === 'demo') {
    return heuristic;
  }

  // Keep ALL previous interviewer questions
  const previousQuestions = transcript
    .filter(t => t.speaker === 'interviewer')
    .map(t => normalizeQuestion(t.text))
    .filter(Boolean);

  const recent = transcript.slice(-10);

  const latestAnswer =
    [...recent]
      .reverse()
      .find(t => t.speaker === 'candidate')?.text || '';

  const priorQuestion =
    [...recent]
      .reverse()
      .find(t => t.speaker === 'interviewer')?.text || '';
      console.log("========== INTERVIEW DEBUG ==========");
console.log("LATEST ANSWER:", latestAnswer);
console.log("PREVIOUS QUESTION:", priorQuestion);
console.log("PREVIOUS QUESTIONS:", previousQuestions);
console.log("=====================================");

  const user = isOpening
    ? `
This is the start of the interview.

Ask ONE strong opening question based on the candidate's resume,
job description, role and focus area.

The question must be complete and conversational.

Do NOT ask any question from the previous-question list.

RESUME:
${(context.resume || 'No resume provided.').slice(0, 6000)}

JOB DESCRIPTION:
${(context.jobDescription || 'No job description provided.').slice(0, 6000)}

PREVIOUS QUESTIONS:
${previousQuestions.join('\n')}
`
    : `
Continue this live interview naturally.

RESUME:
${(context.resume || 'No resume provided.').slice(0, 6000)}

JOB DESCRIPTION:
${(context.jobDescription || 'No job description provided.').slice(0, 6000)}

FULL CONVERSATION SO FAR:
${formatTranscript(recent)}

CANDIDATE'S LATEST ANSWER:
"${latestAnswer}"

IMMEDIATELY PRECEDING INTERVIEWER QUESTION:
"${priorQuestion}"

PREVIOUS INTERVIEWER QUESTIONS:
${previousQuestions.join('\n')}

RULES:
- Ask exactly ONE complete interview question.
- The question must be relevant to the candidate's actual resume,
  job description, role/focus, or their latest answer.
- For a follow-up, investigate ONE concrete claim, technology,
  decision, trade-off, metric, failure, or missing detail.
- Do NOT repeat any previous question.
- Do NOT paraphrase a previous question.
- Do NOT ask generic textbook questions when a resume-specific
  question is possible.
- Do NOT invent candidate experience.
- Do NOT provide an answer or hint.
- Return ONLY the question you would say aloud.
`;

  // Generate with a few attempts so duplicates are rejected
  let finalQuestion = '';

  for (let attempt = 0; attempt < 3; attempt++) {
    const generated = await this.generateText(system, user);

    const candidateQuestion = normalizeQuestion(generated || '');

    if (
      candidateQuestion &&
      candidateQuestion.length >= 20 &&
      !/[?!.]$/.test(candidateQuestion) === false
    ) {
      const repeated = isRepeatedQuestion(
        candidateQuestion,
        previousQuestions
      );

      if (!repeated) {
        finalQuestion = candidateQuestion;
        break;
      }
    }

    // Tell the next attempt exactly what went wrong
    previousQuestions.push(candidateQuestion);

  }

  // Safe fallback
  if (!finalQuestion) {
  if (!isRepeatedQuestion(heuristic.question, previousQuestions)) {
    finalQuestion = heuristic.question;
  } else {
    finalQuestion =
      "What specific decision or technical trade-off had the biggest impact on that implementation?";
  }
}
  return {
    question: finalQuestion,
    category: 'technical' as const
  };
}

  async streamQuestion(
  context: InterviewContext,
  onChunk: (chunk: string) => void
) {
  const result = await this.nextQuestion(context);
  const chunks = this.chunkText(result.question);

  for (let i = 0; i < chunks.length; i++) {
    onChunk(chunks[i] + (i < chunks.length - 1 ? ' ' : ''));
    await this.delay(24);
  }
}

  /** Opens a <300ms Deepgram live stream. Caller forwards PCM/WebM audio frames and persists final turns. */
  openTranscriptStream(onTurn: (turn: TranscriptTurn) => void) {
    if (!process.env.DEEPGRAM_API_KEY) return null;
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    const connection = deepgram.listen.live({
      model: 'nova-3',
      language: 'en-US',
      smart_format: true,
      diarize: true,
      interim_results: true,
      endpointing: 300
    });
    connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
      const text = data.channel?.alternatives?.[0]?.transcript?.trim();
      if (text)
        onTurn({
          speaker: data.channel?.alternatives?.[0]?.words?.[0]?.speaker === 0 ? 'interviewer' : 'candidate',
          text,
          isFinal: Boolean(data.is_final),
          at: Date.now()
        });
    });
    return connection;
  }

  private demoClassify(text: string) {
    const value = text.toLowerCase();
    const category: InterviewCategory = /design|scale|architecture/.test(value)
      ? 'system-design'
      : /code|tree|algorithm|complexity/.test(value)
        ? 'coding'
        : /time|conflict|challenge|tell me/.test(value)
          ? 'behavioral'
          : 'technical';
    return { category, confidence: 0.91 };
  }
}
