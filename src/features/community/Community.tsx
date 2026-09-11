import { useState, useEffect, useMemo } from 'react';
import { Award, Bookmark, Briefcase, ChevronUp, MessageCircle, Search, Send, Sparkles, ThumbsUp, TrendingUp, Users, X } from 'lucide-react';
import { apiUrl } from '../../apiConfig';
import { companyPrepCatalog } from '../../companyPrepData';
import type { CommunityPost, CommunityReply, PostType } from '../../types';

export function Community() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState('All topics');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [postTypeFilter, setPostTypeFilter] = useState<'all' | PostType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<'popular' | 'newest' | 'replies' | 'helpful'>('popular');
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [upvotedPosts, setUpvotedPosts] = useState<Set<string>>(new Set());
  const [helpfulPosts, setHelpfulPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  // Composer State
  const [composerType, setComposerType] = useState<PostType>('question');
  const [author, setAuthor] = useState('TeLos User');
  const [role, setRole] = useState('SWE Candidate');
  const [targetCompany, setTargetCompany] = useState(companyPrepCatalog[0]?.name || 'Google');
  const [levelOrRound, setLevelOrRound] = useState('L4 / SDE II');
  const [outcome, setOutcome] = useState<'Offer' | 'Reject' | 'Pending' | 'N/A'>('Offer');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reply Drafts
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const topics = ['All topics', 'Interview experiences', 'DSA & algorithms', 'System design', 'Career advice', 'Mock interviews'];

  // Dynamically compute trending companies from catalog and active posts
  const trendingCompanies = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach(p => {
      if (p.company) map.set(p.company, (map.get(p.company) || 0) + 1);
    });
    const sortedActive = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(([name]) => name);
    const topCatalog = companyPrepCatalog.map(c => c.name);
    const combined = Array.from(new Set([...sortedActive, ...topCatalog])).slice(0, 14);
    return ['All', ...combined];
  }, [posts]);

  // Dynamically compute signal metrics
  const uniqueAuthorsCount = useMemo(() => {
    const set = new Set<string>();
    posts.forEach(p => {
      if (p.author) set.add(p.author);
      (p.replies || []).forEach(r => { if (r.author) set.add(r.author); });
    });
    return set.size;
  }, [posts]);

  const totalPYQsCount = useMemo(() => {
    return posts.filter(p => p.postType === 'debrief' || p.outcome || p.tags?.includes('interview experiences')).length;
  }, [posts]);

  const totalRepliesCount = useMemo(() => {
    return posts.reduce((acc, p) => acc + (p.replies?.length || 0), 0);
  }, [posts]);

  const trackedCompaniesCount = useMemo(() => {
    return new Set([...companyPrepCatalog.map(c => c.name), ...posts.map(p => p.company).filter(Boolean)]).size;
  }, [posts]);

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl('/api/community'))
      .then(r => r.json())
      .then(d => {
        if (d.posts && Array.isArray(d.posts)) {
          setPosts(d.posts);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const toggleVote = async (id: string) => {
    const isUpvoted = upvotedPosts.has(id);
    const delta = isUpvoted ? -1 : 1;
    setUpvotedPosts(prev => {
      const next = new Set(prev);
      if (isUpvoted) next.delete(id);
      else next.add(id);
      return next;
    });
    setVotes(v => ({ ...v, [id]: (v[id] || 0) + delta }));
    try {
      await fetch(apiUrl('/api/community/vote'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id, delta })
      });
    } catch {
      // offline fallback
    }
  };

  const toggleHelpful = (id: string) => {
    setHelpfulPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSaved = (id: string) => {
    setSavedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleReplies = (id: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submitReply = async (postId: string) => {
    const text = (replyDrafts[postId] || '').trim();
    if (!text) return;
    const newReply: CommunityReply = {
      id: crypto.randomUUID?.() ?? `rep-${Date.now()}`,
      author: author.trim() || 'TeLos Member',
      role: role.trim() || 'Candidate',
      message: text,
      timestamp: new Date().toISOString()
    };
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          replies: [...(p.replies || []), newReply]
        };
      }
      return p;
    }));
    setReplyDrafts(prev => ({ ...prev, [postId]: '' }));
    setExpandedReplies(prev => new Set(prev).add(postId));

    try {
      await fetch(apiUrl('/api/community/reply'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, reply: newReply })
      });
    } catch {
      // offline fallback
    }
  };

  const submitPost = async () => {
    const trimmedMsg = message.trim();
    if (!trimmedMsg) return;
    setSubmitting(true);
    const tags = [
      targetCompany.toLowerCase(),
      composerType === 'debrief' ? 'interview experiences' : composerType === 'mock' ? 'mock interviews' : activeTopic === 'All topics' ? 'dsa & algorithms' : activeTopic.toLowerCase()
    ];
    if (outcome && outcome !== 'N/A' && composerType === 'debrief') tags.push(outcome.toLowerCase());

    const newPost: CommunityPost = {
      id: crypto.randomUUID?.() ?? `post-${Date.now()}`,
      author: author.trim() || 'TeLos Candidate',
      role: role.trim() || 'Software Engineer',
      title: title.trim() || `${targetCompany} ${composerType.toUpperCase()} Discussion`,
      postType: composerType,
      company: targetCompany,
      outcome: composerType === 'debrief' ? outcome : undefined,
      level: levelOrRound.trim() || undefined,
      message: trimmedMsg,
      tags,
      timestamp: new Date().toISOString(),
      upvotes: 1,
      helpfulCount: 0,
      replies: []
    };

    try {
      const res = await fetch(apiUrl('/api/community'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [newPost, ...prev]);
      }
    } catch {
      setPosts(prev => [newPost, ...prev]);
    }

    setMessage('');
    setTitle('');
    setSubmitting(false);
  };

  const visiblePosts = useMemo(() => {
    return posts.filter(post => {
      const text = `${post.title || ''} ${post.message} ${(post.tags || []).join(' ')} ${post.author} ${post.company || ''}`.toLowerCase();
      
      const topicMatch = activeTopic === 'All topics' || 
        text.includes(activeTopic.toLowerCase().replace(' & ', ' ').replace(' experiences', ' experience'));
      
      const companyMatch = companyFilter === 'All' || 
        post.company?.toLowerCase() === companyFilter.toLowerCase() ||
        text.includes(companyFilter.toLowerCase());

      const typeMatch = postTypeFilter === 'all' || post.postType === postTypeFilter;

      const queryMatch = !searchQuery.trim() || text.includes(searchQuery.trim().toLowerCase());

      return topicMatch && companyMatch && typeMatch && queryMatch;
    }).sort((a, b) => {
      if (sort === 'newest') return +new Date(b.timestamp) - +new Date(a.timestamp);
      if (sort === 'replies') return (b.replies?.length || 0) - (a.replies?.length || 0);
      if (sort === 'helpful') return ((b.helpfulCount || 0) + (helpfulPosts.has(b.id) ? 1 : 0)) - ((a.helpfulCount || 0) + (helpfulPosts.has(a.id) ? 1 : 0));
      // popular (default)
      const scoreA = (a.upvotes || 0) + (votes[a.id] || 0) + (a.replies?.length || 0) * 2;
      const scoreB = (b.upvotes || 0) + (votes[b.id] || 0) + (b.replies?.length || 0) * 2;
      return scoreB - scoreA;
    });
  }, [posts, activeTopic, companyFilter, postTypeFilter, searchQuery, sort, votes, helpfulPosts]);

  return (
    <main className="shell community-shell">
      <section className="studio-head">
        <div>
          <p className="kicker">03 / LEARN WITH THE COMMUNITY</p>
          <h1>DISCUSS.<br /><span>GET BETTER.</span></h1>
        </div>
        <div className="session-meta">
          <b>TELOS DISCUSS HUB</b>
          <span>REAL INTERVIEW LOGS</span>
          <span>PEER MOCK INTERVIEWS</span>
        </div>
      </section>

      <div className="community-layout">
        {/* LEFT COLUMN: Structured Sidebar (Equalized Cards) */}
        <aside className="community-sidebar">
          {/* Card 1: Topics Directory */}
          <div className="community-card">
            <div className="community-card-head">
              <span>
                <Users size={12} style={{ display: 'inline', marginRight: 6 }} />
                TOPICS DIRECTORY
              </span>
              <span>{posts.length} POSTS</span>
            </div>
            <div className="community-topic-list">
              {topics.map(item => {
                const count = item === 'All topics'
                  ? posts.length
                  : posts.filter(post => `${post.message} ${(post.tags || []).join(' ')}`.toLowerCase().includes(item.toLowerCase().replace(' & ', ' ').replace(' experiences', ' experience'))).length;
                return (
                  <button
                    key={item}
                    className={`community-topic-btn ${activeTopic === item ? 'active' : ''}`}
                    onClick={() => setActiveTopic(item)}
                  >
                    <span>{item}</span>
                    <span className="community-topic-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Trending Company Scope */}
          <div className="community-card">
            <div className="community-card-head">
              <span>
                <Briefcase size={12} style={{ display: 'inline', marginRight: 6 }} />
                DISCUSS BY COMPANY
              </span>
              <span>HOT</span>
            </div>
            <div className="trending-companies-grid">
              {trendingCompanies.map(comp => (
                <button
                  key={comp}
                  className={`company-tag-pill ${companyFilter === comp ? 'active' : ''}`}
                  onClick={() => setCompanyFilter(comp)}
                >
                  {comp === 'All' ? 'All Companies' : `#${comp}`}
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Community Metrics */}
          <div className="community-card">
            <div className="community-card-head">
              <span>
                <TrendingUp size={12} style={{ display: 'inline', marginRight: 6 }} />
                COMMUNITY SIGNAL
              </span>
              <span>VERIFIED</span>
            </div>
            <div className="community-stats-grid">
              <div className="community-stat-cell">
                <span className="community-stat-val">{uniqueAuthorsCount}</span>
                <span className="community-stat-lbl">Active Contributors</span>
              </div>
              <div className="community-stat-cell">
                <span className="community-stat-val">{totalPYQsCount}</span>
                <span className="community-stat-lbl">Debriefs &amp; PYQs</span>
              </div>
              <div className="community-stat-cell">
                <span className="community-stat-val">{totalRepliesCount}</span>
                <span className="community-stat-lbl">Community Answers</span>
              </div>
              <div className="community-stat-cell">
                <span className="community-stat-val">{trackedCompaniesCount}</span>
                <span className="community-stat-lbl">Companies Tracked</span>
              </div>
            </div>
          </div>

          {/* Card 4: Signal Guidelines */}
          <div className="community-card" style={{ background: 'var(--ink)', color: '#ffffff' }}>
            <div className="community-card-head" style={{ background: '#191826', color: 'var(--mint)', borderBottomColor: 'rgba(255,255,255,0.15)' }}>
              <span>
                <Award size={12} style={{ display: 'inline', marginRight: 6 }} />
                HIGH-SIGNAL ADVICE
              </span>
              <span>STANDARDS</span>
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ margin: 0, font: '400 11.5px/1.6 Manrope, sans-serif', color: '#d8d4e4' }}>
                When posting an interview debrief, include the <strong>Company</strong>, <strong>Role/Level</strong>, <strong>Round specifications</strong>, and <strong>trade-offs asked</strong>. This helps peers give precise, actionable feedback.
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Board Header, Filter Toolbar, Composer & Discussion Feed */}
        <section className="community-board">
          {/* Header Card */}
          <div className="board-hero-card">
            <div>
              <p className="kicker">COMMUNITY FORUM / {companyFilter.toUpperCase()}</p>
              <h2>{activeTopic}</h2>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="drill-tag-badge company-tag">{companyFilter === 'All' ? 'ALL COMPANIES' : companyFilter}</span>
              <span className="drill-counter-pill">{visiblePosts.length} DISCUSSIONS</span>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="community-filter-bar">
            <div className="community-search-box">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search discussions by keyword, company, author..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, color: 'var(--muted)' }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="community-sort-tabs">
              <button
                className={`community-sort-btn ${sort === 'popular' ? 'active' : ''}`}
                onClick={() => setSort('popular')}
              >
                🔥 POPULAR
              </button>
              <button
                className={`community-sort-btn ${sort === 'newest' ? 'active' : ''}`}
                onClick={() => setSort('newest')}
              >
                ✨ NEWEST
              </button>
              <button
                className={`community-sort-btn ${sort === 'replies' ? 'active' : ''}`}
                onClick={() => setSort('replies')}
              >
                💬 MOST REPLIES
              </button>
              <button
                className={`community-sort-btn ${sort === 'helpful' ? 'active' : ''}`}
                onClick={() => setSort('helpful')}
              >
                ⭐ HELPFUL
              </button>
            </div>
          </div>

          {/* Rich Discussion Composer Card */}
          <div className="composer-card">
            <div className="composer-type-tabs">
              <button
                className={`composer-type-btn ${composerType === 'question' ? 'active' : ''}`}
                onClick={() => setComposerType('question')}
              >
                💡 QUESTION / DISCUSSION
              </button>
              <button
                className={`composer-type-btn ${composerType === 'debrief' ? 'active' : ''}`}
                onClick={() => setComposerType('debrief')}
              >
                📝 INTERVIEW DEBRIEF (PYQS)
              </button>
              <button
                className={`composer-type-btn ${composerType === 'offer' ? 'active' : ''}`}
                onClick={() => setComposerType('offer')}
              >
                💼 OFFER &amp; COMP REVIEW
              </button>
              <button
                className={`composer-type-btn ${composerType === 'mock' ? 'active' : ''}`}
                onClick={() => setComposerType('mock')}
              >
                👥 FIND MOCK PARTNER
              </button>
            </div>

            <div className="composer-body">
              <div className="composer-row-fields">
                <input
                  className="composer-field-input"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Your Name (e.g. Aria S.)"
                />
                <input
                  className="composer-field-input"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="Your Role / Target (e.g. SDE-2 Candidate)"
                />
                <select
                  className="composer-field-input"
                  value={targetCompany}
                  onChange={e => setTargetCompany(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  {companyPrepCatalog.map(comp => (
                    <option key={comp.id} value={comp.name}>{comp.name}</option>
                  ))}
                  <option value="General">General / Other</option>
                </select>
              </div>

              {composerType === 'debrief' && (
                <div className="composer-row-fields">
                  <input
                    className="composer-field-input"
                    value={levelOrRound}
                    onChange={e => setLevelOrRound(e.target.value)}
                    placeholder="Round / Level (e.g. Round 3 System Design / L4)"
                  />
                  <select
                    className="composer-field-input"
                    value={outcome}
                    onChange={e => setOutcome(e.target.value as any)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Offer">Outcome: Offer Received 🎉</option>
                    <option value="Pending">Outcome: Result Pending</option>
                    <option value="Reject">Outcome: Rejected (Shared for Learning)</option>
                    <option value="N/A">Outcome: General Round Debrief</option>
                  </select>
                  <span style={{ font: '600 10px/2.5 "DM Mono", monospace', color: 'var(--muted)' }}>
                    ✓ AUTO-TAGGED FOR COMMUNITY
                  </span>
                </div>
              )}

              <input
                className="composer-field-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Discussion Title (e.g. Google L4 Rate Limiter Round — Expected Complexity & Edge Cases)"
                style={{ fontWeight: 600 }}
              />

              <textarea
                className="composer-textarea"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={
                  composerType === 'debrief'
                    ? "Share the interview questions, edge cases discussed, behavioral prompts, and specific tips that helped you..."
                    : composerType === 'offer'
                    ? "List base salary, stock/RSUs, joining bonus, location, and your competing counter-offers..."
                    : composerType === 'mock'
                    ? "Describe your target companies, topics (DSA / LLD / System Design), and weekly availability..."
                    : "What would you like to discuss? Include company, round context, code snippets, or architecture questions."
                }
              />

              <div className="composer-footer">
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="tag-badge">#{targetCompany.toLowerCase()}</span>
                  <span className="tag-badge">#{composerType}</span>
                  {activeTopic !== 'All topics' && (
                    <span className="tag-badge">#{activeTopic.toLowerCase()}</span>
                  )}
                </div>

                <button
                  className="brand-button"
                  onClick={submitPost}
                  disabled={!message.trim() || submitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
                >
                  <Send size={13} />
                  <span>{submitting ? 'POSTING...' : 'PUBLISH DISCUSSION'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Discussion Thread Feed */}
          <div className="thread-list">
            {loading ? (
              <div className="detail-card empty-state-card" style={{ padding: 40, textAlign: 'center' }}>
                <Sparkles size={24} style={{ margin: '0 auto 12px', color: 'var(--violet)' }} />
                <h2>Loading discussions...</h2>
              </div>
            ) : visiblePosts.length === 0 ? (
              <div className="detail-card empty-state-card" style={{ padding: 40, textAlign: 'center' }}>
                <MessageCircle size={28} style={{ margin: '0 auto 12px', color: 'var(--muted)' }} />
                <h2>No discussions found for this view.</h2>
                <p>Be the first to start a conversation or share an interview experience!</p>
              </div>
            ) : (
              visiblePosts.map(post => {
                const totalVotes = (post.upvotes || 0) + (votes[post.id] || 0);
                const isUpvoted = upvotedPosts.has(post.id);
                const isHelpful = helpfulPosts.has(post.id);
                const isSaved = savedPosts.has(post.id);
                const isExpanded = expandedReplies.has(post.id);
                const repliesList = post.replies || [];

                return (
                  <article key={post.id} className="thread-item-card">
                    {/* Vote Column */}
                    <div className="thread-vote-column">
                      <button
                        className={`thread-vote-btn ${isUpvoted ? 'upvoted' : ''}`}
                        onClick={() => toggleVote(post.id)}
                        title="Upvote discussion"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <span className="thread-vote-num">{totalVotes}</span>
                    </div>

                    {/* Content Column */}
                    <div className="thread-main-column">
                      <div className="thread-header-row">
                        <div className="thread-user-info">
                          <span className="thread-user-avatar">
                            {post.author.slice(0, 1).toUpperCase()}
                          </span>
                          <div className="thread-user-titles">
                            <span className="thread-user-name">{post.author}</span>
                            <span className="thread-user-role">
                              {post.role} • {new Date(post.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {post.company && (
                            <span className="drill-tag-badge company-tag">{post.company}</span>
                          )}
                          {post.outcome && (
                            <span className={`drill-tag-badge difficulty-tag ${post.outcome === 'Offer' ? 'diff-easy' : 'diff-medium'}`}>
                              {post.outcome.toUpperCase()}
                            </span>
                          )}
                          {post.postType && post.postType !== 'question' && (
                            <span className="drill-tag-badge category-tag">{post.postType.toUpperCase()}</span>
                          )}
                        </div>
                      </div>

                      {post.title && (
                        <h3 className="thread-title">{post.title}</h3>
                      )}

                      <p className="thread-body-text">{post.message}</p>

                      <div className="thread-badges-row">
                        {post.tags?.map(tag => (
                          <span key={tag} className="tag-badge">#{tag}</span>
                        ))}
                      </div>

                      {/* Action Row */}
                      <div className="thread-actions-bar">
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <button
                            className={`thread-action-btn ${isExpanded ? 'active' : ''}`}
                            onClick={() => toggleReplies(post.id)}
                          >
                            <MessageCircle size={14} />
                            <span>{repliesList.length} {repliesList.length === 1 ? 'Reply' : 'Replies'}</span>
                          </button>

                          <button
                            className={`thread-action-btn ${isHelpful ? 'active' : ''}`}
                            onClick={() => toggleHelpful(post.id)}
                          >
                            <ThumbsUp size={13} />
                            <span>{(post.helpfulCount || 0) + (isHelpful ? 1 : 0)} Helpful</span>
                          </button>

                          <button
                            className={`thread-action-btn ${isSaved ? 'active' : ''}`}
                            onClick={() => toggleSaved(post.id)}
                          >
                            <Bookmark size={13} fill={isSaved ? 'currentColor' : 'none'} />
                            <span>{isSaved ? 'Saved' : 'Save'}</span>
                          </button>
                        </div>

                        <button
                          className="thread-action-btn"
                          onClick={() => toggleReplies(post.id)}
                          style={{ color: 'var(--ink)', fontWeight: 700 }}
                        >
                          {isExpanded ? 'Hide Replies' : '+ Reply to Thread'}
                        </button>
                      </div>

                      {/* Nested Replies Drawer */}
                      {isExpanded && (
                        <div className="nested-replies-tray">
                          {repliesList.length > 0 ? (
                            repliesList.map((rep: CommunityReply) => (
                              <div key={rep.id} className="nested-reply-item">
                                <div className="nested-reply-header">
                                  <span className="nested-reply-author">{rep.author}</span>
                                  <span className="nested-reply-role">{rep.role}</span>
                                </div>
                                <p className="nested-reply-text">{rep.message}</p>
                              </div>
                            ))
                          ) : (
                            <p style={{ margin: 0, font: '400 11.5px Manrope, sans-serif', color: 'var(--muted)' }}>
                              No replies yet. Be the first to answer!
                            </p>
                          )}

                          {/* Inline Reply Composer */}
                          <div className="nested-reply-composer">
                            <input
                              className="nested-reply-input"
                              placeholder={`Reply to ${post.author}...`}
                              value={replyDrafts[post.id] || ''}
                              onChange={e => setReplyDrafts({ ...replyDrafts, [post.id]: e.target.value })}
                              onKeyDown={e => {
                                if (e.key === 'Enter') submitReply(post.id);
                              }}
                            />
                            <button
                              className="brand-button"
                              onClick={() => submitReply(post.id)}
                              disabled={!(replyDrafts[post.id] || '').trim()}
                              style={{ padding: '6px 14px', fontSize: 10 }}
                            >
                              REPLY
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
