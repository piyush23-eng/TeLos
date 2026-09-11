const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '../docs/images/linkedin_pack');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Helper to wrap code in a styled Mac terminal card
function buildCodeHtml(title, subtitle, filename, badge, codeHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0c0a1f 40%, #030014 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px 40px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    
    .card-wrapper {
      width: 1100px;
      max-width: 100%;
      background: rgba(15, 17, 26, 0.85);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      box-shadow: 0 30px 90px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.15);
      overflow: hidden;
    }
    
    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: rgba(22, 27, 46, 0.7);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    .window-controls {
      display: flex;
      gap: 8px;
    }
    
    .window-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .dot-close { background: #ff5f56; }
    .dot-min { background: #ffbd2e; }
    .dot-max { background: #27c93f; }
    
    .file-tag {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #94a3b8;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    
    .file-tag .filename {
      color: #e2e8f0;
      font-weight: 600;
    }
    
    .badge {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.2);
      color: #a5b4fc;
      border: 1px solid rgba(129, 140, 248, 0.3);
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .title-banner {
      padding: 20px 28px 12px 28px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    
    .title-banner h1 {
      font-size: 20px;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.3px;
    }
    
    .title-banner p {
      font-size: 13px;
      color: #94a3b8;
    }
    
    .code-container {
      padding: 24px 28px;
      background: #090d16;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
      font-size: 13.5px;
      line-height: 1.65;
      color: #e2e8f0;
      overflow-x: auto;
    }
    
    /* Syntax colors */
    .k { color: #c084fc; font-weight: 600; } /* keyword */
    .f { color: #60a5fa; font-weight: 600; } /* function */
    .s { color: #4ade80; } /* string */
    .c { color: #64748b; font-style: italic; } /* comment */
    .n { color: #fbbf24; } /* number / boolean */
    .t { color: #38bdf8; } /* type */
    .v { color: #f43f5e; } /* variable */
    .op { color: #94a3b8; } /* operator */
    .p { color: #cbd5e1; } /* punctuation */
    
    .line-num {
      color: #334155;
      user-select: none;
      display: inline-block;
      width: 32px;
      text-align: right;
      margin-right: 16px;
    }
    
    .footer-bar {
      padding: 12px 24px;
      background: rgba(15, 23, 42, 0.9);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #64748b;
    }
    
    .logo-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #e2e8f0;
    }
    
    .logo-badge span {
      color: #818cf8;
    }
  </style>
</head>
<body>
  <div class="card-wrapper">
    <div class="header-bar">
      <div class="window-controls">
        <div class="window-dot dot-close"></div>
        <div class="window-dot dot-min"></div>
        <div class="window-dot dot-max"></div>
      </div>
      <div class="file-tag">
        <span>TeLos</span>
        <span style="color: #475569">/</span>
        <span class="filename">${filename}</span>
      </div>
      <div class="badge">${badge}</div>
    </div>
    
    <div class="title-banner">
      <h1>${title}</h1>
      <p>${subtitle}</p>
    </div>
    
    <div class="code-container">
      ${codeHtml}
    </div>
    
    <div class="footer-bar">
      <div class="logo-badge">TeLos <span>//</span> Core Architecture</div>
      <div>github.com/piyush23-eng/TeLos</div>
    </div>
  </div>
</body>
</html>`;
}

(async () => {
  console.log("🚀 Generating high-resolution launch assets...");
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: [
      '--window-size=1920,1080',
      '--no-sandbox',
      '--disable-gpu',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });

  // -------------------------------------------------------------
  // 1. CODE SNIPPET 1: Multi-Provider LLM Failover Cascade
  // -------------------------------------------------------------
  console.log("📸 Generating Code Snippet 1: Multi-Provider Failover...");
  const snippet1Code = `
<div><span class="line-num">01</span><span class="c">// ── Multi-Provider Zero-Drop Failover Cascade ────────────────────────</span></div>
<div><span class="line-num">02</span><span class="k">export async function</span> <span class="f">dispatchWithFailover</span>(context: <span class="t">InterviewContext</span>): <span class="t">Promise</span>&lt;<span class="t">string</span>&gt; {</div>
<div><span class="line-num">03</span>  <span class="c">// 1. Try Primary OpenRouter Key Pool with instant rotation on 429/402</span></div>
<div><span class="line-num">04</span>  <span class="k">for</span> (<span class="k">const</span> [index, key] <span class="k">of</span> openRouterPool.<span class="f">entries</span>()) {</div>
<div><span class="line-num">05</span>    <span class="k">for</span> (<span class="k">const</span> model <span class="k">of</span> [<span class="s">'meta-llama/llama-3.3-70b-instruct'</span>, <span class="s">'openai/gpt-4o-mini'</span>]) {</div>
<div><span class="line-num">06</span>      <span class="k">try</span> {</div>
<div><span class="line-num">07</span>        <span class="k">const</span> res = <span class="k">await</span> <span class="f">fetchOpenRouter</span>({ key, model, signal: AbortSignal.<span class="f">timeout</span>(<span class="n">5500</span>) });</div>
<div><span class="line-num">08</span>        <span class="k">if</span> (res.ok) <span class="k">return await</span> res.<span class="f">text</span>();</div>
<div><span class="line-num">09</span>        <span class="k">if</span> (res.status === <span class="n">429</span> || res.status === <span class="n">402</span>) {</div>
<div><span class="line-num">10</span>          console.<span class="f">warn</span>(<span class="s">\`[Intelligence] Key #\${index + 1} rate-limited. Rotating...\`</span>);</div>
<div><span class="line-num">11</span>          <span class="k">break</span>; <span class="c">// Rotate to next API key immediately</span></div>
<div><span class="line-num">12</span>        }</div>
<div><span class="line-num">13</span>      } <span class="k">catch</span> (err) { console.<span class="f">warn</span>(<span class="s">'OpenRouter timeout, stepping to next candidate'</span>); }</div>
<div><span class="line-num">14</span>    }</div>
<div><span class="line-num">15</span>  }</div>
<div><span class="line-num">16</span></div>
<div><span class="line-num">17</span>  <span class="c">// 2. Fallback Tier 1: Groq Ultra-Low Latency Inference (Llama 3.3 70B)</span></div>
<div><span class="line-num">18</span>  <span class="k">for</span> (<span class="k">const</span> groqKey <span class="k">of</span> groqKeys) {</div>
<div><span class="line-num">19</span>    <span class="k">const</span> response = <span class="k">await</span> <span class="f">callGroq</span>(groqKey, <span class="s">'llama-3.3-70b-versatile'</span>, context);</div>
<div><span class="line-num">20</span>    <span class="k">if</span> (response) <span class="k">return</span> response;</div>
<div><span class="line-num">21</span>  }</div>
<div><span class="line-num">22</span></div>
<div><span class="line-num">23</span>  <span class="c">// 3. Fallback Tier 2: Google Gemini Flash Engine</span></div>
<div><span class="line-num">24</span>  <span class="k">for</span> (<span class="k">const</span> geminiKey <span class="k">of</span> geminiKeys) {</div>
<div><span class="line-num">25</span>    <span class="k">const</span> response = <span class="k">await</span> <span class="f">callGemini</span>(geminiKey, <span class="s">'gemini-2.0-flash'</span>, context);</div>
<div><span class="line-num">26</span>    <span class="k">if</span> (response) <span class="k">return</span> response;</div>
<div><span class="line-num">27</span>  }</div>
<div><span class="line-num">28</span></div>
<div><span class="line-num">29</span>  <span class="c">// 4. Fallback Tier 3: Deterministic Transcript-Grounded Heuristic Synthesis</span></div>
<div><span class="line-num">30</span>  <span class="k">return</span> <span class="f">generateTranscriptGroundedResponse</span>(context.transcript);</div>
<div><span class="line-num">31</span>}</div>
  `;
  const snippet1Html = buildCodeHtml(
    "Multi-Provider LLM Failover Cascade",
    "Zero-Drop Audio & Question Continuity across OpenRouter, Groq, Gemini & Local Fallbacks",
    "server/intelligence.ts",
    "Failover Engine",
    snippet1Code
  );
  await page.setContent(snippet1Html, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: path.join(outDir, 'code-01-failover-engine.png'), fullPage: true });
  console.log("   ✓ Saved code-01-failover-engine.png");

  // -------------------------------------------------------------
  // 2. CODE SNIPPET 2: Sandboxed Code Execution Engine
  // -------------------------------------------------------------
  console.log("📸 Generating Code Snippet 2: Sandboxed Runner...");
  const snippet2Code = `
<div><span class="line-num">01</span><span class="c">// ── Sandboxed Execution & Process Isolation Engine ───────────────────</span></div>
<div><span class="line-num">02</span><span class="k">export function</span> <span class="f">safeSpawn</span>(command: <span class="t">string</span>, args: <span class="t">string[]</span>, cwd?: <span class="t">string</span>) {</div>
<div><span class="line-num">03</span>  <span class="c">// SECURITY: Completely isolate child process environment</span></div>
<div><span class="line-num">04</span>  <span class="k">const</span> minimalEnv = {</div>
<div><span class="line-num">05</span>    PATH: [<span class="s">'.jdk/bin'</span>, <span class="s">'/usr/local/bin'</span>, <span class="s">'/usr/bin'</span>, <span class="s">'/bin'</span>].<span class="f">join</span>(<span class="s">':'</span>),</div>
<div><span class="line-num">06</span>    TMPDIR: os.<span class="f">tmpdir</span>(),</div>
<div><span class="line-num">07</span>    HOME: os.<span class="f">tmpdir</span>(),</div>
<div><span class="line-num">08</span>    PYTHONDONTWRITEBYTECODE: <span class="s">'1'</span></div>
<div><span class="line-num">09</span>  };</div>
<div><span class="line-num">10</span></div>
<div><span class="line-num">11</span>  <span class="k">return</span> <span class="f">spawnSync</span>(command, args, {</div>
<div><span class="line-num">12</span>    cwd: cwd || os.<span class="f">tmpdir</span>(),</div>
<div><span class="line-num">13</span>    env: minimalEnv,</div>
<div><span class="line-num">14</span>    encoding: <span class="s">'utf8'</span>,</div>
<div><span class="line-num">15</span>    timeout: <span class="n">4000</span>,             <span class="c">// Strict 4-second timeout bounding</span></div>
<div><span class="line-num">16</span>    maxBuffer: <span class="n">5</span> * <span class="n">1024</span> * <span class="n">1024</span>, <span class="c">// 5MB stdout/stderr buffer ceiling</span></div>
<div><span class="line-num">17</span>    killSignal: <span class="s">'SIGKILL'</span>      <span class="c">// Immediate teardown on overrun</span></div>
<div><span class="line-num">18</span>  });</div>
<div><span class="line-num">19</span>}</div>
<div><span class="line-num">20</span></div>
<div><span class="line-num">21</span><span class="k">export function</span> <span class="f">checkCodeSecurity</span>(code: <span class="t">string</span>, language: <span class="t">string</span>) {</div>
<div><span class="line-num">22</span>  <span class="k">const</span> DANGEROUS_PATTERNS = [</div>
<div><span class="line-num">23</span>    <span class="s">/\\b(os|subprocess|shutil|socket|pty|ctypes)\\b/i</span>,</div>
<div><span class="line-num">24</span>    <span class="s">/\\b(rmdir|unlink|remove|system|popen|spawn|fork)\\s*\\(/i</span></div>
<div><span class="line-num">25</span>  ];</div>
<div><span class="line-num">26</span>  <span class="k">for</span> (<span class="k">const</span> pattern <span class="k">of</span> DANGEROUS_PATTERNS) {</div>
<div><span class="line-num">27</span>    <span class="k">if</span> (pattern.<span class="f">test</span>(code)) {</div>
<div><span class="line-num">28</span>      <span class="k">return</span> { safe: <span class="n">false</span>, reason: <span class="s">'Restricted system-level or socket manipulation.'</span> };</div>
<div><span class="line-num">29</span>    }</div>
<div><span class="line-num">30</span>  }</div>
<div><span class="line-num">31</span>  <span class="k">return</span> { safe: <span class="n">true</span> };</div>
<div><span class="line-num">32</span>}</div>
  `;
  const snippet2Html = buildCodeHtml(
    "Sandboxed Code Execution Engine",
    "Polyglot Runner (Python, JS/TS, Java, C++, Go) with Security Pattern Analysis & Resource Quotas",
    "server/runner.ts",
    "Security & Isolation",
    snippet2Code
  );
  await page.setContent(snippet2Html, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: path.join(outDir, 'code-02-sandboxed-runner.png'), fullPage: true });
  console.log("   ✓ Saved code-02-sandboxed-runner.png");

  // -------------------------------------------------------------
  // 3. CODE SNIPPET 3: Anti-Hallucination & Deduplication Engine
  // -------------------------------------------------------------
  console.log("📸 Generating Code Snippet 3: Dialogue Intelligence...");
  const snippet3Code = `
<div><span class="line-num">01</span><span class="c">// ── Authentic Turn-Taking & Anti-Repetition Dialogue Engine ──────────</span></div>
<div><span class="line-num">02</span><span class="k">export function</span> <span class="f">filterAndGroundFollowUp</span>(candidateReply: <span class="t">string</span>, history: <span class="t">string[]</span>): <span class="t">boolean</span> {</div>
<div><span class="line-num">03</span>  <span class="k">const</span> normalized = <span class="f">normalizeQuestion</span>(candidateReply).<span class="f">toLowerCase</span>();</div>
<div><span class="line-num">04</span></div>
<div><span class="line-num">05</span>  <span class="c">// Reject generic / lazy boilerplate follow-ups</span></div>
<div><span class="line-num">06</span>  <span class="k">const</span> GENERIC_PATTERNS = <span class="s">/can you elaborate|tell me more|what are your thoughts|why is that/i</span>;</div>
<div><span class="line-num">07</span>  <span class="k">if</span> (GENERIC_PATTERNS.<span class="f">test</span>(normalized)) <span class="k">return false</span>;</div>
<div><span class="line-num">08</span></div>
<div><span class="line-num">09</span>  <span class="c">// Jaccard similarity thresholding against previously asked questions</span></div>
<div><span class="line-num">10</span>  <span class="k">const</span> currentWords = <span class="k">new</span> <span class="t">Set</span>(normalized.<span class="f">split</span>(<span class="s">/\\W+/</span>).<span class="f">filter</span>(w =&gt; w.length &gt; <span class="n">3</span>));</div>
<div><span class="line-num">11</span>  <span class="k">for</span> (<span class="k">const</span> prev <span class="k">of</span> history) {</div>
<div><span class="line-num">12</span>    <span class="k">const</span> prevWords = <span class="k">new</span> <span class="t">Set</span>(prev.<span class="f">toLowerCase</span>().<span class="f">split</span>(<span class="s">/\\W+/</span>).<span class="f">filter</span>(w =&gt; w.length &gt; <span class="n">3</span>));</div>
<div><span class="line-num">13</span>    <span class="k">const</span> overlap = [...currentWords].<span class="f">filter</span>(w =&gt; prevWords.<span class="f">has</span>(w)).length;</div>
<div><span class="line-num">14</span>    <span class="k">const</span> union = <span class="k">new</span> <span class="t">Set</span>([...currentWords, ...prevWords]).size;</div>
<div><span class="line-num">15</span>    <span class="k">if</span> (overlap / union &gt; <span class="n">0.65</span>) {</div>
<div><span class="line-num">16</span>      <span class="k">return false</span>; <span class="c">// Semantic overlap too high — reject question loop</span></div>
<div><span class="line-num">17</span>    }</div>
<div><span class="line-num">18</span>  }</div>
<div><span class="line-num">19</span>  <span class="k">return true</span>;</div>
<div><span class="line-num">20</span>}</div>
  `;
  const snippet3Html = buildCodeHtml(
    "Turn-Taking & Anti-Repetition Engine",
    "Real-time Jaccard overlap checking and generic boilerplate rejection for authentic interview cadence",
    "server/intelligence.ts",
    "Dialogue Guardrails",
    snippet3Code
  );
  await page.setContent(snippet3Html, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: path.join(outDir, 'code-03-dialogue-guardrails.png'), fullPage: true });
  console.log("   ✓ Saved code-03-dialogue-guardrails.png");

  // -------------------------------------------------------------
  // 4. CAPTURE FRESH CLEAN UI SCREENSHOTS
  // -------------------------------------------------------------
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const dummyUser = {
    id: 'usr-aarav',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    provider: 'email',
    bio: 'Staff Systems Architect specializing in distributed consensus, low-latency messaging, and fault-tolerant cloud infrastructure.',
    linkedin: 'linkedin.com/in/aarav-sharma',
    github: 'github.com/aarav-sharma',
    experience: 'Staff Systems Architect @ Tech • 8+ years distributed systems',
    projects: 'RaftKV — Distributed Consensus Store\nEventStream — High-throughput Kafka ingestion engine'
  };

  console.log("📸 Navigating to TeLos local app...");
  await page.goto('http://127.0.0.1:8787');
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate((u) => {
    localStorage.clear();
    localStorage.setItem('telos-user', JSON.stringify(u));
    localStorage.setItem('telos-token', 'mock-valid-token');
  }, dummyUser);

  await page.reload();
  await new Promise(r => setTimeout(r, 1200));

  // 4A: Clean Green Room Lobby (verified without failover box)
  console.log("📸 Capturing Clean Interview Setup Green Room (Lobby)...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('interview'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input.brutalist-text-input'));
    if (inputs[0]) { inputs[0].value = 'Google'; inputs[0].dispatchEvent(new Event('input', { bubbles: true })); }
    if (inputs[1]) { inputs[1].value = 'Staff Systems Architect (L6)'; inputs[1].dispatchEvent(new Event('input', { bubbles: true })); }
    if (inputs[2]) { inputs[2].value = 'Distributed Consensus & Partition Recovery'; inputs[2].dispatchEvent(new Event('input', { bubbles: true })); }

    const cvBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Systems CV'));
    if (cvBtn) cvBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(outDir, 'ui-01-interview-setup-lobby.png'), fullPage: false });
  console.log("   ✓ Saved ui-01-interview-setup-lobby.png");

  // 4B: Live Interview Session with Scratchpad
  console.log("📸 Capturing Live Interview Room with Technical Scratchpad...");
  await page.evaluate(() => {
    const contBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('CONTINUE TO CAMERA'));
    if (contBtn) contBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const joinBtn = document.querySelector('.join-call-btn-refined, button[class*="join-call"]');
    if (joinBtn) joinBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    const padBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.innerText.toLowerCase().includes('scratchpad') ||
      b.innerText.toLowerCase().includes('code')
    );
    if (padBtn) padBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(outDir, 'ui-02-live-interview-studio.png'), fullPage: false });
  console.log("   ✓ Saved ui-02-live-interview-studio.png");

  // 4C: Post-Interview Debrief Scorecard
  console.log("📸 Capturing Assessment Debrief Scorecard...");
  await page.evaluate(() => {
    const endBtn = document.querySelector('.end-call-btn-refined, button[class*="end-call"]');
    if (endBtn) endBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const confirmBtn = document.querySelector('.end-call-confirm-actions .btn-confirm');
    if (confirmBtn) confirmBtn.click();
  });
  await new Promise(r => setTimeout(r, 3200));

  await page.screenshot({ path: path.join(outDir, 'ui-03-debrief-scorecard.png'), fullPage: false });
  console.log("   ✓ Saved ui-03-debrief-scorecard.png");

  // 4D: Company Prep Rubric Matrix
  console.log("📸 Capturing Company Prep Matrix...");
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.report-modal .close-modal, .close-report');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const prepBtn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.toLowerCase().includes('companies'));
    if (prepBtn) prepBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(outDir, 'ui-04-company-prep-catalog.png'), fullPage: false });
  console.log("   ✓ Saved ui-04-company-prep-catalog.png");

  await browser.close();
  console.log("🎉 All LinkedIn launch assets generated in docs/images/linkedin_pack/!");
})();
