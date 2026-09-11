import { useState, useEffect } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Copy, Download, Mic, Printer, ShieldCheck, Sparkles, Users, X, Zap } from 'lucide-react';
import { exportDebriefToMarkdown } from '../../voiceMetrics';
import { generateDebriefDirectly, getStoredOpenRouterKey, getStoredOpenRouterModel } from '../../openrouter';
import { apiUrl } from '../../apiConfig';
import { defaultInterviewContext, type Message } from '../../types';

export function ScoreRadialGauge({ value, label, color, grade }: { value: number; label: string; color: string; grade?: string }) {
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

export function Report({
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
