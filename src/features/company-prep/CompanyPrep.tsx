import { useState, useMemo } from 'react';
import { ArrowRight, BookOpen, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { companyPrepCatalog, type CompanyPrepItem } from '../../companyPrepData';

export function CompanyPrep() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'india' | 'global' | 'faang' | 'fintech' | 'service'>('all');
  const [selectedCompany, setSelectedCompany] = useState<CompanyPrepItem>(
    () => companyPrepCatalog.find(company => company.id === 'google') || companyPrepCatalog[0]
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    blueprint: true,
    rounds: true,
    questions: true,
    systemDesign: false,
    culture: false,
  });
  const [openWeeks, setOpenWeeks] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleWeek = (idx: number) => {
    setOpenWeeks(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const expandAll = () => {
    setOpenSections({
      blueprint: true,
      rounds: true,
      questions: true,
      systemDesign: true,
      culture: true,
    });
    setOpenWeeks({ 0: true, 1: true, 2: true, 3: true, 4: true, 5: true });
  };

  const collapseAll = () => {
    setOpenSections({
      blueprint: false,
      rounds: false,
      questions: false,
      systemDesign: false,
      culture: false,
    });
    setOpenWeeks({ 0: false, 1: false, 2: false, 3: false, 4: false, 5: false });
  };

  const globalIds = useMemo(() => new Set([
    'google', 'microsoft', 'amazon', 'meta', 'apple', 'netflix', 'uber', 'adobe', 
    'salesforce', 'oracle', 'linkedin', 'atlassian', 'stripe', 'bloomberg', 
    'goldman-sachs', 'jpmorgan', 'visa', 'mastercard', 'nvidia', 'servicenow', 'openai'
  ]), []);

  const filteredCompanies = useMemo(() => {
    return companyPrepCatalog.filter(company => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        company.name.toLowerCase().includes(q) ||
        company.region.toLowerCase().includes(q) ||
        company.pyqTopics.some(topic => topic.toLowerCase().includes(q)) ||
        company.sampleQuestions.some(sq => sq.toLowerCase().includes(q));

      let matchesCategory = true;
      if (activeCategory === 'global') {
        matchesCategory = globalIds.has(company.id);
      } else if (activeCategory === 'india') {
        matchesCategory = !globalIds.has(company.id);
      } else if (activeCategory === 'faang') {
        matchesCategory = company.category === 'faang';
      } else if (activeCategory === 'fintech') {
        matchesCategory = company.category === 'fintech';
      } else if (activeCategory === 'service') {
        matchesCategory = company.category === 'service-based';
      }

      return matchesQuery && matchesCategory;
    });
  }, [query, activeCategory, globalIds]);

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
            <span>{filteredCompanies.length} PLAYBOOKS MATCHING</span>
          </div>

          <label className="search-field">
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search TCS, Google, Flipkart, Swiggy, Uber, OpenAI..."
            />
          </label>

          <div className="pill-row">
            <button className={`pill-chip ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
              All ({companyPrepCatalog.length})
            </button>
            <button className={`pill-chip ${activeCategory === 'india' ? 'active' : ''}`} onClick={() => setActiveCategory('india')}>
              India Tech (26)
            </button>
            <button className={`pill-chip ${activeCategory === 'global' ? 'active' : ''}`} onClick={() => setActiveCategory('global')}>
              Global (21)
            </button>
            <button className={`pill-chip ${activeCategory === 'faang' ? 'active' : ''}`} onClick={() => setActiveCategory('faang')}>
              FAANG
            </button>
            <button className={`pill-chip ${activeCategory === 'fintech' ? 'active' : ''}`} onClick={() => setActiveCategory('fintech')}>
              Fintech
            </button>
            <button className={`pill-chip ${activeCategory === 'service' ? 'active' : ''}`} onClick={() => setActiveCategory('service')}>
              IT Services
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
              {/* ── Hero Banner Card ── */}
              <article className="detail-card hero-card">
                <div className="detail-header">
                  <div>
                    <p className="kicker">COMPANY PLAYBOOK / {selectedCompany.region}</p>
                    <h2>{selectedCompany.name}</h2>
                  </div>
                  <span className="metric-pill" style={{ background: 'var(--ink, #101018)', color: '#fff', border: '1px solid var(--ink, #101018)', fontWeight: 700, padding: '8px 14px' }}>
                    {activeRoadmap?.duration || '6-WEEK SPRINT'}
                  </span>
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

              {/* ── Quick Collapse / Expand Toolbar ── */}
              <div className="prep-collapsible-bar">
                <span className="prep-collapsible-count">
                  {Object.values(openSections).filter(Boolean).length} OF 5 SECTIONS EXPANDED
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="collapsible-ctrl-btn" onClick={expandAll}>
                    Expand All
                  </button>
                  <button type="button" className="collapsible-ctrl-btn" onClick={collapseAll}>
                    Collapse All
                  </button>
                </div>
              </div>

              {/* ── Detailed 6-Week Prep Roadmap ── */}
              {activeRoadmap && (
                <article className="detail-card roadmap-card">
                  <button
                    type="button"
                    className="panel-label collapsible-trigger"
                    onClick={() => toggleSection('blueprint')}
                    title="Click to expand / collapse 6-week blueprint"
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BookOpen size={13} /> {selectedCompany.name.toUpperCase()} 6-WEEK STEP-BY-STEP PREP BLUEPRINT
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="collapsible-tag">{activeRoadmap.duration.toUpperCase()}</span>
                      {openSections.blueprint ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {openSections.blueprint && (
                    <div className="collapsible-card-content">
                      <p className="roadmap-intro">
                        A rigorous, high-signal preparation roadmap calibrated specifically for {selectedCompany.name}'s technical bar. Follow the weekly milestones in sequence to build deep pattern mastery and interview confidence.
                      </p>

                      <div className="roadmap-weeks">
                        {activeRoadmap.weeks.map((week: any, index: number) => {
                          const isWeekOpen = openWeeks[index] ?? (index === 0);
                          return (
                            <div className="roadmap-week" key={week.label}>
                              <button
                                type="button"
                                className="week-head-row week-head-btn"
                                onClick={() => toggleWeek(index)}
                                title="Click to toggle week details"
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span className="roadmap-number">0{index + 1}</span>
                                  <strong>{week.label} / {week.focus}</strong>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ font: "700 9px 'DM Mono', monospace", color: 'var(--muted)' }}>
                                    {week.topics?.length || 0} TOPICS
                                  </span>
                                  {isWeekOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                              </button>

                              {isWeekOpen && (
                                <div className="week-body" style={{ animation: 'editorial-in 0.15s ease both' }}>
                                  <p>{week.target}</p>

                                  {week.topics && week.topics.length > 0 && (
                                    <div>
                                      <span className="week-topics-label">HIGH-PRIORITY TOPICS &amp; PATTERNS:</span>
                                      <div className="week-topics-row">
                                        {week.topics.map((t: string) => (
                                          <span key={t} className="topic-chip">✓ {t}</span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {week.deliverable && (
                                    <div className="week-deliverable">
                                      <b>MILESTONE DELIVERABLE:</b>
                                      <span>{week.deliverable}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="curated-grid" style={{ marginTop: 20 }}>
                        {activeRoadmap.curatedPrep.map((item: any) => (
                          <div className="curated-item" key={item.title}>
                            <span>CRITICAL STRATEGY</span>
                            <strong>{item.title}</strong>
                            <p>{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              )}

              {/* ── Interview Round Sequence ── */}
              <article className="detail-card">
                <button
                  type="button"
                  className="panel-label collapsible-trigger"
                  onClick={() => toggleSection('rounds')}
                  title="Click to expand / collapse rounds"
                >
                  <span>INTERVIEW ROUND SEQUENCE</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="collapsible-tag">{selectedCompany.hiringProcess.length} ROUNDS</span>
                    {openSections.rounds ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </div>
                </button>

                {openSections.rounds && (
                  <div className="collapsible-card-content">
                    <div className="info-grid" style={{ gap: 0, marginTop: 12 }}>
                      {selectedCompany.hiringProcess.map((roundText: string, idx: number) => (
                        <div className="info-card" key={idx} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          <span style={{ font: "800 18px/1 'Space Grotesk', sans-serif", color: 'var(--violet, #6e54f6)', minWidth: 28 }}>0{idx + 1}</span>
                          <div>
                            <strong>{roundText.split(':')[0]}</strong>
                            <span style={{ display: 'block', marginTop: 2 }}>{roundText.split(':')[1] || roundText}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>

              {/* ── Frequent PYQs & Sample Questions ── */}
              <article className="detail-card">
                <button
                  type="button"
                  className="panel-label collapsible-trigger"
                  onClick={() => toggleSection('questions')}
                  title="Click to expand / collapse PYQs"
                >
                  <span>FREQUENT REPEATED QUESTIONS</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="collapsible-tag">{selectedCompany.sampleQuestions?.length || 0} PYQS</span>
                    {openSections.questions ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </div>
                </button>

                {openSections.questions && (
                  <div className="collapsible-card-content">
                    <div className="info-grid" style={{ marginTop: 12 }}>
                      {selectedCompany.sampleQuestions?.map((q: string, idx: number) => (
                        <div key={idx} className="info-card" style={{ position: 'relative' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ font: "700 9px/1 'DM Mono', monospace", letterSpacing: '1px', background: '#ece8ff', color: 'var(--violet, #6e54f6)', border: '1px solid var(--ink, #101018)', padding: '3px 7px' }}>
                              PYQ #{idx + 1}
                            </span>
                            <span style={{ font: "700 8.5px/1 'DM Mono', monospace", letterSpacing: '1px', padding: '3px 7px', border: '1px solid var(--ink, #101018)', color: 'var(--ink, #101018)', background: q.toLowerCase().includes('hard') ? 'var(--coral, #f3a184)' : q.toLowerCase().includes('easy') ? 'var(--mint, #d6f4d1)' : '#f2f0ea' }}>
                              {q.toLowerCase().includes('hard') ? 'HARD' : q.toLowerCase().includes('easy') ? 'EASY' : 'MEDIUM'}
                            </span>
                          </div>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                    <div className="info-grid" style={{ marginTop: 12 }}>
                      <div className="info-card">
                        <strong>Frequent PYQ Topics</strong>
                        <span>{selectedCompany.pyqTopics.join(' • ')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </article>

              {/* ── System Design Archetypes ── */}
              {selectedCompany.systemDesignArchetypes && selectedCompany.systemDesignArchetypes.length > 0 && (
                <article className="detail-card">
                  <button
                    type="button"
                    className="panel-label collapsible-trigger"
                    onClick={() => toggleSection('systemDesign')}
                    title="Click to expand / collapse system design drills"
                  >
                    <span>COMPANY-SPECIFIC ARCHITECTURES</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="collapsible-tag">{selectedCompany.systemDesignArchetypes.length} DRILLS</span>
                      {openSections.systemDesign ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {openSections.systemDesign && (
                    <div className="collapsible-card-content">
                      <div className="info-grid" style={{ marginTop: 12 }}>
                        {selectedCompany.systemDesignArchetypes.map((arch: string, idx: number) => (
                          <div className="info-card" key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ font: "700 9px/1 'DM Mono', monospace", letterSpacing: '1px', background: 'var(--coral, #f3a184)', color: 'var(--ink, #101018)', border: '1px solid var(--ink, #101018)', padding: '3px 7px' }}>
                                SYSTEM DRILL 0{idx + 1}
                              </span>
                            </div>
                            <strong>{arch}</strong>
                            <span>Focus on component trade-offs, data models, scale calculations (QPS &amp; Storage), and failure modes.</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              )}

              {/* ── Culture & Behavioral Blueprint ── */}
              {selectedCompany.culturalValues && selectedCompany.culturalValues.length > 0 && (
                <article className="detail-card">
                  <button
                    type="button"
                    className="panel-label collapsible-trigger"
                    onClick={() => toggleSection('culture')}
                    title="Click to expand / collapse culture values"
                  >
                    <span>CULTURE &amp; LEADERSHIP VALUES</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="collapsible-tag">{selectedCompany.culturalValues.length} VALUES</span>
                      {openSections.culture ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {openSections.culture && (
                    <div className="collapsible-card-content">
                      <div className="info-grid" style={{ marginTop: 12 }}>
                        {selectedCompany.culturalValues.map((val: string, idx: number) => (
                          <div className="info-card" key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ font: "700 9px/1 'DM Mono', monospace", letterSpacing: '1px', background: 'var(--mint, #d6f4d1)', color: 'var(--ink, #101018)', border: '1px solid var(--ink, #101018)', padding: '3px 7px' }}>
                                CORE VALUE 0{idx + 1}
                              </span>
                            </div>
                            <strong>{val.split(':')[0]}</strong>
                            {val.includes(':') && <span>{val.split(':')[1]}</span>}
                          </div>
                        ))}
                      </div>

                      {selectedCompany.communityInsights && selectedCompany.communityInsights.length > 0 && (
                        <div className="info-grid" style={{ marginTop: 12 }}>
                          {selectedCompany.communityInsights.map((insight: any, idx: number) => (
                            <div className="info-card" key={idx}>
                              <strong>{insight.title}</strong>
                              <span>{insight.detail}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              )}
            </>
          ) : (
            <article className="detail-card empty-state-card">
              <p className="kicker">READY</p>
              <h2>Select a company to view the complete playbook.</h2>
              <p>Each company card surfaces the hiring process, the likely rounds, and the questions that matter most.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
