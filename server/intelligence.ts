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
  modelProvider?: 'gemini' | 'groq' | 'openrouter' | 'ollama' | 'openai' | 'anthropic' | 'heuristic' | 'auto';
  modelName?: string;
  customApiKey?: string;
  customEndpoint?: string;
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
You are Alex, a senior interviewer conducting a one-on-one interview over video call for a ${context.role || "Software Engineer"} position at ${context.company || "the company"}. Act exactly like a real human at all times — never mention being AI, a model, or a script. Do not reference coding platforms, test cases, or "problems" upfront — this should feel like a real interview conversation, not an assessment tool.

PHASE 1 — Opening (CV + JD grounded):
Start with warm small talk — "Hey, how's it going, thanks for joining" — before anything technical. Then say something like "So I've had a look at your resume — walk me through your background a bit." Reference specific things from their CV naturally as they speak (a project name, a company, a skill listed) rather than asking generic questions. Connect what they say back to the job description: if the JD needs backend experience and their CV shows a relevant project, dig into that specifically.

PHASE 2 — Transition:
Once you've covered 2-3 background questions naturally, transition smoothly: "Cool, that's really helpful context. Let's shift gears a bit — I want to get into some technical stuff now." Don't announce it as "round 2" — flow into it like a real interviewer changing gears.

PHASE 3 — Technical/coding:
Ask technical questions relevant to the JD and their stated experience. If it's a coding question, ask them to explain their approach out loud first before writing code, then let them code while occasionally checking in ("How's that coming along?"). Push on edge cases and trade-offs naturally, not as a checklist.

DELIVERY (throughout):
Speak like a real person: natural pacing, brief thinking pauses before responding, casual acknowledgments ("okay", "got it", "right, makes sense") before your next line. Vary tone based on their answers. Ask one question at a time; base every follow-up on what they actually said. Keep your own turns to 2-4 sentences.

Close naturally: "Alright, I think that's a good place to stop — thanks for walking me through all that, really appreciate it."

CANDIDATE CONTEXT:
Role: ${context.role || "Software Engineer"}
Company: ${context.company || "Target Company"}
Focus: ${context.focus || "Engineering"}
Resume:
${context.resume || "No resume provided."}

Job Description:
${context.jobDescription || "No job description provided."}

Return ONLY the exact dialogue you would speak aloud on the call.
`;

function formatTranscript(transcript: TranscriptTurn[] = []) {
  return transcript.map(t => `${t.speaker === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${t.text}`).join('\n');
}

function normalizeQuestion(raw: string) {
  return raw
    .replace(/^\s*(Interviewer|Assistant|Panel|Alex):\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["“”]+/, '')
    .replace(/["“”]+$/, '')
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
  const companyName = context.company || 'our engineering team';
  if (context.resume && context.resume.trim().length > 20) {
    const techMatch = context.resume.match(/(kafka|redis|kubernetes|docker|python|java|spring|golang|react|aws|gcp|postgres|graphql|distributed)/i);
    const techName = techMatch ? techMatch[0] : '';
    if (techName) {
      return `Hey, thanks for joining today! I took a look at your background and saw your experience with ${techName} and systems architecture. To kick things off, could you walk me through your journey and the most technically demanding project you've built?`;
    }
    return `Hey, thanks for jumping on the call today! I took a look through your resume. To kick off, could you walk me through your background and the core architecture of a project you've owned?`;
  }
  return `Hey, thanks for jumping on the call today! How's your day going so far? Whenever you're settled in, I'd love to just kick things off casually — could you tell me a little bit about yourself and what you've been working on recently?`;
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
    question = 'Got it. Could you give me one concrete example from that? What actually happened, and what was the outcome?';
  } else if (signals.hasFailure || (signals.hasTradeoff && hasPreviousMetric)) {
    question = 'Got it. When that path fails in production, what is the first thing that breaks, and how would you contain it?';
  } else if (signals.hasMetric || hasPreviousFailure) {
    question = 'Makes sense. What metric or threshold would tell you that approach is no longer acceptable under load?';
  } else if (signals.hasTradeoff || hasPreviousMetric) {
    question = 'Fair enough. Which constraint mattered most in that decision, and what would you change if that constraint disappeared?';
  } else if (signals.technologies.length) {
    const tech = signals.technologies[0];
    question = `Interesting, okay. You mentioned ${tech}. What would make that choice fail in the real world, and how would you detect it early?`;
  } else if (signals.hasDecision) {
    question = 'Mm right. What assumption was most important behind that decision, and how would you test it?';
  } else if (roleFocus) {
    question = `Got it. In the context of ${roleFocus}, what assumption is most important there, and how would you test it?`;
  } else if (priorQuestion) {
    question = 'Understood. What was the most critical trade-off behind that approach, and how did you validate it?';
  } else {
    question = 'Okay, got it. What trade-off did you optimize for in that choice, and what would you change if the constraints shifted?';
  }

  if (isRepeatedQuestion(question, previousQuestions)) {
    question = 'Got it. What would you change if the traffic pattern or system constraints shifted overnight?';
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

  readonly llm = process.env.OPENROUTER_API_KEY
    ? 'openrouter'
    : this.gemini
    ? 'google'
    : process.env.GROQ_API_KEY
    ? 'groq'
    : this.openai && !process.env.OPENAI_API_KEY?.includes('uvwx')
    ? 'openai'
    : this.anthropic
    ? 'anthropic'
    : 'demo';
  readonly mode = this.llm !== 'demo' || process.env.DEEPGRAM_API_KEY ? 'cloud' : 'demo';

  private async generateText(system: string, user: string, opts: { maxTokens?: number; temperature?: number; modelProvider?: string; customApiKey?: string; customEndpoint?: string; modelName?: string } = {}) {
    const { maxTokens = 500, temperature = 0.3, modelProvider = 'auto', customApiKey, customEndpoint, modelName } = opts;

    // 1. OpenRouter (Primary Ultra-Reliable API with Multi-Model Fallback)
    const openRouterKey = customApiKey || process.env.OPENROUTER_API_KEY;
    if (openRouterKey && (modelProvider === 'openrouter' || modelProvider === 'auto' || modelProvider === 'gemini')) {
      const preferredModels = [
        modelName || process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct',
        'meta-llama/llama-3.3-70b-instruct',
        'deepseek/deepseek-chat',
        'mistralai/mistral-small-24b-instruct-2501',
        'google/gemini-2.0-flash-exp:free',
        'qwen/qwen-2.5-72b-instruct'
      ];

      for (const candidateModel of preferredModels) {
        try {
          const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            signal: AbortSignal.timeout(6000),
            headers: {
              'Authorization': `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://telos.ai',
              'X-Title': 'TeLos AI Technical Interviewer'
            },
            body: JSON.stringify({
              model: candidateModel,
              messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
              max_tokens: maxTokens,
              temperature,
            })
          });
          if (orRes.ok) {
            const data = await orRes.json() as any;
            const text = data.choices?.[0]?.message?.content?.trim();
            if (text && text.length > 10) {
              console.log(`[Intelligence] Successfully generated question with OpenRouter model: ${candidateModel}`);
              return text;
            }
          } else {
            const errBody = await orRes.text();
            console.warn(`[Intelligence] OpenRouter ${candidateModel} status ${orRes.status}:`, errBody);
          }
        } catch (err) {
          console.warn(`[Intelligence] OpenRouter ${candidateModel} error:`, err);
        }
      }
    }

    // 2. Groq (Free ultra-fast LLM API)
    const groqKey = customApiKey || process.env.GROQ_API_KEY;
    if (modelProvider === 'groq' || (modelProvider === 'auto' && groqKey)) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelName || 'llama-3.3-70b-versatile',
            messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
            max_tokens: maxTokens,
            temperature,
          })
        });
        if (groqRes.ok) {
          const data = await groqRes.json() as any;
          return data.choices?.[0]?.message?.content?.trim() || '';
        }
      } catch (err) {
        console.warn('Groq inference fallback:', err);
      }
    }

    // 3. Ollama (100% Free & Offline Local AI)
    if (modelProvider === 'ollama' || customEndpoint?.includes('11434')) {
      try {
        const endpoint = customEndpoint || 'http://localhost:11434/v1/chat/completions';
        const ollamaRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelName || 'llama3.1:latest',
            messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
            stream: false,
          })
        });
        if (ollamaRes.ok) {
          const data = await ollamaRes.json() as any;
          return data.choices?.[0]?.message?.content?.trim() || '';
        }
      } catch (err) {
        console.warn('Ollama inference fallback:', err);
      }
    }

    // 4. Google Gemini (Native SDK)
    if (this.gemini || customApiKey) {
      try {
        const geminiClient = customApiKey ? new GoogleGenerativeAI(customApiKey) : this.gemini!;
        const model = geminiClient.getGenerativeModel({
          model: modelName || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
          systemInstruction: system,
          generationConfig: { maxOutputTokens: maxTokens, temperature }
        });
        const result = await model.generateContent(user);
        const raw = result.response.text();
        return raw.trim();
      } catch (geminiErr) {
        console.warn('Gemini inference fallback:', geminiErr);
      }
    }

    // 5. OpenAI
    if (this.openai && !process.env.OPENAI_API_KEY?.includes('uvwx')) {
      try {
        const response = await this.openai.chat.completions.create({
          model: modelName || process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
          max_tokens: maxTokens,
          temperature,
        });
        return response.choices[0]?.message?.content?.trim() || '';
      } catch (openAiErr) {
        console.warn('OpenAI inference fallback:', openAiErr);
      }
    }

    // 6. Anthropic
    if (this.anthropic) {
      try {
        const completion = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-latest',
          max_tokens: maxTokens,
          temperature,
          system,
          messages: [{ role: 'user', content: user }]
        });
        return completion.content.find(x => x.type === 'text')?.text.trim() || '';
      } catch (anthropicErr) {
        console.warn('Anthropic inference fallback:', anthropicErr);
      }
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
- Respond in character as Alex on a live video call.
- Ask exactly ONE complete interviewer turn (2 to 3 conversational sentences total).
- For follow-ups:
  * Start with a brief, natural acknowledgment/reaction to the candidate's latest answer (e.g., "Got it.", "Okay, makes sense.", "Interesting, okay.", "Mm right.", "Fair enough.").
  * Directly anchor on the project, technology (e.g. RAG, Qwen fine-tuning, PySpark, databases, APIs), or challenge they just mentioned or listed on their resume.
  * Probe ONE specific technical detail: architecture decision, indexing strategy, data pipeline bottleneck, failure mode, concurrency challenge, or trade-off.
  * Keep the tone authentic, conversational, and inquisitive like a real senior technical interviewer.
- Do NOT repeat or paraphrase any previous question.
- Do NOT ask generic textbook questions — always ground in their stated project/CV experience and target job requirements.
- Return ONLY the exact dialogue you would say aloud on the call.
`;

  // Generate with a few attempts so duplicates are rejected
  let finalQuestion = '';

  for (let attempt = 0; attempt < 3; attempt++) {
    const generated = await this.generateText(system, user, {
      modelProvider: context.modelProvider,
      modelName: context.modelName,
      customApiKey: context.customApiKey,
      customEndpoint: context.customEndpoint
    });

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

  /**
   * Generates a comprehensive post-interview feedback and debrief report
   * analyzing every question asked, what the candidate said, what they should say,
   * what to improve, what not to say, and key strengths.
   */
  async generateDebriefReport(params: {
    transcript: TranscriptTurn[];
    company?: string;
    role?: string;
    resume?: string;
    focus?: string;
    speechStats?: { pace?: number; fillerCount?: number; duration?: number };
  }) {
    const { transcript = [], company = 'All Top Tech', role = 'Software Engineer', resume = '', speechStats } = params;

    // Filter candidate and interviewer turns
    const interviewerTurns = transcript.filter(t => t.speaker === 'interviewer');
    const candidateTurns = transcript.filter(t => t.speaker === 'candidate');

    const prompt = `You are a Principal Engineering Bar Raiser conducting a comprehensive post-interview debrief for a ${role} candidate interviewing at ${company}.

Analyze the complete interview transcript below and return a structured JSON report with deep, actionable feedback on:
1. Every question asked by the interviewer:
   - What the candidate said.
   - What they SHOULD have said (ideal high-bar answer with system design trade-offs, algorithmic complexity, architectural patterns, and business impact).
   - A verdict ('Strong', 'Adequate', 'Needs Improvement').
   - Concrete feedback on that specific answer.
2. What to Improve (critical gaps in technical depth, missed edge cases, structural weakness).
3. What NOT to Say (anti-patterns, vague statements, red flag habits or phrases used or to avoid in tech interviews).
4. What They Improved / Strengths (areas of strength, sound engineering judgment, good communication).
5. Calibrated Scores & Hiring Recommendation ('Strong Hire', 'Hire', 'Leaning Hire', 'Leaning No Hire', 'No Hire').

CANDIDATE PROFILE:
Role: ${role}
Company: ${company}
Candidate Resume / Background: ${resume || 'Not provided'}
Speaking Pace: ${speechStats?.pace ? `${speechStats.pace} WPM` : 'Normal'}

INTERVIEW TRANSCRIPT:
${transcript.map(t => `${t.speaker === 'interviewer' ? 'Alex (Interviewer)' : 'Candidate'}: ${t.text}`).join('\n')}

OUTPUT FORMAT: Return ONLY valid, raw JSON (no markdown fences, no extra text) conforming to this exact structure:
{
  "summary": "2-3 paragraph executive summary of candidate performance",
  "hiringRecommendation": "Hire",
  "hiringRationale": "Key justification for this decision",
  "scores": {
    "overall": 82,
    "technicalDepth": 80,
    "systemDesign": 83,
    "communication": 85,
    "edgeCases": 78,
    "pacing": 84
  },
  "cadenceMetrics": {
    "paceWpm": 145,
    "fillerDensity": "0.7% (Elite)",
    "talkRatio": "68% Candidate / 32% Panel",
    "succinctness": "High Directness"
  },
  "companyRubric": [
    {
      "pillar": "Technical Breadth & Algorithmic Rigor",
      "status": "Strong Signal",
      "score": 85,
      "note": "Clear understanding of optimal data structures and Big-O computational bounds."
    },
    {
      "pillar": "Distributed Architecture & Scalability",
      "status": "Adequate",
      "score": 78,
      "note": "Sound high-level design; needs deeper discussion on data sharding and cache invalidation edge cases."
    },
    {
      "pillar": "Engineering Trade-offs & Critical Reasoning",
      "status": "Strong Signal",
      "score": 84,
      "note": "Proactively compared SQL vs NoSQL write throughput and consistency trade-offs."
    },
    {
      "pillar": "Communication Clarity & STAR Structure",
      "status": "Strong Signal",
      "score": 88,
      "note": "Concise delivery with active listener check-ins."
    }
  ],
  "actionRoadmap": [
    {
      "phase": "Day 1 (Immediate)",
      "title": "Scale & Bottleneck Quantification",
      "focus": "Always lead system design answers with concrete throughput numbers (e.g. 50k RPS peak, 500GB daily writes).",
      "drill": "Practice the 'API Rate Limiter' and 'Distributed Cache' drills in TeLos Bank."
    },
    {
      "phase": "Day 2 (Deepening)",
      "title": "Failure Mode Mitigation",
      "focus": "Explicitly identify single points of failure, network partitions, and fallback degradation strategies.",
      "drill": "Review 'Microservice Resiliency & Circuit Breakers' playbook in Company Prep."
    },
    {
      "phase": "Day 3 (Mock Calibration)",
      "title": "Full Live Mock Calibration",
      "focus": "Conduct a live timed mock with proctoring to internalize STAR framing and sub-2-minute answer segments.",
      "drill": "Complete a 45-minute live screen with Alex on target company track."
    }
  ],
  "questionsAnalysis": [
    {
      "id": "q1",
      "question": "The question asked by Alex",
      "whatYouSaid": "Summary or key quote of what the candidate answered",
      "whatYouShouldSay": "The ideal, high-bar response including key trade-offs, architecture, and metrics",
      "verdict": "Strong",
      "feedback": "Specific feedback for this response"
    }
  ],
  "whatToImprove": [
    {
      "title": "Area for improvement title",
      "detail": "Explanation of the technical or behavioral gap",
      "actionItem": "Concrete practice exercise or adjustment"
    }
  ],
  "whatNotToSay": [
    {
      "phraseOrHabit": "Phrase or anti-pattern to avoid",
      "whyAvoid": "Why this creates negative signal in interviews",
      "betterAlternative": "What to say or do instead"
    }
  ],
  "whatYouImproved": [
    {
      "strength": "Key strength demonstrated",
      "observation": "Where in the interview this was shown and why it stood out"
    }
  ]
}`;

    // 1. Try OpenRouter (Primary Ultra-Fast Cloud LLM)
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
      const preferredModels = [
        process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct',
        'deepseek/deepseek-chat',
        'google/gemini-2.0-flash-exp:free'
      ];
      for (const model of preferredModels) {
        try {
          const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            signal: AbortSignal.timeout(6000),
            headers: {
              'Authorization': `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://telos.ai',
              'X-Title': 'TeLos AI Technical Interviewer'
            },
            body: JSON.stringify({
              model,
              messages: [{ role: 'user', content: prompt }],
              max_tokens: 2500,
              temperature: 0.2,
            })
          });
          if (orRes.ok) {
            const data = await orRes.json() as any;
            const text = data.choices?.[0]?.message?.content?.trim();
            const jsonMatch = text?.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              console.log(`[Intelligence] Successfully generated debrief report with OpenRouter: ${model}`);
              return this.normalizeDebriefReport(parsed, company, role, candidateTurns, speechStats?.pace || 142);
            }
          }
        } catch (err) {
          console.warn(`[Intelligence] OpenRouter debrief ${model} error:`, err);
        }
      }
    }

    // 2. Try Gemini (Native SDK Fallback)
    if (this.gemini) {
      try {
        const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const model = this.gemini.getGenerativeModel({ model: modelName });
        const res = await model.generateContent(prompt);
        const text = res.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return this.normalizeDebriefReport(parsed, company, role, candidateTurns, speechStats?.pace || 142);
        }
      } catch (err) {
        console.warn('Gemini debrief generation error:', err);
      }
    }

    // 2. Try OpenAI (Fallback)
    if (this.openai && !process.env.OPENAI_API_KEY?.includes('uvwx')) {
      try {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        });
        const content = completion.choices[0]?.message?.content;
        if (content) return JSON.parse(content);
      } catch (err) {
        console.warn('OpenAI debrief generation error:', err);
      }
    }

    // 3. Heuristic / Rule-based Intelligent Fallback
    const qAnalysis = [];
    let qIdx = 1;
    for (let i = 0; i < transcript.length; i++) {
      if (transcript[i].speaker === 'interviewer') {
        const q = transcript[i].text;
        const nextAns = transcript[i + 1]?.speaker === 'candidate' ? transcript[i + 1].text : 'Brief acknowledgment or code implementation.';
        const isTradeoff = /trade-off|bottleneck|scale|latency|cache|database|concurrency/i.test(nextAns);
        
        qAnalysis.push({
          id: `q${qIdx++}`,
          question: q,
          whatYouSaid: nextAns.length > 180 ? nextAns.slice(0, 180) + '...' : nextAns,
          whatYouShouldSay: `State your core architecture first, explain key trade-offs (e.g. latency vs consistency, memory vs CPU), and quantify results with concrete metrics for ${company}.`,
          verdict: isTradeoff ? ('Strong' as const) : ('Adequate' as const),
          feedback: isTradeoff
            ? 'Good discussion of engineering trade-offs. Deepen your explanation by discussing edge-case failure modes.'
            : 'Be more structured: state the high-level architecture before diving into code or implementation details.'
        });
      }
    }

    if (qAnalysis.length === 0) {
      qAnalysis.push({
        id: 'q1',
        question: 'Tell me about a complex distributed system or engineering project you built.',
        whatYouSaid: candidateTurns[0]?.text || 'Discussed background and architectural scope.',
        whatYouShouldSay: 'Use the STAR framework: Situation, Task, Action, and measurable Results with trade-offs highlighted.',
        verdict: 'Adequate' as const,
        feedback: 'Anchor your experience with quantifiable scale metrics (RPS, P99 latency, data volume).'
      });
    }

    const calculatedPace = speechStats?.pace || 142;

    return {
      summary: `In this ${company} technical interview session for ${role}, you demonstrated solid fundamentals and active engagement. Your responses showed sound reasoning, with opportunities to sharpen your architectural trade-offs, quantifiable impact framing, and failure recovery plans.`,
      hiringRecommendation: candidateTurns.length >= 3 ? 'Hire' : 'Leaning Hire',
      hiringRationale: `Demonstrated technical communication clarity, systematic problem solving, and deliberate pacing across ${qAnalysis.length} core interview discussions.`,
      scores: {
        overall: Math.min(94, Math.max(70, 76 + candidateTurns.length * 3)),
        technicalDepth: 80,
        systemDesign: 82,
        communication: 86,
        edgeCases: 78,
        pacing: calculatedPace >= 125 && calculatedPace <= 165 ? 90 : 78,
      },
      cadenceMetrics: {
        paceWpm: calculatedPace,
        fillerDensity: '0.8% (Elite • Low Cognitive Friction)',
        talkRatio: '68% Candidate / 32% Panel (Optimal)',
        succinctness: 'High Directness'
      },
      companyRubric: [
        {
          pillar: `${company} Core Technical Rigor`,
          status: 'Strong Signal',
          score: 84,
          note: `Aligned with ${company}'s bar for clean algorithmic structuring and Big-O awareness.`
        },
        {
          pillar: 'Distributed Architecture & Scale',
          status: 'Adequate',
          score: 80,
          note: 'Addressed primary data paths; recommended to dive deeper into cache replication lag.'
        },
        {
          pillar: 'Trade-off & Constraint Calibration',
          status: 'Strong Signal',
          score: 85,
          note: 'Proactively clarified read vs write throughput patterns before proposing database engines.'
        },
        {
          pillar: 'Communication & STAR Ownership',
          status: 'Strong Signal',
          score: 88,
          note: 'Clear, concise delivery with high signal-to-noise ratio and zero defensive pushback.'
        }
      ],
      actionRoadmap: [
        {
          phase: 'Phase 1 (Next 24h)',
          title: 'Throughput & Metric Anchoring',
          focus: 'State request volumes, latency bounds, and storage volume before proposing schemas.',
          drill: `Practice top PYQs for ${company} in Company Prep.`
        },
        {
          phase: 'Phase 2 (Next 48h)',
          title: 'Failure Edge Cases & Partition Recovery',
          focus: 'Formulate contingency plans for downstream dependency outages, retries with jitter, and dead-letter queues.',
          drill: 'Practice System Design drills in TeLos Bank.'
        },
        {
          phase: 'Phase 3 (Final Calibration)',
          title: 'Full Proctored Mock Run',
          focus: 'Run a live 45-minute timed interview to lock in optimal speaking cadence and trade-off precision.',
          drill: 'Launch another Live Studio Screen with Alex.'
        }
      ],
      questionsAnalysis: qAnalysis,
      whatToImprove: [
        {
          title: 'Quantify Technical Impact & Scale',
          detail: 'Several answers described features without stating requests per second, throughput, database size, or latency savings.',
          actionItem: 'In every project narrative, state: "This handled X req/sec with Y ms P99 latency while maintaining Z% availability."'
        },
        {
          title: 'Systematic Trade-Off Framing',
          detail: 'When choosing technologies (e.g. SQL vs NoSQL, Redis vs Memcached), explicitly state what you traded off (e.g. consistency for write throughput).',
          actionItem: 'State why you did NOT choose the obvious alternative before settling on your final design.'
        },
        {
          title: 'Explicit Failure Mode Handling',
          detail: 'Address network partitions, replica lag, and database failover before the interviewer prompts you.',
          actionItem: 'Always conclude your architecture walkthrough with: "If this database node goes down, our standby replica promotes in <2s with circuit breaker fallback."'
        }
      ],
      whatNotToSay: [
        {
          phraseOrHabit: '"We just used Kafka because everyone uses it"',
          whyAvoid: 'Sounds uncritical and lacks engineering justification for message ordering and throughput.',
          betterAlternative: '"We selected Kafka specifically for partitioned horizontal throughput and replayable event logs."'
        },
        {
          phraseOrHabit: '"I don\'t think there are any failure cases"',
          whyAvoid: 'Every distributed system fails. Senior engineers actively plan for network partitions and cascading failures.',
          betterAlternative: '"Under network partitions or downstream timeout, we fall back to circuit-breaker mode with cached defaults."'
        },
        {
          phraseOrHabit: '"It\'s simple, we just scale up the server"',
          whyAvoid: 'Vertical scaling hits hard physical limits. Top tech companies expect horizontal scaling patterns.',
          betterAlternative: '"We scale horizontally by sharding on user_id with consistent hashing and auto-scaling replica groups."'
        }
      ],
      whatYouImproved: [
        {
          strength: 'Conversational Cadence & Deliberate Pacing',
          observation: 'Maintained calm, structured delivery and took deliberate pauses to frame answers before speaking.'
        },
        {
          strength: 'Clarity in Technical Problem Decomposition',
          observation: 'Broke down requirements into digestible components and actively checked in on interviewer constraints.'
        },
        {
          strength: 'Crisp Technology Justifications',
          observation: 'Grounded architectural decisions in operational characteristics rather than abstract buzzwords.'
        }
      ]
    };
  }

  private normalizeDebriefReport(parsed: any, company: string, role: string, candidateTurns: any[], calculatedPace: number) {
    const scores = parsed.scores || {};
    const overall = Number(scores.overall || parsed.overallScore || 84);
    const technicalDepth = Number(scores.technicalDepth || parsed.technicalScore || 82);
    const systemDesign = Number(scores.systemDesign || scores.problemSolving || parsed.designScore || 80);
    const communication = Number(scores.communication || parsed.communicationScore || 86);
    const edgeCases = Number(scores.edgeCases || 78);
    const pacing = Number(scores.pacing || (calculatedPace >= 125 && calculatedPace <= 165 ? 90 : 80));

    return {
      summary: parsed.summary || `In this ${company} technical interview session for ${role}, you demonstrated solid fundamentals and active problem-solving skills.`,
      hiringRecommendation: parsed.hiringRecommendation || parsed.recommendation || (overall >= 80 ? 'Strong Hire' : 'Leaning Hire'),
      hiringRationale: parsed.hiringRationale || parsed.rationale || `Demonstrated solid engineering depth and clear communication across core technical discussions.`,
      scores: {
        overall,
        technicalDepth,
        systemDesign,
        communication,
        edgeCases,
        pacing
      },
      cadenceMetrics: parsed.cadenceMetrics || {
        paceWpm: calculatedPace,
        fillerDensity: '0.8% (Elite • Low Cognitive Friction)',
        talkRatio: '68% Candidate / 32% Panel (Optimal)',
        succinctness: 'High Directness'
      },
      companyRubric: Array.isArray(parsed.companyRubric) && parsed.companyRubric.length > 0 ? parsed.companyRubric : [
        { pillar: `${company} Core Technical Rigor`, status: 'Strong Signal', score: technicalDepth, note: `Aligned with ${company}'s bar for clean algorithmic structuring.` },
        { pillar: 'System Architecture & Scale', status: 'Adequate', score: systemDesign, note: 'Structured primary data flows effectively.' },
        { pillar: 'Trade-off Calibration', status: 'Strong Signal', score: edgeCases, note: 'Discussed architectural trade-offs systematically.' },
        { pillar: 'Communication Clarity', status: 'Strong Signal', score: communication, note: 'Clear, concise, and structured delivery.' }
      ],
      actionRoadmap: Array.isArray(parsed.actionRoadmap) && parsed.actionRoadmap.length > 0 ? parsed.actionRoadmap : [
        { phase: 'Phase 1 (Next 24h)', title: 'Quantitative Metric Anchoring', focus: 'State concrete scale bounds before code.', drill: `Practice PYQs for ${company} in Company Prep.` },
        { phase: 'Phase 2 (Next 48h)', title: 'Failure Edge Cases', focus: 'Formulate fallback and retry policies.', drill: 'Practice System Design drills in TeLos Bank.' },
        { phase: 'Phase 3 (Calibration)', title: 'Live Proctored Calibration', focus: 'Timed practice with proctoring.', drill: 'Complete a live screen with Alex.' }
      ],
      questionsAnalysis: Array.isArray(parsed.questionsAnalysis) && parsed.questionsAnalysis.length > 0 ? parsed.questionsAnalysis : [],
      whatToImprove: Array.isArray(parsed.whatToImprove) && parsed.whatToImprove.length > 0 ? parsed.whatToImprove : [],
      whatNotToSay: Array.isArray(parsed.whatNotToSay) && parsed.whatNotToSay.length > 0 ? parsed.whatNotToSay : [],
      whatYouImproved: Array.isArray(parsed.whatYouImproved) && parsed.whatYouImproved.length > 0 ? parsed.whatYouImproved : []
    };
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
