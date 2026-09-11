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
