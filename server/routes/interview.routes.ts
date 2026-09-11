import { Router } from 'express';
import { IntelligenceProvider } from '../intelligence';
import { interviewRateLimiter } from '../middleware/rateLimiter';
import { personas } from '../mockData';
import { config } from '../lib/config';

export const interviewRouter = Router();
export const intelligence = new IntelligenceProvider();

// Mock personas list
interviewRouter.get('/personas', (_req, res) => {
  res.json({ personas });
});

// Classify candidate input intent
interviewRouter.post('/classify', async (req, res, next) => {
  try {
    res.json(await intelligence.classify(String(req.body.text || '')));
  } catch (error) {
    next(error);
  }
});

// Diagnostic check for LLM connection
interviewRouter.get('/test', async (_req, res) => {
  try {
    const result = await intelligence.testRealApiCall();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ realApiCallMade: true, error: error?.message || String(error) });
  }
});

// Generate next interview question (Synchronous)
interviewRouter.post('/next', interviewRateLimiter, async (req, res, next) => {
  try {
    res.json(await intelligence.nextQuestion(req.body));
  } catch (error) {
    next(error);
  }
});

// Stream next interview question via SSE
interviewRouter.post('/next/stream', interviewRateLimiter, async (req, res, next) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    await intelligence.streamQuestion(
      req.body,
      (chunk: string) => {
        res.write(`event: delta\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
      },
      (meta: any) => {
        res.write(`event: meta\ndata: ${JSON.stringify(meta)}\n\n`);
      }
    );
    res.write('event: done\ndata: {}\n\n');
    res.end();
  } catch (error) {
    next(error);
  }
});

// Debrief & Evaluation Scorecard
interviewRouter.post('/debrief', interviewRateLimiter, async (req, res, next) => {
  try {
    const { transcript = [], company, role, resume, focus, speechStats, customApiKey, modelName } = req.body;
    const report = await intelligence.generateDebriefReport({
      transcript,
      company,
      role,
      resume,
      focus,
      speechStats,
      customApiKey,
      modelName
    });
    return res.json(report);
  } catch (error) {
    next(error);
  }
});

// Alias for debrief
interviewRouter.post('/report', async (req, res, next) => {
  try {
    const { transcript = [], company, role, resume, focus, speechStats, customApiKey, modelName } = req.body;
    const report = await intelligence.generateDebriefReport({
      transcript,
      company,
      role,
      resume,
      focus,
      speechStats,
      customApiKey,
      modelName
    });
    return res.json(report);
  } catch (error) {
    next(error);
  }
});

// Text-to-Speech Engine (ElevenLabs / Deepgram / OpenAI fallback)
interviewRouter.post('/tts', async (req, res, next) => {
  try {
    let text = String(req.body.text || '').trim();
    if (!text) {
      return res.status(400).send('Text is required');
    }

    // Natural Pacing: Clean formatting for realistic conversational cadence
    text = text
      .replace(/^(okay|got it|makes sense|alright|cool|right),?\s+/i, '$1... ')
      .replace(/(\w)—(\w)/g, '$1 — $2');

    const elevenLabsApiKey = config.elevenLabsApiKey || (req.headers['x-elevenlabs-key'] as string);
    const elevenLabsVoiceId = String(req.body.voiceId || config.elevenLabsVoiceId);

    // 1. ElevenLabs Ultra-Realistic Conversational Voice Engine
    if (elevenLabsApiKey) {
      try {
        const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}?output_format=mp3_44100_128`, {
          method: 'POST',
          headers: {
            'xi-api-key': elevenLabsApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
              stability: 0.38,
              similarity_boost: 0.80,
              style: 0.28,
              use_speaker_boost: true,
            },
          }),
        });

        if (elevenRes.ok) {
          const buffer = Buffer.from(await elevenRes.arrayBuffer());
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Length', buffer.length);
          return res.send(buffer);
        }
      } catch (elevenErr) {
        console.warn('ElevenLabs TTS error:', elevenErr);
      }
    }

    // 2. Deepgram Aura TTS Fallback
    if (config.deepgramApiKey) {
      try {
        const deepgramVoice = req.body.voice === 'asteria' ? 'aura-asteria-en' : 'aura-arcas-en';
        const dgRes = await fetch(`https://api.deepgram.com/v1/speak?model=${deepgramVoice}&encoding=mp3`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${config.deepgramApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });

        if (dgRes.ok) {
          const buffer = Buffer.from(await dgRes.arrayBuffer());
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Length', buffer.length);
          return res.send(buffer);
        }
      } catch (dgErr) {
        console.warn('Deepgram TTS fallback:', dgErr);
      }
    }

    // 3. OpenAI TTS Fallback
    if (config.openaiApiKey && !config.openaiApiKey.includes('uvwx')) {
      const requestedVoice = String(req.body.voice || 'alloy');
      const voice = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].includes(requestedVoice) ? requestedVoice : 'alloy';

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice,
          input: text,
          speed: 0.98,
          response_format: 'mp3',
        }),
      });

      if (response.ok) {
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', audioBuffer.length);
        return res.send(audioBuffer);
      }
    }

    res.status(503).json({ error: 'Cloud TTS unavailable, using browser natural neural synthesis.' });
  } catch (error) {
    next(error);
  }
});
