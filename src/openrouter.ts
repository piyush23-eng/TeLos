import { safeStorage } from './apiConfig';

export interface OpenRouterTelemetry {
  calledAt: number;
  latencyMs: number;
  model: string;
  status: number;
  ok: boolean;
  endpoint: string;
  responsePreview: string;
  error?: string;
}

export function getStoredOpenRouterKey(): string {
  const custom = safeStorage.get('telos_openrouter_api_key');
  if (custom && custom.trim()) return custom.trim();
  const envKey = (import.meta.env.VITE_OPENROUTER_API_KEY as string) || '';
  return envKey.trim();
}

export function setStoredOpenRouterKey(key: string): void {
  safeStorage.set('telos_openrouter_api_key', key.trim());
}

export function getStoredOpenRouterModel(): string {
  const custom = safeStorage.get('telos_openrouter_model');
  if (custom && custom.trim()) return custom.trim();
  const envModel = (import.meta.env.VITE_OPENROUTER_MODEL as string) || '';
  return envModel.trim() || 'nex-agi/nex-n2.5-mini:free';
}

export function setStoredOpenRouterModel(model: string): void {
  safeStorage.set('telos_openrouter_model', model.trim());
}

export async function testDirectOpenRouterCall(
  apiKey?: string,
  model?: string
): Promise<OpenRouterTelemetry> {
  const key = apiKey || getStoredOpenRouterKey();
  const activeModel = model || getStoredOpenRouterModel();
  const t0 = Date.now();

  if (!key) {
    return {
      calledAt: t0,
      latencyMs: 0,
      model: activeModel,
      status: 400,
      ok: false,
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      responsePreview: '',
      error: 'No OpenRouter API key found. Enter a valid key in Settings or .env.'
    };
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://telos.ai',
        'X-Title': 'TeLos Live Interviewer Diagnostic'
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: 'system', content: 'You are Alex Rivera, an experienced technical interviewer.' },
          { role: 'user', content: 'Say "Direct OpenRouter connection verified successfully." in exactly 5 words.' }
        ],
        max_tokens: 40,
        temperature: 0.1
      })
    });

    const latencyMs = Date.now() - t0;
    const ok = res.ok;
    const status = res.status;

    if (!ok) {
      const errBody = await res.text();
      return {
        calledAt: t0,
        latencyMs,
        model: activeModel,
        status,
        ok: false,
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        responsePreview: '',
        error: `OpenRouter returned status ${status}: ${errBody}`
      };
    }

    const data = await res.json();
    let text = (data.choices?.[0]?.message?.content || '').trim();
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/^Reasoning:[\s\S]*?\n\n/i, '').trim();

    return {
      calledAt: t0,
      latencyMs,
      model: activeModel,
      status,
      ok: true,
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      responsePreview: text
    };
  } catch (err: any) {
    return {
      calledAt: t0,
      latencyMs: Date.now() - t0,
      model: activeModel,
      status: 0,
      ok: false,
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      responsePreview: '',
      error: err?.message || 'Network fetch failed'
    };
  }
}

export async function generateQuestionDirectly(opts: {
  systemPrompt: string;
  userPrompt: string;
  apiKey?: string;
  model?: string;
}): Promise<{ question: string; telemetry: OpenRouterTelemetry }> {
  const key = opts.apiKey || getStoredOpenRouterKey();
  const primaryModel = opts.model || getStoredOpenRouterModel();
  const candidateModels = [
    primaryModel,
    'nex-agi/nex-n2.5-mini:free',
    'openrouter/free',
    'inclusionai/ling-3.0-flash-vl:free',
    'liquid/lfm-2.5-2.6b:free'
  ];

  // Try candidate models in order
  for (const candidate of candidateModels) {
    const t0 = Date.now();
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://telos.ai',
          'X-Title': 'TeLos Live Video Technical Interview'
        },
        body: JSON.stringify({
          model: candidate,
          messages: [
            { role: 'system', content: opts.systemPrompt },
            { role: 'user', content: opts.userPrompt }
          ],
          max_tokens: 300,
          temperature: 0.3
        })
      });

      const latencyMs = Date.now() - t0;
      if (res.ok) {
        const data = await res.json();
        let text = (data.choices?.[0]?.message?.content || '').trim();
        text = text
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/```[\s\S]*?```/g, '')
          .replace(/^\s*(Interviewer|Assistant|Alex):\s*/i, '')
          .replace(/^Reasoning:[\s\S]*?\n\n/i, '')
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/^["“”]+/, '')
          .replace(/["“”]+$/, '')
          .trim();

        if (text && text.length > 15) {
          return {
            question: text,
            telemetry: {
              calledAt: t0,
              latencyMs,
              model: candidate,
              status: res.status,
              ok: true,
              endpoint: 'https://openrouter.ai/api/v1/chat/completions',
              responsePreview: text
            }
          };
        }
      }
    } catch {
      // Continue to next candidate model
    }
  }

  throw new Error('All OpenRouter direct candidate models failed or returned empty response.');
}

export async function generateDebriefDirectly(opts: {
  transcript: { speaker: string; text: string }[];
  company?: string;
  role?: string;
  resume?: string;
  focus?: string;
  speechStats?: { pace?: number; fillerCount?: number; duration?: number };
  apiKey?: string;
  model?: string;
}): Promise<any> {
  const key = opts.apiKey || getStoredOpenRouterKey();
  const primaryModel = opts.model || getStoredOpenRouterModel();
  const company = opts.company || 'Top Tech';
  const role = opts.role || 'Software Engineer';
  const candidateTurns = opts.transcript.filter(t => t.speaker === 'candidate' || t.speaker === 'YOU');
  const candText = candidateTurns.map(t => t.text).join(' ').trim();
  const candWords = candText ? candText.split(/\s+/).length : 0;

  const prompt = `You are an elite Principal Engineering Bar Raiser conducting a comprehensive, highly authentic post-interview debrief for a candidate interviewing for ${role} at ${company}.

CRITICAL INSTRUCTIONS FOR ACCURACY (ZERO HYPOTHETICAL / ZERO CANNED DATA):
1. Evaluate ONLY what the candidate ACTUALLY said in the transcript below. Do NOT invent hypothetical tools, architectures, or topics unless they were explicitly mentioned in the transcript.
2. CITATIONS & REAL PAIRING: In "questionsAnalysis", you must pair every single question Alex asked with what the candidate actually replied. Quote or summarize their REAL answer.
3. RIGOROUS & HONEST CALIBRATION:
   - If candidate gave brief/vague answers: Assign realistic low scores (35-55) and verdict "Needs Improvement".
   - If candidate provided clear, structured answers with architectural trade-offs: Assign realistic scores (75-92) and verdict "Strong" or "Adequate".
4. "whatYouShouldSay": Provide the ideal, high-bar response specific to THAT exact question for ${company}.
5. "whatToImprove": 2-4 critical gaps derived directly from the candidate's actual answers.
6. "whatNotToSay": 2-3 anti-patterns, vague statements, or habits from this session to avoid at ${company}.
7. "whatYouImproved": Specific genuine strengths demonstrated in this transcript.

FULL INTERVIEW TRANSCRIPT:
${opts.transcript.map((t, i) => `[Turn ${i + 1}] ${t.speaker === 'interviewer' || t.speaker === 'PANEL' ? 'Alex (Interviewer)' : 'Candidate'}: ${t.text}`).join('\n')}

OUTPUT FORMAT: Return ONLY valid, raw JSON (no markdown fences, no formatting) conforming exactly to this structure:
{
  "summary": "2-3 paragraphs analyzing this specific candidate's performance, strengths, and specific technical gaps in this interview",
  "hiringRecommendation": "Strong Hire" | "Hire" | "Leaning Hire" | "Leaning No Hire" | "No Hire",
  "hiringRationale": "Key justification based strictly on the transcript",
  "scores": {
    "overall": 0-100,
    "technicalDepth": 0-100,
    "systemDesign": 0-100,
    "communication": 0-100,
    "edgeCases": 0-100,
    "pacing": 0-100
  },
  "companyRubric": [
    {
      "pillar": "${company} Core Technical Rigor",
      "status": "Strong Signal" | "Adequate" | "Needs Improvement",
      "score": 0-100,
      "note": "Observation based on candidate's actual answers"
    }
  ],
  "actionRoadmap": [
    {
      "phase": "Day 1 (Immediate Focus)",
      "title": "Topic to strengthen",
      "focus": "Specific actionable concept to master",
      "drill": "Concrete practice exercise"
    }
  ],
  "questionsAnalysis": [
    {
      "id": "q1",
      "question": "The question asked by Alex",
      "whatYouSaid": "Quote or close summary of what candidate actually said",
      "whatYouShouldSay": "The ideal, high-bar response tailored to ${company}",
      "verdict": "Strong" | "Adequate" | "Needs Improvement",
      "feedback": "Concrete critique of their actual answer"
    }
  ],
  "whatToImprove": [
    {
      "title": "Title of gap",
      "detail": "Detailed explanation referencing their response",
      "actionItem": "Concrete practice drill"
    }
  ],
  "whatNotToSay": [
    {
      "phraseOrHabit": "Phrase or anti-pattern to avoid",
      "whyAvoid": "Why this creates negative signal",
      "betterAlternative": "What to say or do instead"
    }
  ],
  "whatYouImproved": [
    {
      "strength": "Key strength demonstrated",
      "observation": "Where in the interview this was shown"
    }
  ]
}`;

  const candidateModels = [
    primaryModel,
    'nex-agi/nex-n2.5-mini:free',
    'openrouter/free',
    'inclusionai/ling-3.0-flash-vl:free',
    'liquid/lfm-2.5-2.6b:free'
  ];

  for (const candidate of candidateModels) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://telos.ai',
          'X-Title': 'TeLos Post-Interview Debrief Analysis'
        },
        body: JSON.stringify({
          model: candidate,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 3000,
          temperature: 0.2
        })
      });

      if (res.ok) {
        const data = await res.json();
        let text = (data.choices?.[0]?.message?.content || '').trim();
        text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/^Reasoning:[\s\S]*?\n\n/i, '').trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed;
        }
      }
    } catch {
      // Continue to next candidate model
    }
  }

  throw new Error('All OpenRouter direct debrief candidate models failed.');
}
